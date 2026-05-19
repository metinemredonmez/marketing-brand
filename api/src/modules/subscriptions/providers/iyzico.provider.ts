import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "node:crypto";
import {
  CheckoutInput,
  CheckoutResult,
  PaymentProviderAdapter,
} from "./payment-provider.interface";

/**
 * iyzico subscription entegrasyonu — IYZWSv2 auth ile gerçek REST çağrıları.
 *
 * Docs: https://dev.iyzipay.com/tr/api/abonelik
 *
 * Pricing plan reference code'ları iyzico panelinden alınır ve env'e yazılır:
 *   IYZICO_PLAN_PRO_MONTHLY, IYZICO_PLAN_PRO_YEARLY, ...
 *
 * Webhook için iyzico paneldeki "Subscription Webhook URL"
 * /api/v1/subscriptions/webhook/iyzico endpoint'imize bağlanmalı.
 */
@Injectable()
export class IyzicoProvider implements PaymentProviderAdapter {
  readonly name = "iyzico" as const;
  private readonly logger = new Logger(IyzicoProvider.name);
  private readonly apiKey?: string;
  private readonly secretKey?: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = config.get<string>("IYZICO_API_KEY");
    this.secretKey = config.get<string>("IYZICO_SECRET_KEY");
    this.baseUrl = config.get<string>(
      "IYZICO_BASE_URL",
      "https://sandbox-api.iyzipay.com",
    );
    if (this.isConfigured()) {
      this.logger.log(`💳 iyzico aktif (${this.baseUrl})`);
    } else {
      this.logger.warn("iyzico yapılandırılmadı");
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.secretKey);
  }

  // ──────────────────────────── Public API

  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
    this.assertConfigured();

    const planRefCode = this.lookupPlanRef(input.tier, input.billingInterval);
    if (!planRefCode) {
      throw new BadRequestException(
        `iyzico pricing plan referansı yok: ${input.tier}/${input.billingInterval}. ` +
          `Env'de IYZICO_PLAN_${input.tier.toUpperCase()}_${input.billingInterval.toUpperCase()} tanımla.`,
      );
    }

    const conversationId = crypto.randomUUID();
    const body = {
      locale: "tr",
      conversationId,
      pricingPlanReferenceCode: planRefCode,
      callbackUrl: input.successUrl,
      customer: {
        name: input.userEmail.split("@")[0],
        surname: "Müşteri",
        identityNumber: "11111111111",
        email: input.userEmail,
        gsmNumber: "+905555555555",
        billingAddress: {
          contactName: input.userEmail,
          city: "İstanbul",
          country: "Turkey",
          address: "Adres beyan edilmedi",
          zipCode: "34000",
        },
        shippingAddress: {
          contactName: input.userEmail,
          city: "İstanbul",
          country: "Turkey",
          address: "Adres beyan edilmedi",
          zipCode: "34000",
        },
      },
    };

    const res = await this.request<{
      status: string;
      token: string;
      tokenExpireTime?: number;
      errorCode?: string;
      errorMessage?: string;
      paymentPageUrl?: string;
    }>("POST", "/v2/subscription/checkoutform/initialize", body);

    if (res.status !== "success") {
      throw new BadRequestException(
        `iyzico checkout başlatılamadı: ${res.errorCode ?? "?"} - ${res.errorMessage ?? "?"}`,
      );
    }

    return {
      checkoutUrl: res.paymentPageUrl ?? "",
      sessionId: res.token,
    };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    this.assertConfigured();
    const res = await this.request<{
      status: string;
      errorCode?: string;
      errorMessage?: string;
    }>(
      "POST",
      `/v2/subscription/subscriptions/${encodeURIComponent(
        providerSubscriptionId,
      )}/cancel`,
      { locale: "tr", conversationId: crypto.randomUUID() },
    );
    if (res.status !== "success") {
      throw new BadRequestException(
        `iyzico cancel hatası: ${res.errorCode} - ${res.errorMessage}`,
      );
    }
  }

  /**
   * iyzico webhook payload'unu doğrular.
   * Signature: base64(sha256(secretKey + iyziEventType + iyziPaymentId + iyziReferenceCode))
   */
  verifyWebhookSignature(rawBody: Buffer, signature: string): unknown {
    this.assertConfigured();
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody.toString("utf8")) as Record<
        string,
        unknown
      >;
    } catch {
      throw new BadRequestException("iyzico webhook geçersiz JSON");
    }
    const eventType = String(payload.iyziEventType ?? "");
    const paymentId = String(payload.iyziPaymentId ?? "");
    const referenceCode = String(payload.iyziReferenceCode ?? "");

    const expected = crypto
      .createHash("sha256")
      .update(this.secretKey! + eventType + paymentId + referenceCode)
      .digest("base64");

    if (!this.timingSafeEqual(expected, signature)) {
      throw new BadRequestException("iyzico webhook signature uyuşmuyor");
    }
    return payload;
  }

  // ──────────────────────────── Internal helpers

  private assertConfigured() {
    if (!this.isConfigured()) {
      throw new BadRequestException(
        "iyzico yapılandırılmamış (IYZICO_API_KEY/IYZICO_SECRET_KEY)",
      );
    }
  }

  private lookupPlanRef(tier: string, interval: string): string | undefined {
    const key = `IYZICO_PLAN_${tier.toUpperCase()}_${interval.toUpperCase()}`;
    return this.config.get<string>(key);
  }

  /**
   * IYZWSv2 auth ile iyzico REST çağrısı.
   *
   * payloadToSign = randomKey + uri + jsonBody
   * signature = hex(hmac_sha256(secretKey, payloadToSign))
   * authString = "apiKey:<key>&randomKey:<rnd>&signature:<sig>"
   * Authorization: IYZWSv2 base64(authString)
   */
  private async request<T>(
    method: "GET" | "POST",
    uri: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    const randomKey = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    const jsonBody = JSON.stringify(body);
    const payloadToSign = randomKey + uri + jsonBody;
    const signature = crypto
      .createHmac("sha256", this.secretKey!)
      .update(payloadToSign)
      .digest("hex");
    const authString = `apiKey:${this.apiKey}&randomKey:${randomKey}&signature:${signature}`;
    const authorization = `IYZWSv2 ${Buffer.from(authString).toString("base64")}`;

    const res = await fetch(`${this.baseUrl}${uri}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        "x-iyzi-rnd": randomKey,
      },
      body: method === "POST" ? jsonBody : undefined,
    });

    let parsed: T;
    try {
      parsed = (await res.json()) as T;
    } catch {
      const txt = await res.text().catch(() => "");
      throw new BadRequestException(
        `iyzico geçersiz cevap (${res.status}): ${txt.slice(0, 200)}`,
      );
    }
    if (!res.ok) {
      this.logger.warn(
        `iyzico ${method} ${uri} → ${res.status}: ${JSON.stringify(parsed).slice(0, 300)}`,
      );
    }
    return parsed;
  }

  private timingSafeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
  }
}
