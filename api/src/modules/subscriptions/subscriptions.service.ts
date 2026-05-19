import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  BillingInterval,
  PaymentProvider,
  SubscriptionStatus,
  SubscriptionTier,
} from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { StripeProvider } from "./providers/stripe.provider";
import { IyzicoProvider } from "./providers/iyzico.provider";
import { TIERS, amountFor } from "./tiers";

export interface CreateCheckoutInput {
  userId: string;
  userEmail: string;
  tier: SubscriptionTier;
  billingInterval: BillingInterval;
  provider: PaymentProvider;
}

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly stripe: StripeProvider,
    private readonly iyzico: IyzicoProvider,
  ) {}

  // ─── Public read ──────────────────────────────────────────

  listTiers() {
    return Object.values(TIERS).map((t) => ({
      tier: t.tier,
      name: t.name,
      description: t.description,
      monthlyUsd: t.monthlyUsd,
      yearlyUsd: t.yearlyUsd,
      monthlyTry: t.monthlyTry,
      yearlyTry: t.yearlyTry,
      features: t.features,
      seats: t.seats,
    }));
  }

  async getCurrent(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ["trialing", "active", "past_due"] },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listMine(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // ─── Checkout ─────────────────────────────────────────────

  async createCheckout(input: CreateCheckoutInput) {
    // Aktif abonelik varsa engelle
    const active = await this.getCurrent(input.userId);
    if (active) {
      throw new BadRequestException(
        "Zaten aktif bir aboneliğin var. Önce mevcut aboneliği yönet.",
      );
    }

    const webUrl =
      this.config.get<string>("WEB_URL") ?? "http://localhost:3003";
    const successUrl = `${webUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${webUrl}/premium`;

    const provider = this.pickProvider(input.provider);

    return provider.createCheckoutSession({
      userId: input.userId,
      userEmail: input.userEmail,
      tier: input.tier,
      billingInterval: input.billingInterval,
      successUrl,
      cancelUrl,
    });
  }

  // ─── Cancel ───────────────────────────────────────────────

  async cancelAtPeriodEnd(userId: string) {
    const sub = await this.getCurrent(userId);
    if (!sub) throw new NotFoundException("Aktif abonelik bulunamadı");

    if (sub.providerSubscriptionId) {
      const provider = this.pickProvider(sub.provider);
      await provider.cancelSubscription(sub.providerSubscriptionId);
    }

    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });
  }

  // ─── Webhook ingestion ────────────────────────────────────

  /**
   * Stripe webhook event'i işle.
   * Idempotent: aynı event_id 2 kere işlenmez.
   */
  async handleStripeEvent(event: {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
  }) {
    // Idempotency check
    const existing = await this.prisma.webhookEvent.findUnique({
      where: { provider_eventId: { provider: "stripe", eventId: event.id } },
    });
    if (existing?.processedAt) {
      this.logger.debug(`Webhook zaten işlendi: ${event.id}`);
      return { ok: true, idempotent: true };
    }

    const record = existing
      ? existing
      : await this.prisma.webhookEvent.create({
          data: {
            provider: "stripe",
            eventId: event.id,
            eventType: event.type,
            payload: event as unknown as object,
          },
        });

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await this.onCheckoutCompleted(event.data.object);
          break;
        case "customer.subscription.updated":
        case "customer.subscription.created":
          await this.onSubscriptionUpdated(event.data.object);
          break;
        case "customer.subscription.deleted":
          await this.onSubscriptionDeleted(event.data.object);
          break;
        case "invoice.payment_succeeded":
          await this.onPaymentSucceeded(event.data.object);
          break;
        case "invoice.payment_failed":
          await this.onPaymentFailed(event.data.object);
          break;
        default:
          this.logger.debug(`Webhook tipi işlenmedi: ${event.type}`);
      }

      await this.prisma.webhookEvent.update({
        where: { id: record.id },
        data: { processedAt: new Date() },
      });
      return { ok: true };
    } catch (err) {
      await this.prisma.webhookEvent.update({
        where: { id: record.id },
        data: { error: (err as Error).message },
      });
      throw err;
    }
  }

  // ─── Webhook handlers (Stripe) ────────────────────────────

  private async onCheckoutCompleted(obj: Record<string, unknown>) {
    const metadata = (obj.metadata as Record<string, string> | undefined) ?? {};

    // Brand wallet recharge — inline credit (BrandWalletService injection
    // circular dep yaratacağı için doğrudan prisma kullanıyoruz)
    if (metadata.type === "brand_wallet_recharge") {
      const brandAccountId = metadata.brandAccountId;
      const amountTry = Number(metadata.amountTry);
      if (!brandAccountId || !amountTry) {
        this.logger.warn("brand_wallet_recharge: metadata eksik");
        return;
      }
      const wallet = await this.prisma.brandWallet.findUnique({
        where: { brandAccountId },
      });
      if (!wallet) {
        this.logger.warn(`brand wallet bulunamadı: ${brandAccountId}`);
        return;
      }
      const balanceBefore = Number(wallet.balanceTry);
      const balanceAfter = balanceBefore + amountTry;
      const stripePaymentId = obj.payment_intent as string | undefined;

      await this.prisma.$transaction([
        this.prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "recharge",
            amountTry,
            balanceBefore,
            balanceAfter,
            description: `Stripe yükleme — ${amountTry.toLocaleString("tr-TR")} TL`,
            stripePaymentId,
          },
        }),
        this.prisma.brandWallet.update({
          where: { id: wallet.id },
          data: {
            balanceTry: balanceAfter,
            totalRechargedTry:
              Number(wallet.totalRechargedTry) + amountTry,
          },
        }),
      ]);

      this.logger.log(
        `💳 Brand wallet recharge: ${brandAccountId} +${amountTry} TL`,
      );
      return;
    }

    const userId = metadata.userId;
    const tier = metadata.tier as SubscriptionTier | undefined;
    const billingInterval = metadata.billingInterval as
      | BillingInterval
      | undefined;
    if (!userId || !tier || !billingInterval) {
      this.logger.warn(
        `checkout.session.completed: metadata eksik (${JSON.stringify(metadata)})`,
      );
      return;
    }

    await this.prisma.subscription.upsert({
      where: {
        providerSubscriptionId:
          (obj.subscription as string | undefined) ?? `temp-${Date.now()}`,
      },
      update: {
        status: "active",
        startedAt: new Date(),
      },
      create: {
        userId,
        tier,
        billingInterval,
        status: "active",
        provider: "stripe",
        providerCustomerId: obj.customer as string | undefined,
        providerSubscriptionId: obj.subscription as string,
        amountUsd: amountFor(tier, billingInterval, "USD"),
        amountTry: amountFor(tier, billingInterval, "TRY"),
        currency: "USD",
        startedAt: new Date(),
      },
    });
  }

  private async onSubscriptionUpdated(obj: Record<string, unknown>) {
    const subId = obj.id as string;
    const status = this.mapStripeStatus(obj.status as string);
    const periodStart = obj.current_period_start as number | undefined;
    const periodEnd = obj.current_period_end as number | undefined;
    const cancelAtPeriodEnd = obj.cancel_at_period_end as boolean | undefined;

    await this.prisma.subscription.updateMany({
      where: { providerSubscriptionId: subId },
      data: {
        status,
        currentPeriodStart: periodStart
          ? new Date(periodStart * 1000)
          : undefined,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
        cancelAtPeriodEnd,
      },
    });
  }

  private async onSubscriptionDeleted(obj: Record<string, unknown>) {
    const subId = obj.id as string;
    await this.prisma.subscription.updateMany({
      where: { providerSubscriptionId: subId },
      data: {
        status: "expired",
        canceledAt: new Date(),
      },
    });
  }

  private async onPaymentSucceeded(obj: Record<string, unknown>) {
    const subId = obj.subscription as string | undefined;
    const amountTotal = (obj.amount_paid as number) / 100;
    const currency = (obj.currency as string)?.toUpperCase() ?? "USD";

    if (!subId) return;
    const sub = await this.prisma.subscription.findFirst({
      where: { providerSubscriptionId: subId },
    });
    if (!sub) return;

    await this.prisma.payment.create({
      data: {
        subscriptionId: sub.id,
        userId: sub.userId,
        provider: "stripe",
        providerPaymentId: obj.payment_intent as string | undefined,
        providerInvoiceId: obj.id as string,
        amount: amountTotal,
        currency,
        status: "succeeded",
        paidAt: new Date(),
      },
    });

    // Dunning state'i temizle
    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        failedPaymentCount: 0,
        lastPaymentError: null,
        nextRetryAt: null,
        status: "active",
      },
    });
  }

  private async onPaymentFailed(obj: Record<string, unknown>) {
    const subId = obj.subscription as string | undefined;
    if (!subId) return;
    const sub = await this.prisma.subscription.findFirst({
      where: { providerSubscriptionId: subId },
    });
    if (!sub) return;

    const errorMessage =
      (obj.last_finalization_error as { message?: string } | undefined)
        ?.message ?? "Ödeme başarısız";

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "past_due",
        failedPaymentCount: sub.failedPaymentCount + 1,
        lastPaymentError: errorMessage.slice(0, 500),
      },
    });

    await this.prisma.payment.create({
      data: {
        subscriptionId: sub.id,
        userId: sub.userId,
        provider: "stripe",
        amount: ((obj.amount_due as number) ?? 0) / 100,
        currency: ((obj.currency as string) ?? "USD").toUpperCase(),
        status: "failed",
        errorMessage: errorMessage.slice(0, 500),
      },
    });
  }

  private mapStripeStatus(status: string): SubscriptionStatus {
    switch (status) {
      case "trialing":
        return "trialing";
      case "active":
        return "active";
      case "past_due":
        return "past_due";
      case "canceled":
      case "incomplete_expired":
        return "expired";
      case "paused":
        return "paused";
      case "unpaid":
        return "past_due";
      default:
        return "active";
    }
  }

  private pickProvider(provider: PaymentProvider) {
    if (provider === "stripe") return this.stripe;
    if (provider === "iyzico") return this.iyzico;
    throw new BadRequestException(`Provider desteklenmiyor: ${provider}`);
  }
}
