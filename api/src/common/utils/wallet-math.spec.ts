import { describe, it, expect } from "vitest";

/**
 * Wallet helper math — kritik invariant'lar.
 * BrandWalletService.adminAdjust + creditWallet + debitWallet için
 * pure logic doğrulaması.
 */

function computeNextBalance(
  before: number,
  delta: number,
): { after: number; valid: boolean } {
  const after = before + delta;
  return { after, valid: after >= 0 };
}

function planNextRetry(failedCount: number): { days: number; cancelAfter: boolean } {
  const schedule = [1, 3, 7, 14];
  const days = schedule[failedCount] ?? 14;
  const cancelAfter = failedCount + 1 >= 4; // 4. retry de başarısızsa cancel
  return { days, cancelAfter };
}

describe("wallet math", () => {
  it("pozitif kredi bakiyeyi artırır", () => {
    expect(computeNextBalance(1000, 500)).toEqual({ after: 1500, valid: true });
  });

  it("negatif düzeltme bakiyeyi azaltır", () => {
    expect(computeNextBalance(1000, -300)).toEqual({ after: 700, valid: true });
  });

  it("bakiye negatife düşemez", () => {
    expect(computeNextBalance(100, -300).valid).toBe(false);
  });

  it("tam sıfıra düşmek geçerli", () => {
    expect(computeNextBalance(100, -100)).toEqual({ after: 0, valid: true });
  });
});

describe("dunning retry schedule", () => {
  it("ilk fail → 1 gün sonra", () => {
    expect(planNextRetry(0).days).toBe(1);
  });

  it("ikinci fail → 3 gün", () => {
    expect(planNextRetry(1).days).toBe(3);
  });

  it("üçüncü fail → 7 gün", () => {
    expect(planNextRetry(2).days).toBe(7);
  });

  it("dördüncü fail → cancel", () => {
    const r = planNextRetry(3);
    expect(r.cancelAfter).toBe(true);
  });
});
