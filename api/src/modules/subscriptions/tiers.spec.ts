import { describe, expect, it } from "vitest";
import { amountFor, getTierPricing, TIERS } from "./tiers";

describe("subscription tiers", () => {
  it("4 tarife tanımlı", () => {
    expect(Object.keys(TIERS)).toHaveLength(4);
    expect(TIERS.founding_member.yearlyUsd).toBe(49);
    expect(TIERS.lite.yearlyUsd).toBe(99);
    expect(TIERS.pro.yearlyUsd).toBe(499);
    expect(TIERS.enterprise.yearlyUsd).toBe(2999);
  });

  it("amountFor doğru hesaplar", () => {
    expect(amountFor("pro", "yearly", "USD")).toBe(499);
    expect(amountFor("pro", "monthly", "USD")).toBe(49);
    expect(amountFor("pro", "yearly", "TRY")).toBe(19990);
    expect(amountFor("lite", "monthly", "TRY")).toBe(369);
  });

  it("enterprise 5 koltuklu", () => {
    expect(TIERS.enterprise.seats).toBe(5);
  });

  it("founding member yıllık tarife sadece", () => {
    expect(TIERS.founding_member.monthlyUsd).toBe(0);
    expect(TIERS.founding_member.yearlyUsd).toBe(49);
  });

  it("getTierPricing ile pricing alma", () => {
    const pricing = getTierPricing("pro");
    expect(pricing.tier).toBe("pro");
    expect(pricing.features.length).toBeGreaterThan(3);
  });
});
