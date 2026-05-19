import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";
import { brandApi } from "@/lib/api/brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n/server";

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-muted text-foreground/80",
  pending_approval:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  scheduled:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  paused: "bg-muted text-foreground/80",
  completed: "bg-muted text-muted-foreground",
  canceled: "bg-muted text-muted-foreground",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
};

export default async function BrandCampaignsPage() {
  const accounts = await brandApi.myAccounts();
  const account = accounts[0].brandAccount;
  const campaigns = await brandApi.myCampaigns(account.id).catch(() => []);
  const t = await getTranslations();
  const localeFmt = t.locale === "en" ? "en-US" : "tr-TR";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-accent">
            {t("brandPortal.nav.campaigns")}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("brandPortal.campaigns.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("brandPortal.campaigns.subtitle")}
          </p>
        </div>
        <Link href="/marka-paneli/kampanya/yeni">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> {t("brandPortal.campaigns.new")}
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-base font-semibold text-foreground">
            {t("brandPortal.campaigns.empty")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("brandPortal.campaigns.emptyBody")}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/marka-paneli/ai">
              <Button variant="outline">
                {t("brandPortal.campaigns.goToAi")}
              </Button>
            </Link>
            <Link href="/marka-paneli/kampanya/yeni">
              <Button>{t("brandPortal.campaigns.startManual")}</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="mt-6 grid gap-3">
          {campaigns.map((c) => {
            const color = STATUS_COLOR[c.status] ?? "bg-muted";
            const budget = Number(c.budget);
            const spent = Number(c.spentTry ?? 0);
            const progress =
              budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
            return (
              <Link
                key={c.id}
                href={`/marka-paneli/kampanya/${c.id}`}
                className="block"
              >
                <Card className="p-5 transition-shadow hover:shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {c.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{c.type}</span>
                        <span>•</span>
                        <span>
                          {(c.targeting?.placement as string) ?? "—"}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(c.startAt).toLocaleDateString(localeFmt)} →{" "}
                          {new Date(c.endAt).toLocaleDateString(localeFmt)}
                        </span>
                      </div>
                    </div>
                    <Badge className={color}>
                      {t(`brandPortal.campaigns.status.${c.status}`)}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {t("brandPortal.campaigns.column.impressions")}
                      </div>
                      <div className="font-mono font-semibold text-foreground">
                        {Number(c.totalImpressions ?? 0).toLocaleString(
                          localeFmt,
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {t("brandPortal.campaigns.column.clicks")}
                      </div>
                      <div className="font-mono font-semibold text-foreground">
                        {Number(c.totalClicks ?? 0).toLocaleString(localeFmt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {t("brandPortal.campaigns.column.budget")}
                      </div>
                      <div className="font-mono font-semibold text-foreground">
                        {spent.toLocaleString(localeFmt, {
                          maximumFractionDigits: 0,
                        })}{" "}
                        /{" "}
                        {budget.toLocaleString(localeFmt, {
                          maximumFractionDigits: 0,
                        })}{" "}
                        ₺
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded bg-muted">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
