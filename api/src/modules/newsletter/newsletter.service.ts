import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ArticleStatus,
  NewsletterIssueStatus,
  Prisma,
} from "@prisma/client";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { EmailService } from "../../shared/mail/email.service";
import { QueueService } from "../../shared/queue/queue.service";
import { AiService } from "../ai/ai.service";
import { uniqueSlug } from "../../common/utils/slug";

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: EmailService,
    private readonly queue: QueueService,
    private readonly config: ConfigService,
    private readonly ai: AiService,
  ) {}

  // ─── Subscriber yönetimi ──────────────────────────────────

  async subscribe(input: {
    email: string;
    fullName?: string;
    segments?: string[];
    source?: string;
    ipAddress?: string;
  }) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing && existing.status === "confirmed") {
      return { ok: true, status: "already_subscribed" };
    }

    const token = randomBytes(24).toString("hex");
    const subscriber = existing
      ? await this.prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            status: "pending",
            confirmToken: createHash("sha256").update(token).digest("hex"),
            fullName: input.fullName ?? existing.fullName,
            segments: input.segments ?? existing.segments,
            source: input.source ?? existing.source,
            ipAddress: input.ipAddress?.slice(0, 45) ?? existing.ipAddress,
          },
        })
      : await this.prisma.newsletterSubscriber.create({
          data: {
            email: input.email.toLowerCase(),
            fullName: input.fullName,
            segments: input.segments ?? ["haftalik_ozet"],
            source: input.source,
            ipAddress: input.ipAddress?.slice(0, 45),
            confirmToken: createHash("sha256").update(token).digest("hex"),
          },
        });

    // Double opt-in mail (queue üzerinden)
    const apiUrl =
      this.config.get<string>("APP_URL") ?? "http://localhost:4000";
    const confirmLink = `${apiUrl}/api/v1/newsletter/confirm?token=${token}`;

    await this.queue.enqueueMail({
      to: subscriber.email,
      subject: "MarkaRadar — Abonelik onayı",
      html: this.confirmEmailHtml(
        subscriber.fullName ?? "merhaba",
        confirmLink,
      ),
      text: `Aboneliğini onaylamak için: ${confirmLink}`,
    });

    return { ok: true, status: "confirmation_sent" };
  }

  async confirm(rawToken: string) {
    const hash = createHash("sha256").update(rawToken).digest("hex");
    const sub = await this.prisma.newsletterSubscriber.findFirst({
      where: { confirmToken: hash, status: "pending" },
    });
    if (!sub) {
      throw new BadRequestException("Geçersiz veya kullanılmış token");
    }
    await this.prisma.newsletterSubscriber.update({
      where: { id: sub.id },
      data: {
        status: "confirmed",
        confirmedAt: new Date(),
        confirmToken: null,
      },
    });
    return {
      ok: true,
      message:
        "Aboneliğin onaylandı. Yarın 08:30'da ilk 'Pazarlama 5' bültenin gelecek.",
    };
  }

  async unsubscribe(email: string) {
    const sub = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!sub) return { ok: true };
    await this.prisma.newsletterSubscriber.update({
      where: { id: sub.id },
      data: { status: "unsubscribed", unsubscribedAt: new Date() },
    });
    return { ok: true };
  }

  countConfirmed(): Promise<number> {
    return this.prisma.newsletterSubscriber.count({
      where: { status: "confirmed" },
    });
  }

  // ─── Issue compose + send ─────────────────────────────────

  /**
   * Günlük "Pazarlama 5" otomatik compose:
   * - Son 24 saatte yayınlanan en yüksek viewCount'lı 5-10 makale al
   * - AI ile newsletter formatına dönüştür
   * - Draft olarak kaydet
   */
  async composeDailyDigest(): Promise<{ issueId: string; subject: string }> {
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const articles = await this.prisma.article.findMany({
      where: {
        status: ArticleStatus.published,
        publishedAt: { gte: since },
        deletedAt: null,
      },
      orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
      take: 10,
      select: {
        id: true,
        slug: true,
        title: true,
        spot: true,
        aiSummary: true,
        category: { select: { name: true } },
      },
    });

    if (articles.length === 0) {
      throw new BadRequestException(
        "Son 24 saatte yayınlanan makale yok, digest oluşturulamadı",
      );
    }

    // AI'ya yapılandırılmış JSON ver
    const sourceJson = JSON.stringify(
      articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        spot: a.spot,
        summary: a.aiSummary,
        category: a.category?.name,
      })),
      null,
      2,
    );

    let aiData: Record<string, unknown> = {};
    try {
      const aiOutput = await this.ai.generate({
        generationType: "ai_summary",
        vars: { article_body: sourceJson },
      });
      aiData = aiOutput.data as Record<string, unknown>;
    } catch (e) {
      this.logger.warn(`AI digest compose başarısız: ${(e as Error).message}`);
    }

    const dateStr = new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
    });
    const subject = `Pazarlama 5 — ${dateStr}`;
    const slug = await uniqueSlug(
      `pazarlama-5-${new Date().toISOString().slice(0, 10)}`,
      async (s) =>
        !!(await this.prisma.newsletterIssue.findUnique({ where: { slug: s } })),
    );

    const html = this.buildDailyDigestHtml({
      subject,
      dateStr,
      articles: articles.map((a) => ({
        title: a.title,
        spot: a.spot ?? "",
        slug: a.slug,
        category: a.category?.name,
      })),
      aiTakeaway:
        Array.isArray((aiData as { brand_takeaways?: string[] }).brand_takeaways)
          ? ((aiData as { brand_takeaways: string[] }).brand_takeaways[0] ?? "")
          : "",
    });

    const issue = await this.prisma.newsletterIssue.create({
      data: {
        slug,
        subject,
        preheader: articles[0]?.spot?.slice(0, 150),
        contentHtml: html,
        contentJson: { articles, aiData } as Prisma.InputJsonValue,
        segments: ["haftalik_ozet"],
        status: NewsletterIssueStatus.draft,
      },
    });

    return { issueId: issue.id, subject };
  }

  async scheduleIssue(issueId: string, when: Date) {
    return this.prisma.newsletterIssue.update({
      where: { id: issueId },
      data: { scheduledAt: when, status: "scheduled" },
    });
  }

  /**
   * Issue'yu tüm hedef abonelere gönder (BullMQ mail queue üzerinden).
   * Büyük listede chunk'la, rate limit aşmasın.
   */
  async sendIssue(issueId: string): Promise<{
    issueId: string;
    enqueued: number;
  }> {
    const issue = await this.prisma.newsletterIssue.findUnique({
      where: { id: issueId },
    });
    if (!issue) throw new NotFoundException("Issue bulunamadı");
    if (issue.status === "sent") {
      throw new BadRequestException("Issue zaten gönderildi");
    }

    await this.prisma.newsletterIssue.update({
      where: { id: issueId },
      data: { status: "sending" },
    });

    // Hedef abone seti
    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      where: {
        status: "confirmed",
        ...(issue.segments.length > 0
          ? { segments: { hasSome: issue.segments } }
          : {}),
      },
      select: { id: true, email: true, fullName: true },
    });

    let enqueued = 0;
    for (const sub of subscribers) {
      const unsubLink = `${this.config.get("APP_URL")}/api/v1/newsletter/unsubscribe?email=${encodeURIComponent(sub.email)}`;
      const html = issue.contentHtml.replace(
        "{{unsubscribe_link}}",
        unsubLink,
      );
      await this.queue.enqueueMail({
        to: sub.email,
        subject: issue.subject,
        html,
      });
      enqueued++;
    }

    await this.prisma.newsletterIssue.update({
      where: { id: issueId },
      data: {
        status: "sent",
        sentAt: new Date(),
        totalRecipients: subscribers.length,
        totalSent: enqueued,
      },
    });

    this.logger.log(
      `📨 Newsletter '${issue.subject}' — ${enqueued} kuyruğa eklendi`,
    );

    return { issueId, enqueued };
  }

  // ─── HTML templates ───────────────────────────────────────

  private confirmEmailHtml(name: string, link: string): string {
    return `<!doctype html>
<html><body style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
  <h1 style="color: #0a1f4a; font-size: 22px;">Bir adım kaldı — aboneliğini onayla</h1>
  <p>Selam ${name},</p>
  <p>MarkaRadar "Pazarlama 5" günlük bülteni için aboneliğini onaylamak üzeresin.</p>
  <p style="margin: 24px 0;">
    <a href="${link}" style="background: #1e40af; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Aboneliği onayla</a>
  </p>
  <p style="font-size: 13px; color: #64748b;">Onaylarsan, yarın 08:30'da Türkiye'nin pazarlama gündemini 5 dakikada okuyacaksın.</p>
  <p style="font-size: 12px; color: #94a3b8;">MarkaRadar · Türkiye'nin AI-native pazarlama medyası</p>
</body></html>`;
  }

  private buildDailyDigestHtml(input: {
    subject: string;
    dateStr: string;
    articles: { title: string; spot: string; slug: string; category?: string }[];
    aiTakeaway: string;
  }): string {
    const siteUrl =
      this.config.get<string>("WEB_URL") ?? "http://localhost:3003";

    const articleHtml = input.articles
      .slice(0, 5)
      .map(
        (a, i) => `
      <div style="margin: 20px 0; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
        ${a.category ? `<div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #1e40af;">${a.category}</div>` : ""}
        <h3 style="margin: 6px 0 8px; font-size: ${i === 0 ? "20px" : "16px"}; color: #0a1f4a;">
          <a href="${siteUrl}/haber/${a.slug}" style="color: #0a1f4a; text-decoration: none;">${a.title}</a>
        </h3>
        <p style="margin: 0; color: #475569; line-height: 1.5;">${a.spot}</p>
        <a href="${siteUrl}/haber/${a.slug}" style="display: inline-block; margin-top: 8px; color: #1e40af; font-size: 14px; text-decoration: none;">Devamını oku →</a>
      </div>`,
      )
      .join("\n");

    return `<!doctype html>
<html><body style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; color: #0f172a; background: #fff;">
  <div style="padding: 24px; background: linear-gradient(135deg, #0a1f4a, #1e40af); color: white;">
    <div style="font-size: 12px; opacity: 0.85; text-transform: uppercase; letter-spacing: 1px;">PAZARLAMA 5 · ${input.dateStr}</div>
    <h1 style="margin: 8px 0 0; font-size: 24px;">Bugünün pazarlama gündemi</h1>
  </div>
  <div style="padding: 24px;">
    ${articleHtml}
    ${input.aiTakeaway ? `
    <div style="margin-top: 24px; padding: 16px; background: #eff6ff; border-left: 4px solid #1e40af; border-radius: 4px;">
      <div style="font-size: 11px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">Markalar için</div>
      <p style="margin: 6px 0 0; color: #0f172a;">${input.aiTakeaway}</p>
    </div>` : ""}
  </div>
  <div style="padding: 16px 24px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8;">
    <p style="margin: 0 0 4px;">MarkaRadar · Türkiye'nin AI-native pazarlama medyası</p>
    <a href="{{unsubscribe_link}}" style="color: #94a3b8;">Abonelikten ayrıl</a>
  </div>
</body></html>`;
  }
}
