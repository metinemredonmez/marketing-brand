import Link from "next/link";
import type { Metadata } from "next";
import { Briefcase, MapPin, Clock, Building2 } from "lucide-react";
import { listJobs } from "@/lib/api/jobs";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "İş İlanları — Pazarlama, Reklam, Sosyal Medya Kariyer Fırsatları",
  description: "Türkiye'nin pazarlama profesyonelleri için iş ilanları.",
};

const SENIORITY_LABEL: Record<string, string> = {
  intern: "Stajyer",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  director: "Director",
};

const EMPLOYMENT_LABEL: Record<string, string> = {
  full_time: "Tam zamanlı",
  part_time: "Yarı zamanlı",
  freelance: "Freelance",
  contract: "Sözleşmeli",
  internship: "Staj",
};

export default async function IsIlanlariPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    seniority?: string;
    isRemote?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;
  let data;
  try {
    data = await listJobs({
      q: params.q,
      seniority: params.seniority,
      category: params.category,
      isRemote: params.isRemote === "true" ? true : undefined,
      limit: 30,
    });
  } catch {
    data = { items: [], total: 0, limit: 30, offset: 0 };
  }
  const t = await getTranslations();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <GridPattern variant="dots" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-[400px] w-[900px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-3xl"
        />
        <div className="container relative mx-auto max-w-5xl px-4 py-20 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
            <Briefcase className="h-3 w-3" /> {t("jobsPage.eyebrow")}
          </div>
          <h1 className="mt-6 max-w-3xl whitespace-pre-line text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl md:tracking-[-0.03em]">
            {t("jobsPage.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("jobsPage.subtitle")}
          </p>
        </div>
      </section>

      {/* FILTER */}
      <section className="border-b bg-surface">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <form className="flex flex-wrap items-center gap-2">
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder={t("jobsPage.searchPlaceholder")}
              className="h-10 min-w-[200px] flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              name="seniority"
              defaultValue={params.seniority ?? ""}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="">{t("jobsPage.allLevels")}</option>
              {Object.entries(SENIORITY_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground">
              <input
                type="checkbox"
                name="isRemote"
                value="true"
                defaultChecked={params.isRemote === "true"}
                className="h-3.5 w-3.5"
              />
              {t("jobsPage.remoteOnly")}
            </label>
            <button
              type="submit"
              className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("jobsPage.filterCta")}
            </button>
            {(params.q || params.seniority || params.isRemote === "true") && (
              <Link
                href="/is-ilanlari"
                className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm text-foreground/80 hover:bg-muted"
              >
                {t("jobsPage.clear")}
              </Link>
            )}
          </form>
          <div className="mt-3 text-xs text-muted-foreground">
            {t("jobsPage.countLabel", { count: data.total })}
          </div>
        </div>
      </section>

      {/* LIST */}
      <section className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
        {data.items.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <Briefcase
              size={48}
              className="mx-auto text-muted-foreground/40"
            />
            <p className="mt-4 text-muted-foreground">{t("jobsPage.empty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map((job) => {
              const isPremium = job.plan === "premium_distribution";
              const isFeatured = job.plan === "featured";
              return (
                <Link
                  key={job.id}
                  href={`/is-ilanlari/${job.slug}`}
                  className={`group flex flex-col gap-3 rounded-2xl border bg-card p-5 transition-all hover:border-accent/40 hover:shadow-md md:flex-row md:items-center md:justify-between ${
                    isPremium ? "border-accent/30 bg-accent/[0.02]" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isPremium && (
                        <Badge
                          variant="accent"
                          className="text-[10px] uppercase tracking-widest"
                        >
                          Premium
                        </Badge>
                      )}
                      {isFeatured && (
                        <Badge className="text-[10px] uppercase tracking-widest">
                          Featured
                        </Badge>
                      )}
                      <h3 className="text-base font-semibold text-foreground group-hover:text-accent md:text-lg">
                        {job.title}
                      </h3>
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 size={12} /> {job.companyName}
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Briefcase size={11} />{" "}
                        {SENIORITY_LABEL[job.seniority] ?? job.seniority}
                      </span>
                      <span>{EMPLOYMENT_LABEL[job.employmentType]}</span>
                      {job.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} /> {job.location}
                        </span>
                      )}
                      {job.isRemote && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase tracking-widest"
                        >
                          {t("jobsPage.remote")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={11} /> {formatDate(job.publishedAt)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
