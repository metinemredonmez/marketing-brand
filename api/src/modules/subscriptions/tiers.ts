import { SubscriptionTier, BillingInterval } from "@prisma/client";

/**
 * Tarife tanımları — kurucu kaynağı.
 * Stripe/iyzico Product/Price ID'leri env'de tutulur (provider'a göre).
 *
 * Yıllık fiyatlar:
 *   Founding Member: $49/yr  (ilk 200 üye, lifetime price lock)
 *   Lite:            $99/yr
 *   Pro:             $499/yr (+ CMO Club Slack)
 *   Enterprise:      $2999/yr (5 koltuk)
 */
export interface TierPricing {
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyUsd: number;
  yearlyUsd: number;
  monthlyTry: number;
  yearlyTry: number;
  features: string[];
  seats: number;
  /** Stripe Price ID env key */
  stripePriceEnvKey: { monthly: string; yearly: string };
  /** iyzico subscription plan code env key */
  iyzicoPlanEnvKey: { monthly: string; yearly: string };
}

export const TIERS: Record<SubscriptionTier, TierPricing> = {
  founding_member: {
    tier: "founding_member",
    name: "Founding Member",
    description:
      "İlk 200 destekçi — ömür boyu fiyat kilidi. Pro tüm avantajları + lansman dönemi rozeti.",
    monthlyUsd: 0,
    yearlyUsd: 49,
    monthlyTry: 0,
    yearlyTry: 1990,
    features: [
      "Pro tier tüm özellikleri",
      "Lifetime $49/yıl fiyat kilidi",
      "Founding Member LinkedIn rozeti",
      "Kurucu ile direkt Slack kanalı",
      "Ürün roadmap'inde oy hakkı",
    ],
    seats: 1,
    stripePriceEnvKey: {
      monthly: "STRIPE_PRICE_FOUNDING_MONTHLY",
      yearly: "STRIPE_PRICE_FOUNDING_YEARLY",
    },
    iyzicoPlanEnvKey: {
      monthly: "IYZICO_PLAN_FOUNDING_MONTHLY",
      yearly: "IYZICO_PLAN_FOUNDING_YEARLY",
    },
  },

  lite: {
    tier: "lite",
    name: "MarkaRadar+ Lite",
    description: "Premium deep dive + rapor arşivi + reklamsız okuma.",
    monthlyUsd: 9,
    yearlyUsd: 99,
    monthlyTry: 369,
    yearlyTry: 3990,
    features: [
      "Premium deep dive (haftalık)",
      "Rapor arşiv erişim",
      "Reklamsız okuma",
      "Türkiye Pazarlama Endeksi (özet)",
    ],
    seats: 1,
    stripePriceEnvKey: {
      monthly: "STRIPE_PRICE_LITE_MONTHLY",
      yearly: "STRIPE_PRICE_LITE_YEARLY",
    },
    iyzicoPlanEnvKey: {
      monthly: "IYZICO_PLAN_LITE_MONTHLY",
      yearly: "IYZICO_PLAN_LITE_YEARLY",
    },
  },

  pro: {
    tier: "pro",
    name: "MarkaRadar+ Pro",
    description: "Lite + CMO Club Slack + aylık webinar + tam endeks erişimi.",
    monthlyUsd: 49,
    yearlyUsd: 499,
    monthlyTry: 1990,
    yearlyTry: 19990,
    features: [
      "Lite tüm avantajları",
      "CMO Club Slack erişimi",
      "Aylık premium webinar",
      "Türkiye Pazarlama Endeksi (tam)",
      "Premium quarterly trend raporu",
      "Akademi kohort %20 indirim",
    ],
    seats: 1,
    stripePriceEnvKey: {
      monthly: "STRIPE_PRICE_PRO_MONTHLY",
      yearly: "STRIPE_PRICE_PRO_YEARLY",
    },
    iyzicoPlanEnvKey: {
      monthly: "IYZICO_PLAN_PRO_MONTHLY",
      yearly: "IYZICO_PLAN_PRO_YEARLY",
    },
  },

  enterprise: {
    tier: "enterprise",
    name: "MarkaRadar+ Enterprise",
    description: "Pro × 5 koltuk + yıllık 2 custom rapor + öncelikli destek.",
    monthlyUsd: 299,
    yearlyUsd: 2999,
    monthlyTry: 11990,
    yearlyTry: 119990,
    features: [
      "Pro tüm avantajları × 5 kullanıcı",
      "Yılda 2 custom rapor",
      "Quarterly Business Review (QBR)",
      "Öncelikli destek (24sa SLA)",
      "Custom newsletter şablonu",
    ],
    seats: 5,
    stripePriceEnvKey: {
      monthly: "STRIPE_PRICE_ENTERPRISE_MONTHLY",
      yearly: "STRIPE_PRICE_ENTERPRISE_YEARLY",
    },
    iyzicoPlanEnvKey: {
      monthly: "IYZICO_PLAN_ENTERPRISE_MONTHLY",
      yearly: "IYZICO_PLAN_ENTERPRISE_YEARLY",
    },
  },
};

export function getTierPricing(tier: SubscriptionTier): TierPricing {
  return TIERS[tier];
}

export function amountFor(
  tier: SubscriptionTier,
  interval: BillingInterval,
  currency: "USD" | "TRY",
): number {
  const t = TIERS[tier];
  if (currency === "USD") {
    return interval === "monthly" ? t.monthlyUsd : t.yearlyUsd;
  }
  return interval === "monthly" ? t.monthlyTry : t.yearlyTry;
}
