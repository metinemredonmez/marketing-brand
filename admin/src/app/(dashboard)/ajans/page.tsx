import Link from "next/link";
import { Plus, Building2, Star, Trophy } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { AgencyRow } from "@/components/dashboard/agency-row";
import { getTranslations } from "@/lib/i18n/server";

interface Agency {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  tier: string;
  ratingAvg: number;
  reviewCount: number;
  verificationLevel: string;
  isActive: boolean;
}

const TIER_LABEL: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  featured: "Featured",
  elite: "Elite",
};

export default async function AgenciesAdminPage() {
  let agencies: Agency[] = [];
  let top50: Agency[] = [];
  try {
    const res = await apiFetch<{ items: Agency[] }>("/agencies?limit=100");
    agencies = res.items;
  } catch {}
  try {
    top50 = await apiFetch<Agency[]>("/agencies/ranking/top-50");
  } catch {}
  const t = await getTranslations();

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Building2 size={24} /> {t("agencies.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("agencies.subtitle", {
              count: agencies.length,
              top: top50.length,
            })}
          </p>
        </div>
        <Button asChild>
          <Link href="/ajans/yeni">
            <Plus size={16} /> {t("agencies.new")}
          </Link>
        </Button>
      </header>

      {top50.length > 0 && (
        <div className="mb-6 rounded-xl border border-accent/30 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:from-amber-950/30 dark:to-orange-950/30">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-accent" />
            <h2 className="font-bold text-foreground">
              {t("agencies.topRanking")}
            </h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {top50.slice(0, 10).map((a, i) => (
              <Link
                key={a.id}
                href={`/ajans/${a.id}`}
                className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm hover:border-brand-500"
              >
                <span className="font-bold text-foreground">#{i + 1}</span>
                <span className="text-foreground/80">{a.name}</span>
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  {Number(a.ratingAvg).toFixed(1)}
                </span>
              </Link>
            ))}
            {top50.length > 10 && (
              <span className="px-3 py-1.5 text-sm text-muted-foreground">
                {t("agencies.moreCount", { count: top50.length - 10 })}
              </span>
            )}
          </div>
        </div>
      )}

      {agencies.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Building2 size={48} className="mx-auto text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">{t("agencies.empty")}</p>
          <Button asChild className="mt-4">
            <Link href="/ajans/yeni">{t("agencies.firstAgency")}</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  {t("agencies.column.name")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("agencies.column.city")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("agencies.column.tier")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("agencies.column.reviews")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("agencies.column.verification")}
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((a) => (
                <AgencyRow
                  key={a.id}
                  agency={a}
                  tierLabel={TIER_LABEL[a.tier] ?? a.tier}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
