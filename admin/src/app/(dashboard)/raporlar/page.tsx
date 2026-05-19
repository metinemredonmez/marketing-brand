import { FileBarChart, Plus, Download } from "lucide-react";
import { API_BASE } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n/server";

interface Report {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  pageCount: number | null;
  priceTry: number;
  isFree: boolean;
  includedInTier: string | null;
  downloadCount: number;
  publishedAt: string | null;
}

export default async function ReportsAdminPage() {
  let reports: Report[] = [];
  try {
    const res = await fetch(`${API_BASE}/api/v1/reports`, {
      cache: "no-store",
    });
    if (res.ok) reports = await res.json();
  } catch {}
  const t = await getTranslations();
  const locale = t.locale === "en" ? "en-US" : "tr-TR";

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <FileBarChart size={24} /> {t("reports.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("reports.subtitle", { count: reports.length })}
          </p>
        </div>
        <Button>
          <Plus size={16} /> {t("reports.new")}
        </Button>
      </header>

      {reports.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <FileBarChart size={48} className="mx-auto text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">{t("reports.empty")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("reports.firstSuggestion")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {r.isFree ? (
                    <Badge variant="success">{t("reports.free")}</Badge>
                  ) : r.includedInTier ? (
                    <Badge variant="accent">
                      {t("reports.includedInTier", {
                        tier: r.includedInTier,
                      })}
                    </Badge>
                  ) : (
                    <Badge variant="default">
                      {Number(r.priceTry).toLocaleString(locale)} TL
                    </Badge>
                  )}
                  <h3 className="mt-2 font-bold text-foreground">{r.title}</h3>
                  {r.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {r.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {r.pageCount
                    ? `${r.pageCount} ${t("reports.pages")}`
                    : "—"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Download size={11} /> {r.downloadCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
