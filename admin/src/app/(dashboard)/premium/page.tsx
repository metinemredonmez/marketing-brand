import { CreditCard, TrendingUp } from "lucide-react";
import { API_BASE } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n/server";

export default async function PremiumAdminPage() {
  // Tarifeler — public endpoint
  let tiers: Array<{
    tier: string;
    name: string;
    yearlyUsd: number;
    yearlyTry: number;
  }> = [];
  try {
    const res = await fetch(`${API_BASE}/api/v1/subscriptions/tiers`, {
      cache: "no-store",
    });
    if (res.ok) tiers = await res.json();
  } catch {}
  const t = await getTranslations();
  const locale = t.locale === "en" ? "en-US" : "tr-TR";

  return (
    <div>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <CreditCard size={24} /> {t("premium.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("premium.subtitle")}
        </p>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Stat
          label={t("premium.stat.active")}
          value="—"
          hint={t("premium.hint.active")}
        />
        <Stat
          label={t("premium.stat.mrr")}
          value="—"
          hint={t("premium.hint.mrr")}
        />
        <Stat label={t("premium.stat.newThisMonth")} value="—" />
        <Stat
          label={t("premium.stat.churn")}
          value="—"
          hint={t("premium.hint.churn")}
        />
      </div>

      {/* Tarife özeti */}
      <div className="mb-6 rounded-xl border bg-card p-6">
        <h2 className="font-bold text-foreground">{t("premium.tiers")}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {tiers.map((tier) => (
            <div key={tier.tier} className="rounded-md border p-3">
              <Badge variant="outline">{tier.tier}</Badge>
              <div className="mt-2 text-sm font-medium">{tier.name}</div>
              <div className="mt-1 text-lg font-bold text-foreground">
                ${tier.yearlyUsd}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  / {t("premium.perYear")}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                ≈ {Number(tier.yearlyTry).toLocaleString(locale)} TL
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-amber-50 p-6 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        <div className="font-bold">{t("premium.phase2Title")}</div>
        <p className="mt-1">{t("premium.phase2Body")}</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <TrendingUp size={16} className="text-brand-500" />
      </div>
      <div className="mt-3 text-2xl font-bold text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
