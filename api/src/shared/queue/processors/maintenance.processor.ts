import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger, Optional } from "@nestjs/common";
import type { Job } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";
import { StripeProvider } from "../../../modules/subscriptions/providers/stripe.provider";
import { QUEUE_AI, QUEUE_MAIL } from "../queue.constants";

/**
 * Bakım job'ları — view count sync, expired publish, dunning retry.
 * AI queue'ya bağlı (concurrency 1, paralel iş yapmasın).
 */
@Processor(QUEUE_AI, { concurrency: 1 })
export class MaintenanceProcessor extends WorkerHost {
  private readonly logger = new Logger(MaintenanceProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case "daily-maintenance":
        return this.runDailyMaintenance();
      default:
        return null; // diğer AI job'ları AiProcessor'a
    }
  }

  private async runDailyMaintenance() {
    const viewsSynced = await this.syncViewCounters();
    const articlesPublished = await this.publishScheduledArticles();
    const jobsExpired = await this.expireJobs();
    this.logger.log(
      `🧹 Daily maintenance — views:${viewsSynced} publish:${articlesPublished} expire:${jobsExpired}`,
    );
    return { viewsSynced, articlesPublished, jobsExpired };
  }

  /** Redis hash → DB articles.viewCount batch sync */
  private async syncViewCounters(): Promise<number> {
    const pending = await this.redis.client.hgetall("articles:views:pending");
    const entries = Object.entries(pending);
    if (entries.length === 0) return 0;

    let synced = 0;
    for (const [articleId, count] of entries) {
      const inc = Number(count);
      if (inc <= 0) continue;
      try {
        await this.prisma.article.update({
          where: { id: articleId },
          data: { viewCount: { increment: inc } },
        });
        await this.redis.client.hdel("articles:views:pending", articleId);
        synced++;
      } catch {
        // ignore
      }
    }
    return synced;
  }

  /** scheduledAt <= now olan scheduled article'ları published yap */
  private async publishScheduledArticles(): Promise<number> {
    const result = await this.prisma.article.updateMany({
      where: {
        status: "scheduled",
        scheduledAt: { lte: new Date() },
      },
      data: { status: "published", publishedAt: new Date() },
    });
    return result.count;
  }

  /** expiresAt <= now olan job'ları expired yap */
  private async expireJobs(): Promise<number> {
    const result = await this.prisma.jobPost.updateMany({
      where: {
        status: "active",
        expiresAt: { lte: new Date() },
      },
      data: { status: "expired" },
    });
    return result.count;
  }
}

/**
 * Saatlik subscription dunning + e-posta sevkiyatı bakımı.
 * Mail queue'ya bağlı, kendi job adıyla branch.
 */
@Processor(QUEUE_MAIL, { concurrency: 1 })
export class HourlyMailProcessor extends WorkerHost {
  private readonly logger = new Logger(HourlyMailProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly stripe?: StripeProvider,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case "hourly-tasks":
        return this.runHourlyTasks();
      case "expire-jobs":
        // separate cron — başka job
        return null;
      default:
        return null; // gerçek mail job'u MailProcessor'a
    }
  }

  private async runHourlyTasks() {
    // Dunning — past_due subscription'ları retry için hazırla
    const now = new Date();
    const dueRetries = await this.prisma.subscription.findMany({
      where: {
        status: "past_due",
        nextRetryAt: { lte: now },
        failedPaymentCount: { lt: 4 }, // max 4 retry
      },
      take: 50,
    });

    let recovered = 0;
    let stillFailing = 0;

    for (const sub of dueRetries) {
      let retrySucceeded = false;

      // Sadece Stripe'a bağlı abonelikleri burada retry'larız.
      // iyzico kendi retry mantığını çalıştırır, yapılacak bir şey yok.
      if (
        this.stripe?.isConfigured() &&
        sub.provider === "stripe" &&
        sub.providerSubscriptionId
      ) {
        try {
          const stripeSub = await this.stripe.client.subscriptions.retrieve(
            sub.providerSubscriptionId,
            { expand: ["latest_invoice"] },
          );
          const latestInvoice = stripeSub.latest_invoice as
            | { id: string; status?: string }
            | string
            | null;
          const invoiceId =
            typeof latestInvoice === "string"
              ? latestInvoice
              : latestInvoice?.id;
          if (invoiceId) {
            // Stripe'a invoice'ı yeniden tahsil etmesini söyle
            const paid = await this.stripe.client.invoices.pay(invoiceId, {
              expand: ["payment_intent"],
            });
            if (paid.status === "paid") {
              retrySucceeded = true;
              await this.prisma.subscription.update({
                where: { id: sub.id },
                data: {
                  status: "active",
                  failedPaymentCount: 0,
                  nextRetryAt: null,
                },
              });
              recovered++;
              this.logger.log(
                `✅ Dunning recovery — sub ${sub.id} paid`,
              );
            }
          }
        } catch (err) {
          // Ödeme yine başarısız — counter artır, bir sonraki retry'ı planla
          this.logger.warn(
            `Dunning retry failed for sub ${sub.id}: ${
              (err as Error).message
            }`,
          );
        }
      }

      if (!retrySucceeded) {
        const days = [1, 3, 7, 14][sub.failedPaymentCount] ?? 14;
        const nextRetry = new Date();
        nextRetry.setDate(nextRetry.getDate() + days);
        const newFailedCount = sub.failedPaymentCount + 1;

        // 4. retry de başarısızsa subscription'ı canceled yap
        const willCancel = newFailedCount >= 4;

        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: willCancel
            ? {
                status: "canceled",
                canceledAt: new Date(),
                failedPaymentCount: newFailedCount,
                nextRetryAt: null,
              }
            : {
                nextRetryAt: nextRetry,
                failedPaymentCount: newFailedCount,
              },
        });
        stillFailing++;
      }
    }

    this.logger.log(
      `🔁 Hourly tasks — dunning: ${dueRetries.length}, recovered: ${recovered}, still failing: ${stillFailing}`,
    );
    return { dunningChecks: dueRetries.length, recovered, stillFailing };
  }
}
