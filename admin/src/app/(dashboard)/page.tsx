import {
  FileText,
  Users,
  Mail,
  CreditCard,
  TrendingUp,
  Building2,
} from "lucide-react";
import { apiFetch, API_BASE } from "@/lib/api/client";
import { getTranslations } from "@/lib/i18n/server";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

function StatCard({ label, value, delta, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon size={18} className="text-brand-500" />
      </div>
      <div className="mt-3 text-2xl font-bold text-foreground">{value}</div>
      {delta && (
        <div className="mt-1 text-xs font-medium text-emerald-600">{delta}</div>
      )}
    </div>
  );
}

async function fetchSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function DashboardPage() {
  const t = await getTranslations();
  const fmt = t.locale === "en" ? "en-US" : "tr-TR";

  // Tüm count'ları paralel çek — biri patlarsa diğerleri etkilenmesin
  const [
    publishedArticles,
    newsletterStats,
    agencies,
    activeJobs,
    pendingReviews,
    activeCourses,
    pendingBrandCampaigns,
  ] = await Promise.all([
    fetchSafe(
      () =>
        apiFetch<{ total: number }>(
          "/admin/articles?status=published&limit=1",
        ),
      { total: 0 },
    ),
    fetchSafe(async () => {
      const res = await fetch(`${API_BASE}/api/v1/newsletter/stats`, {
        cache: "no-store",
      });
      if (!res.ok) return { confirmedCount: 0 };
      return (await res.json()) as { confirmedCount: number };
    }, { confirmedCount: 0 }),
    fetchSafe(
      () => apiFetch<{ total: number }>("/agencies?limit=1"),
      { total: 0 },
    ),
    fetchSafe(
      () => apiFetch<{ total: number }>("/admin/jobs?status=active&limit=1"),
      { total: 0 },
    ),
    fetchSafe(
      () =>
        apiFetch<Array<unknown>>("/admin/agency-reviews/queue").then(
          (rows) => ({ count: rows.length }),
        ),
      { count: 0 },
    ),
    fetchSafe(
      () =>
        apiFetch<Array<{ isActive: boolean }>>("/courses").then((rows) => ({
          count: rows.filter((c) => c.isActive).length,
        })),
      { count: 0 },
    ),
    fetchSafe(
      () =>
        apiFetch<Array<unknown>>(
          "/admin/brand-portal/campaigns/queue",
        ).then((rows) => ({ count: rows.length })),
      { count: 0 },
    ),
  ]);

  const num = (n: number) => n.toLocaleString(fmt);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {t("dashboard.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("dashboard.subtitle")}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label={t("dashboard.stat.publishedNews")}
          value={num(publishedArticles.total)}
          icon={FileText}
        />
        <StatCard
          label={t("dashboard.stat.newsletterSubs")}
          value={num(newsletterStats.confirmedCount)}
          icon={Mail}
        />
        <StatCard
          label={t("dashboard.stat.activeCourses")}
          value={num(activeCourses.count)}
          icon={CreditCard}
        />
        <StatCard
          label={t("dashboard.stat.listedAgencies")}
          value={num(agencies.total)}
          icon={Building2}
        />
        <StatCard
          label={t("dashboard.stat.pendingReviews")}
          value={num(pendingReviews.count)}
          icon={Users}
          delta={
            pendingReviews.count > 0
              ? `${pendingReviews.count} bekliyor`
              : undefined
          }
        />
        <StatCard
          label={t("dashboard.stat.activeJobs")}
          value={num(activeJobs.total)}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">
            {t("dashboard.todayTasks")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-foreground/80">
            <li className="flex items-center justify-between">
              <span>☐ Newsletter taslağını gözden geçir</span>
              {newsletterStats.confirmedCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {num(newsletterStats.confirmedCount)} abone
                </span>
              )}
            </li>
            <li>☐ AI Stüdyo'da 3 yeni içerik üret</li>
            <li className="flex items-center justify-between">
              <span>☐ Review moderasyon kuyruğunu temizle</span>
              {pendingReviews.count > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  {pendingReviews.count}
                </span>
              )}
            </li>
            <li className="flex items-center justify-between">
              <span>☐ Brand campaign onay kuyruğunu kontrol et</span>
              {pendingBrandCampaigns.count > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  {pendingBrandCampaigns.count}
                </span>
              )}
            </li>
          </ul>
        </section>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">
            {t("dashboard.recentActivity")}
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                articles
              </code>{" "}
              · {num(publishedArticles.total)} yayında
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                agencies
              </code>{" "}
              · {num(agencies.total)} listede
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                jobs
              </code>{" "}
              · {num(activeJobs.total)} aktif
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                courses
              </code>{" "}
              · {num(activeCourses.count)} aktif
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                newsletter
              </code>{" "}
              · {num(newsletterStats.confirmedCount)} abone
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
