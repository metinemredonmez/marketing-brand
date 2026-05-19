import Link from "next/link";
import type { Metadata } from "next";
import {
  FileBarChart,
  Download,
  ArrowRight,
  Lock,
  Sparkles,
} from "lucide-react";
import { listReports, type ReportItem } from "@/lib/api/reports";
import { Badge } from "@/components/ui/badge";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Raporlar — MarkaRadar",
  description:
    "Türkiye AI Marketing Maturity Index, Ajans Ekosistemi Raporu, Sosyal Ticaret Rehberi.",
};

export default async function ReportsPage() {
  let reports: ReportItem[] = [];
  try {
    reports = await listReports();
  } catch {}
  const t = await getTranslations();
  const fmt = t.locale === "en" ? "en-US" : "tr-TR";

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
            <FileBarChart className="h-3 w-3" /> {t("reportsPage.eyebrow")}
          </div>
          <h1 className="mt-6 max-w-3xl whitespace-pre-line text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl md:tracking-[-0.03em]">
            {t("reportsPage.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("reportsPage.subtitle")}
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        {reports.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <FileBarChart
              size={48}
              className="mx-auto text-muted-foreground/40"
            />
            <p className="mt-4 text-muted-foreground">
              {t("reportsPage.empty")}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((r) => {
              const isPro = r.includedInTier === "pro";
              const isLite = r.includedInTier === "lite";
              const isPremium = isPro || isLite;
              return (
                <article
                  key={r.id}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:border-accent/40 hover:shadow-md ${
                    r.isFree ? "border-emerald-200 dark:border-emerald-900" : ""
                  } ${isPremium ? "border-accent/30 bg-accent/[0.02]" : ""}`}
                >
                  {/* Cover banner */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                    {r.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.coverUrl}
                        alt={r.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FileBarChart className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/30 to-transparent" />
                    {/* Badge overlay */}
                    <div className="absolute left-3 top-3">
                      {r.isFree ? (
                        <Badge
                          variant="success"
                          className="text-[10px] uppercase tracking-widest"
                        >
                          {t("reportsPage.free")}
                        </Badge>
                      ) : r.includedInTier ? (
                        <Badge
                          variant="accent"
                          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest"
                        >
                          <Sparkles className="h-3 w-3" />{" "}
                          {t("reportsPage.includedInTier", {
                            tier: r.includedInTier,
                          })}
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="text-[10px] uppercase tracking-widest"
                        >
                          {Number(r.priceTry).toLocaleString(fmt)} ₺
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Body wrapper */}
                  <div className="flex flex-1 flex-col p-6">

                  {/* Title */}
                  <h2 className="text-lg font-bold tracking-tight text-foreground group-hover:text-accent">
                    {r.title}
                  </h2>
                  {r.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {r.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="mt-4 flex items-center gap-x-3 text-xs text-muted-foreground">
                    {r.pageCount && (
                      <span>{t("reportsPage.pages", { n: r.pageCount })}</span>
                    )}
                    {r.pageCount && r.downloadCount > 0 && (
                      <span aria-hidden>·</span>
                    )}
                    {r.downloadCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {t("reportsPage.downloads", {
                          count: r.downloadCount.toLocaleString(fmt),
                        })}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-5">
                    {r.isFree ? (
                      <Button asChild variant="accent" className="w-full">
                        <Link href={`/raporlar/${r.slug}`}>
                          <Download className="h-4 w-4" />{" "}
                          {t("reportsPage.freeCta")}
                        </Link>
                      </Button>
                    ) : r.includedInTier ? (
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/premium">
                          <Lock className="h-4 w-4" />{" "}
                          {t("reportsPage.tierCta", {
                            tier: r.includedInTier,
                          })}
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href={`/raporlar/${r.slug}`}>
                          {t("reportsPage.buyCta", {
                            price: Number(r.priceTry).toLocaleString(fmt),
                          })}{" "}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
