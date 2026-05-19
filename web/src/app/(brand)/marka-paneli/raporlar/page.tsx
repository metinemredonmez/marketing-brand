import { brandApi } from "@/lib/api/brand";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { getTranslations } from "@/lib/i18n/server";

export default async function ReportsPage() {
  const accounts = await brandApi.myAccounts();
  const account = accounts[0].brandAccount;
  const campaigns = await brandApi.myCampaigns(account.id).catch(() => []);
  const t = await getTranslations();
  const localeFmt = t.locale === "en" ? "en-US" : "tr-TR";

  const totals = campaigns.reduce(
    (a, c) => ({
      impressions: a.impressions + Number(c.totalImpressions ?? 0),
      clicks: a.clicks + Number(c.totalClicks ?? 0),
      spent: a.spent + Number(c.spentTry ?? 0),
    }),
    { impressions: 0, clicks: 0, spent: 0 },
  );

  const overallCtr =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCpc = totals.clicks > 0 ? totals.spent / totals.clicks : 0;
  const avgCpm =
    totals.impressions > 0 ? (totals.spent / totals.impressions) * 1000 : 0;

  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide text-accent">
        {t("brandPortal.nav.reports")}
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        {t("brandPortal.reports.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("brandPortal.reports.subtitle")}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.reports.stat.impressions")}
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">
            {totals.impressions.toLocaleString(localeFmt)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.reports.stat.clicks")}
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">
            {totals.clicks.toLocaleString(localeFmt)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.reports.stat.spent")}
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">
            {totals.spent.toLocaleString(localeFmt, {
              style: "currency",
              currency: "TRY",
              maximumFractionDigits: 0,
            })}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.reports.stat.ctr")}
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">
            {overallCtr.toFixed(2)}%
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.reports.stat.cpc")}
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">
            {avgCpc.toLocaleString(localeFmt, { maximumFractionDigits: 2 })} ₺
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.reports.stat.cpm")}
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">
            {avgCpm.toLocaleString(localeFmt, { maximumFractionDigits: 2 })} ₺
          </div>
        </Card>
      </div>

      <Card className="mt-8 p-5">
        <h3 className="text-sm font-semibold text-foreground">
          {t("brandPortal.reports.campaignBreakdown")}
        </h3>
        {campaigns.length === 0 ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3">{t("brandPortal.reports.empty")}</p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">
                    {t("brandPortal.reports.column.campaign")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    {t("brandPortal.reports.column.impressions")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    {t("brandPortal.reports.column.clicks")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    {t("brandPortal.reports.column.ctr")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    {t("brandPortal.reports.column.spent")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {campaigns.map((c) => {
                  const imp = Number(c.totalImpressions ?? 0);
                  const clk = Number(c.totalClicks ?? 0);
                  const ctr = imp > 0 ? (clk / imp) * 100 : 0;
                  return (
                    <tr key={c.id}>
                      <td className="px-3 py-2 font-medium text-foreground">
                        {c.name}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {imp.toLocaleString(localeFmt)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {clk.toLocaleString(localeFmt)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {ctr.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {Number(c.spentTry ?? 0).toLocaleString(localeFmt, {
                          maximumFractionDigits: 0,
                        })}{" "}
                        ₺
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
