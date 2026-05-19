import { SubscriptionTier, BillingInterval } from "@prisma/client";

export interface CheckoutInput {
  userId: string;
  userEmail: string;
  tier: SubscriptionTier;
  billingInterval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  checkoutUrl: string;
  sessionId: string;
}

export interface PaymentProviderAdapter {
  readonly name: "stripe" | "iyzico" | "manual";
  isConfigured(): boolean;
  createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
  verifyWebhookSignature(rawBody: Buffer, signature: string): unknown;
}
