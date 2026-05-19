import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Mail,
  Building2,
  FileText,
  Users,
  AlertTriangle,
} from "lucide-react";
import { apiFetch, API_BASE } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getTranslations } from "@/lib/i18n/server";

interface AiUsage {
  month: string;
  totalGenerations: number;
  totalCostUsd: number;
  budgetUsd: number;
  remainingUsd: number;
  totalPromptTokens: number;
  totalOutputTokens: number;
  byType: Array<{
    generationType: string;
    _count: number;
    _sum: { costUsd: number };
  }>;
  byProvider: Array<{
    provider: string;
    _count: number;
    _sum: { costUsd: number };
  }>;
}

interface NewsletterStats {
  confirmedCount: number;
}

export default async function AnalyticsPage() {
  let aiUsage: AiUsage | null = null;
  let newsletter: NewsletterStats = { confirmedCount: 0 };
  let articleCount = 0;
  let agencyCount = 0;
  let activeJobs = 0;

  try {
    aiUsage = await apiFetch<AiUsage>("/admin/ai/usage");
  } catch {}
  try {
    const res = await fetch(`${API_BASE}/api/v1/newsletter/stats`, {
      cache: "no-store",
    });
    if (res.ok) newsletter = await res.json();
  } catch {}
  try {
    const articles = await apiFetch<{ total: number }>(
      "/admin/articles?status=published&limit=1",
    );
    articleCount = articles.total;
  } catch {}
  try {
    const agencies = await apiFetch<{ total: number }>("/agencies?limit=1");
    agencyCount = agencies.total;
  } catch {}
  try {
    const jobs = await apiFetch<{ total: number }>(
      "/admin/jobs?status=active&limit=1",
    );
    activeJobs = jobs.total;
  } catch {}

  const t = await getTranslations();
  const locale = t.locale === "en" ? "en-US" : "tr-TR";
  const budgetUsed = aiUsage
    ? (aiUsage.totalCostUsd / aiUsage.budgetUsd) * 100
    : 0;
  const budgetWarn = budgetUsed > 80;

  return (
    <div>
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <BarChart3 size={24} /> {t("analytics.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("analytics.subtitle")}
        </p>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("analytics.stat.publishedArticles")}
          value={articleCount.toString()}
          icon={FileText}
        />
        <StatCard
          label={t("analytics.stat.newsletterSubs")}
          value={newsletter.confirmedCount.toLocaleString(locale)}
          icon={Mail}
          hint={t("analytics.stat.newsletterHint")}
        />
        <StatCard
          label={t("analytics.stat.listedAgencies")}
          value={agencyCount.toString()}
          icon={Building2}
        />
        <StatCard
          label={t("analytics.stat.activeJobs")}
          value={activeJobs.toString()}
          icon={Users}
        />
      </div>

      <Card className="mb-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Sparkles size={18} /> {t("analytics.ai.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {aiUsage?.month ?? "—"} ·{" "}
              {t("analytics.ai.generationsLabel", {
                count: aiUsage?.totalGenerations ?? 0,
              })}
            </p>
          </div>
          {budgetWarn && (
            <Badge variant="destructive">
              <AlertTriangle size={12} className="mr-1" />{" "}
              {t("analytics.ai.budgetWarn", { pct: budgetUsed.toFixed(0) })}
            </Badge>
          )}
        </div>

        {aiUsage && (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-md bg-muted p-4">
                <div className="text-xs text-muted-foreground">
                  {t("analytics.ai.spent")}
                </div>
                <div className="mt-1 text-2xl font-bold text-foreground">
                  ${aiUsage.totalCostUsd.toFixed(2)}
                </div>
              </div>
              <div className="rounded-md bg-muted p-4">
                <div className="text-xs text-muted-foreground">
                  {t("analytics.ai.budget")}
                </div>
                <div className="mt-1 text-2xl font-bold text-foreground/80">
                  ${aiUsage.budgetUsd}
                </div>
              </div>
              <div className="rounded-md bg-emerald-50 p-4 dark:bg-emerald-950/40">
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  {t("analytics.ai.remaining")}
                </div>
                <div className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  ${aiUsage.remainingUsd.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                <div
                  className={`h-full transition-all ${
                    budgetUsed > 80
                      ? "bg-red-500"
                      : budgetUsed > 50
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, budgetUsed)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t("analytics.ai.used", { pct: budgetUsed.toFixed(1) })}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {t("analytics.ai.byType")}
                </h3>
                <div className="mt-2 space-y-1">
                  {aiUsage.byType.map((row) => (
                    <div
                      key={row.generationType}
                      className="flex justify-between text-xs"
                    >
                      <span className="text-foreground/80">
                        {row.generationType}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {row._count}x · $
                        {Number(row._sum.costUsd ?? 0).toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {t("analytics.ai.byProvider")}
                </h3>
                <div className="mt-2 space-y-1">
                  {aiUsage.byProvider.map((row) => (
                    <div
                      key={row.provider}
                      className="flex justify-between text-xs"
                    >
                      <span className="text-foreground/80">{row.provider}</span>
                      <span className="font-mono text-muted-foreground">
                        {row._count}x · $
                        {Number(row._sum.costUsd ?? 0).toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <TrendingUp size={18} /> {t("analytics.revenue.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("analytics.revenue.subtitle")}
        </p>
        <div className="mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {t("analytics.revenue.phase2")}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon size={18} className="text-brand-500" />
      </div>
      <div className="mt-3 text-2xl font-bold text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
