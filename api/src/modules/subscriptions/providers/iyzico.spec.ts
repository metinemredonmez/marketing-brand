import { describe, it, expect, beforeEach } from "vitest";
import { ConfigService } from "@nestjs/config";
import * as crypto from "node:crypto";
import { IyzicoProvider } from "./iyzico.provider";

/**
 * iyzico provider tests — gerçek HTTP yapmıyoruz, sadece
 * deterministik signature + webhook verify logic'i.
 */
describe("IyzicoProvider", () => {
  let provider: IyzicoProvider;
  const apiKey = "sandbox-abc";
  const secretKey = "sandbox-xyz";

  beforeEach(() => {
    const cfg = new ConfigService({
      IYZICO_API_KEY: apiKey,
      IYZICO_SECRET_KEY: secretKey,
      IYZICO_BASE_URL: "https://sandbox-api.iyzipay.com",
    });
    provider = new IyzicoProvider(cfg);
  });

  it("isConfigured() iki key varsa true", () => {
    expect(provider.isConfigured()).toBe(true);
  });

  it("isConfigured() key yoksa false", () => {
    const noKey = new IyzicoProvider(new ConfigService({}));
    expect(noKey.isConfigured()).toBe(false);
  });

  describe("verifyWebhookSignature", () => {
    it("doğru imzayı kabul eder", () => {
      const body = {
        iyziEventType: "subscription.created",
        iyziPaymentId: "PAY-123",
        iyziReferenceCode: "REF-456",
      };
      const raw = Buffer.from(JSON.stringify(body));
      const sig = crypto
        .createHash("sha256")
        .update(
          secretKey +
            body.iyziEventType +
            body.iyziPaymentId +
            body.iyziReferenceCode,
        )
        .digest("base64");

      const parsed = provider.verifyWebhookSignature(raw, sig);
      expect(parsed).toBeTruthy();
      expect((parsed as { iyziEventType: string }).iyziEventType).toBe(
        "subscription.created",
      );
    });

    it("yanlış imzayı reddeder", () => {
      const body = {
        iyziEventType: "subscription.created",
        iyziPaymentId: "PAY-123",
        iyziReferenceCode: "REF-456",
      };
      const raw = Buffer.from(JSON.stringify(body));
      expect(() =>
        provider.verifyWebhookSignature(raw, "WRONG_SIGNATURE"),
      ).toThrow(/signature uyuşmuyor/);
    });

    it("geçersiz JSON reddeder", () => {
      expect(() =>
        provider.verifyWebhookSignature(Buffer.from("not json"), "x"),
      ).toThrow(/geçersiz JSON/);
    });
  });

  it("createCheckoutSession plan ref yoksa fail eder", async () => {
    await expect(
      provider.createCheckoutSession({
        userId: "u1",
        userEmail: "test@test.com",
        tier: "pro" as never,
        billingInterval: "yearly" as never,
        successUrl: "https://example.com/ok",
        cancelUrl: "https://example.com/cancel",
      }),
    ).rejects.toThrow(/pricing plan referansı yok/);
  });
});
