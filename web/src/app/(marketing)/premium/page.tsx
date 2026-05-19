import type { Metadata } from "next";
import { Check, Sparkles, ShieldCheck } from "lucide-react";
import { listTiers, type Tier } from "@/lib/api/subscriptions";
import { CheckoutButton } from "@/components/marketing/checkout-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "MarkaRadar+ Premium",
  description:
    "Pro deep dive analiz, CMO Club Slack, Türkiye Pazarlama Endeksi'ne tam erişim.",
};

const HIGHLIGHTED = "pro";

export default async function PremiumPage() {
  let tiers: Tier[] = [];
  try {
    tiers = await listTiers();
  } catch {}
  const t = await getTranslations();
  const fmt = t.locale === "en" ? "en-US" : "tr-TR";

  return (
    <>
      {/* ─────────────── HERO — Linear minimal */}
      <section className="relative overflow-hidden border-b">
        <GridPattern variant="dots" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[900px] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl"
        />
        <div className="container relative mx-auto max-w-5xl px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
            <Sparkles size={12} /> {t("premiumPage.eyebrow")}
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl md:tracking-[-0.03em]">
            {t("premiumPage.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("premiumPage.subtitle")}
          </p>
        </div>
      </section>

      {/* ─────────────── PRICING GRID */}
      <section className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        {tiers.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900">
            {t("premiumPage.noTiers")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => {
              const isHighlight = tier.tier === HIGHLIGHTED;
              const isFounding = tier.tier === "founding_member";
              return (
                <div
                  key={tier.tier}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-card p-6 transition-all",
                    isHighlight &&
                      "border-accent/40 shadow-lg shadow-accent/10 ring-1 ring-accent/30",
                    isFounding && "border-accent/30 bg-accent/[0.03]",
                  )}
                >
                  {isHighlight && (
                    <Badge
                      variant="accent"
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest"
                    >
                      {t("premiumPage.badgePopular")}
                    </Badge>
                  )}
                  {isFounding && (
                    <Badge
                      variant="warning"
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest"
                    >
                      {t("premiumPage.badgeFounding")}
                    </Badge>
                  )}

                  <div className="flex-1">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                      {tier.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {tier.description}
                    </p>

                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight text-foreground md:tracking-[-0.02em]">
                        {Number(tier.yearlyTry).toLocaleString(fmt)} ₺
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{t("premiumPage.yearly")}
                      </span>
                    </div>
                    {tier.yearlyUsd > 0 && (
                      <div className="mt-1 font-mono text-xs text-muted-foreground">
                        ≈ ${tier.yearlyUsd} USD
                      </div>
                    )}
                    {tier.seats > 1 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {t("premiumPage.seats", { n: tier.seats })}
                      </div>
                    )}

                    <ul className="mt-6 space-y-2.5">
                      {tier.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm leading-relaxed"
                        >
                          <Check
                            size={14}
                            className={cn(
                              "mt-0.5 shrink-0",
                              isHighlight ? "text-accent" : "text-emerald-500",
                            )}
                            strokeWidth={2.5}
                          />
                          <span className="text-foreground/85">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <CheckoutButton
                      tier={tier.tier}
                      billingInterval="yearly"
                      provider="stripe"
                      variant={isHighlight ? "accent" : "default"}
                    >
                      {isFounding
                        ? t("premiumPage.foundingCta")
                        : t("premiumPage.cta")}
                    </CheckoutButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mx-auto mt-10 flex max-w-3xl items-center justify-center gap-2 rounded-lg border bg-card px-5 py-4 text-center text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
          <span>{t("premiumPage.paymentBanner")}</span>
        </div>
      </section>

      {/* ─────────────── FAQ */}
      <section className="border-t bg-surface">
        <div className="container mx-auto max-w-3xl px-4 py-16 md:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl md:tracking-[-0.02em]">
            {t("premiumPage.faq.title")}
          </h2>
          <div className="mt-8 divide-y border-y">
            <FaqItem
              q={t("premiumPage.faq.q1")}
              a={t("premiumPage.faq.a1")}
            />
            <FaqItem
              q={t("premiumPage.faq.q2")}
              a={t("premiumPage.faq.a2")}
            />
            <FaqItem
              q={t("premiumPage.faq.q3")}
              a={t("premiumPage.faq.a3")}
            />
            <FaqItem
              q={t("premiumPage.faq.q4")}
              a={t("premiumPage.faq.a4")}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-foreground">
        {q}
        <span className="text-muted-foreground transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
    </details>
  );
}
