import Link from "next/link";
import { Sparkles, Megaphone, Wallet, FileCheck2 } from "lucide-react";
import { brandApi } from "@/lib/api/brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n/server";
import { KycForm } from "./_components/kyc-form";

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

export default async function BrandDashboardPage() {
  const accounts = await brandApi.myAccounts();
  const link = accounts[0];
  const account = link.brandAccount;
  const wallet = account.wallet;
  const balance = wallet ? Number(wallet.balanceTry) : 0;

  const campaigns = await brandApi.myCampaigns(account.id).catch(() => []);
  const active = campaigns.filter((c) =>
    ["active", "scheduled", "pending_approval"].includes(c.status),
  );
  const totals = campaigns.reduce(
    (a, c) => ({
      impressions: a.impressions + Number(c.totalImpressions ?? 0),
      clicks: a.clicks + Number(c.totalClicks ?? 0),
      spent: a.spent + Number(c.spentTry ?? 0),
    }),
    { impressions: 0, clicks: 0, spent: 0 },
  );

  const t = await getTranslations();
  const localeFmt = t.locale === "en" ? "en-US" : "tr-TR";

  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide text-accent">
        {t("brandPortal.studioLabel")}
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        {t("brandPortal.dashboard.hello", { company: account.companyName })}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("brandPortal.dashboard.subtitle")}
      </p>

      {account.status === "pending_kyc" && (
        <Card className="mt-6 border-amber-200 bg-amber-50 p-5 dark:bg-amber-950/40 dark:border-amber-900">
          <div className="flex items-start gap-3">
            <FileCheck2 className="h-5 w-5 shrink-0 text-amber-700" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {t("brandPortal.dashboard.kycCardTitle")}
              </div>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                {t("brandPortal.dashboard.kycCardBody")}
              </p>
              <div className="mt-4">
                <KycForm brandAccountId={account.id} />
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.dashboard.stat.balance")}
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">
            {balance.toLocaleString(localeFmt, {
              style: "currency",
              currency: "TRY",
              maximumFractionDigits: 0,
            })}
          </div>
          <Link
            href="/marka-paneli/cuzdan"
            className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
          >
            {t("brandPortal.dashboard.action.topUp")} →
          </Link>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.dashboard.stat.activeCampaigns")}
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {active.length}
          </div>
          <Link
            href="/marka-paneli/kampanya"
            className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
          >
            {t("brandPortal.dashboard.action.seeAll")} →
          </Link>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.dashboard.stat.impressions")}
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {totals.impressions.toLocaleString(localeFmt)}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {t("brandPortal.dashboard.stat.clicks", {
              count: totals.clicks.toLocaleString(localeFmt),
            })}
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-foreground">
              {t("brandPortal.dashboard.quickActions")}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Link href="/marka-paneli/ai">
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="mr-2 h-4 w-4" />{" "}
                {t("brandPortal.dashboard.action.generate")}
              </Button>
            </Link>
            <Link href="/marka-paneli/kampanya/yeni">
              <Button variant="outline" className="w-full justify-start">
                <Megaphone className="mr-2 h-4 w-4" />{" "}
                {t("brandPortal.dashboard.action.newCampaign")}
              </Button>
            </Link>
            <Link href="/marka-paneli/cuzdan">
              <Button variant="outline" className="w-full justify-start">
                <Wallet className="mr-2 h-4 w-4" />{" "}
                {t("brandPortal.dashboard.action.recharge")}
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <div className="font-semibold text-foreground">
            {t("brandPortal.dashboard.recentCampaigns")}
          </div>
          {campaigns.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t("brandPortal.dashboard.emptyCampaigns")}
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {campaigns.slice(0, 5).map((c) => {
                const color = STATUS_COLOR[c.status] ?? "bg-muted";
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 border-b py-2 text-sm last:border-b-0"
                  >
                    <Link
                      href={`/marka-paneli/kampanya/${c.id}`}
                      className="truncate font-medium text-foreground hover:text-accent"
                    >
                      {c.name}
                    </Link>
                    <Badge className={color}>
                      {t(`brandPortal.campaigns.status.${c.status}`)}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
