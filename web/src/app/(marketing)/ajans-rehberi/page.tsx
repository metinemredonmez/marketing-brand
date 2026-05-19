import Link from "next/link";
import type { Metadata } from "next";
import {
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { listAgencies } from "@/lib/api/agencies";
import { Badge } from "@/components/ui/badge";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Ajans Rehberi — Türkiye'nin Doğrulanmış Pazarlama Ajansları",
  description:
    "Verified review'lar ve doğrulanmış müşteri yorumlarıyla Türkiye'nin en iyi dijital, sosyal medya ve marka ajansları.",
};

const TIER_LABEL: Record<string, string> = {
  free: "",
  basic: "Basic",
  premium: "Premium",
  featured: "Featured",
  elite: "Elite",
};

export default async function AjansRehberiPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tier?: string;
    city?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = 24;
  const offset = (page - 1) * limit;

  let data: Awaited<ReturnType<typeof listAgencies>> = {
    items: [],
    total: 0,
    limit,
    offset,
  };
  try {
    data = await listAgencies({
      q: params.q,
      tier: params.tier,
      city: params.city,
      limit,
      offset,
    });
  } catch {}

  const totalPages = Math.max(1, Math.ceil(data.total / limit));
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
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 backdrop-blur">
            <ShieldCheck className="h-3 w-3" /> {t("agencyDirectory.eyebrow")}
          </div>
          <h1 className="mt-6 max-w-3xl whitespace-pre-line text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl md:tracking-[-0.03em]">
            {t("agencyDirectory.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("agencyDirectory.subtitle")}
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
              placeholder={t("agencyDirectory.searchPlaceholder")}
              className="h-10 min-w-[200px] flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              name="tier"
              defaultValue={params.tier ?? ""}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="">{t("agencyDirectory.allTiers")}</option>
              <option value="elite">Elite</option>
              <option value="featured">Featured</option>
              <option value="premium">Premium</option>
              <option value="basic">Basic</option>
            </select>
            <input
              name="city"
              defaultValue={params.city ?? ""}
              placeholder={t("agencyDirectory.cityPlaceholder")}
              className="h-10 w-[150px] rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("agencyDirectory.filterCta")}
            </button>
            {(params.q || params.tier || params.city) && (
              <Link
                href="/ajans-rehberi"
                className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm text-foreground/80 hover:bg-muted"
              >
                {t("agencyDirectory.clear")}
              </Link>
            )}
          </form>
          <div className="mt-3 text-xs text-muted-foreground">
            {t("agencyDirectory.countLabel", { count: data.total })}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        {data.items.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <Building2
              size={48}
              className="mx-auto text-muted-foreground/40"
            />
            <p className="mt-4 text-muted-foreground">
              {t("agencyDirectory.empty")}
            </p>
            <Link
              href="/ajans-rehberi"
              className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
            >
              {t("agencyDirectory.seeAll")} →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((a) => {
              const tierLabel = TIER_LABEL[a.tier];
              const isHighTier = a.tier === "elite" || a.tier === "featured";
              const verified = a.verificationLevel !== "unverified";
              return (
                <Link
                  key={a.id}
                  href={`/ajans-rehberi/${a.slug}`}
                  className="group relative flex flex-col rounded-2xl border bg-card p-5 transition-all hover:border-accent/50 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {a.logoUrl ? (
                        <img
                          src={a.logoUrl}
                          alt={a.name}
                          className="size-11 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Building2 size={18} strokeWidth={1.75} />
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-semibold text-foreground group-hover:text-accent">
                          {a.name}
                        </h3>
                        {a.city && (
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={11} /> {a.city}
                          </div>
                        )}
                      </div>
                    </div>
                    {tierLabel && (
                      <Badge
                        variant={isHighTier ? "accent" : "secondary"}
                        className="text-[10px] uppercase tracking-widest"
                      >
                        {tierLabel}
                      </Badge>
                    )}
                  </div>

                  {a.tagline && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {a.tagline}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Star
                        size={12}
                        className="fill-amber-400 text-amber-400"
                      />
                      <span className="font-semibold text-foreground">
                        {Number(a.ratingAvg).toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ·{" "}
                        {t("agencyDirectory.reviewCount", {
                          count: a.reviewCount,
                        })}
                      </span>
                    </div>
                    {verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 size={10} />{" "}
                        {t("agencyDirectory.verified")}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            {page > 1 ? (
              <Link
                href={`/ajans-rehberi?page=${page - 1}`}
                className="inline-flex h-9 items-center gap-1 rounded-md border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-3 w-3" /> Önceki
              </Link>
            ) : null}
            <span className="font-mono text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/ajans-rehberi?page=${page + 1}`}
                className="inline-flex h-9 items-center gap-1 rounded-md border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
              >
                Sonraki <ArrowRight className="h-3 w-3" />
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </>
  );
}
