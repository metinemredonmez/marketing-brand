import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import {
  CheckoutInput,
  CheckoutResult,
  PaymentProviderAdapter,
} from "./payment-provider.interface";
import { TIERS } from "../tiers";

@Injectable()
export class StripeProvider implements PaymentProviderAdapter {
  readonly name = "stripe" as const;
  private readonly logger = new Logger(StripeProvider.name);
  private readonly stripe: Stripe | null;
  private readonly webhookSecret?: string;

  constructor(private readonly config: ConfigService) {
    const key = config.get<string>("STRIPE_SECRET_KEY");
    this.webhookSecret = config.get<string>("STRIPE_WEBHOOK_SECRET");
    if (key) {
      this.stripe = new Stripe(key);
      this.logger.log("💳 Stripe aktif");
    } else {
      this.stripe = null;
      this.logger.warn("Stripe yapılandırılmadı (STRIPE_SECRET_KEY yok)");
    }
  }

  isConfigured(): boolean {
    return this.stripe !== null;
  }

  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
    if (!this.stripe) {
      throw new Error("Stripe yapılandırılmamış");
    }

    const tier = TIERS[input.tier];
    const envKey =
      input.billingInterval === "monthly"
        ? tier.stripePriceEnvKey.monthly
        : tier.stripePriceEnvKey.yearly;
    const priceId = this.config.get<string>(envKey);
    if (!priceId) {
      throw new Error(
        `Stripe Price ID yapılandırılmadı: ${envKey} (env'e ekle)`,
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: input.userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        userId: input.userId,
        tier: input.tier,
        billingInterval: input.billingInterval,
        ...(input.metadata ?? {}),
      },
      subscription_data: {
        metadata: {
          userId: input.userId,
          tier: input.tier,
        },
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new Error("Stripe checkout URL oluşturulamadı");
    }
    return { checkoutUrl: session.url, sessionId: session.id };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    if (!this.stripe) throw new Error("Stripe yapılandırılmamış");
    await this.stripe.subscriptions.update(providerSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string): Stripe.Event {
    if (!this.stripe || !this.webhookSecret) {
      throw new Error("Stripe webhook secret yapılandırılmamış");
    }
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.webhookSecret,
    );
  }

  get client(): Stripe {
    if (!this.stripe) throw new Error("Stripe yapılandırılmamış");
    return this.stripe;
  }
}
