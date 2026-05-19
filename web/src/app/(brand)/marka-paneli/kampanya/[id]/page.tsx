import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { brandApi } from "@/lib/api/brand";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n/server";
import { CampaignActions } from "./_actions";

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

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accounts = await brandApi.myAccounts();
  const accountId = accounts[0].brandAccount.id;
  const t = await getTranslations();
  const fmt = t.locale === "en" ? "en-US" : "tr-TR";

  let campaign;
  try {
    campaign = await brandApi.myCampaign(accountId, id);
  } catch {
    notFound();
  }

  const color = STATUS_COLOR[campaign.status] ?? "bg-muted";
  const impressions = Number(campaign.totalImpressions ?? 0);
  const clicks = Number(campaign.totalClicks ?? 0);
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const spent = Number(campaign.spentTry ?? 0);
  const budget = Number(campaign.budget);
  const progress = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

  return (
    <div>
      <Link
        href="/marka-paneli/kampanya"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="h-3 w-3" />{" "}
        {t("brandPortal.campaigns.detail.backToCampaigns")}
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {campaign.name}
          </h1>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{campaign.type}</span>
            <span>•</span>
            <span>{(campaign.targeting?.placement as string) ?? "—"}</span>
            <span>•</span>
            <span>
              {new Date(campaign.startAt).toLocaleDateString(fmt)} →{" "}
              {new Date(campaign.endAt).toLocaleDateString(fmt)}
            </span>
          </div>
        </div>
        <Badge className={`${color} text-xs`}>
          {t(`brandPortal.campaigns.status.${campaign.status}`)}
        </Badge>
      </div>

      {campaign.status === "rejected" && campaign.rejectedReason && (
        <Card className="mt-5 border-red-200 bg-red-50 p-4 dark:bg-red-950/40 dark:border-red-900">
          <div className="text-sm font-semibold text-red-900 dark:text-red-200">
            {t("brandPortal.campaigns.detail.rejectedReason")}
          </div>
          <p className="mt-1 text-sm text-red-800 dark:text-red-300">
            {campaign.rejectedReason}
          </p>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.campaigns.detail.impressions")}
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground">
            {impressions.toLocaleString(fmt)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.campaigns.detail.clicks")}
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground">
            {clicks.toLocaleString(fmt)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.campaigns.detail.ctr")}
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground">
            {ctr.toFixed(2)}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("brandPortal.campaigns.detail.spent")}
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground">
            {spent.toLocaleString(fmt, { maximumFractionDigits: 0 })} ₺
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded bg-muted">
            <div
              className="h-full bg-accent"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {t("brandPortal.campaigns.detail.budgetLabel", {
              value: budget.toLocaleString(fmt),
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_280px]">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            {t("brandPortal.campaigns.detail.details")}
          </h3>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">
                {t("brandPortal.campaigns.detail.goal")}
              </dt>
              <dd className="text-foreground">{campaign.goal ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                {t("brandPortal.campaigns.detail.source")}
              </dt>
              <dd className="text-foreground">{campaign.source}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-muted-foreground">
                {t("brandPortal.campaigns.detail.targeting")}
              </dt>
              <dd className="mt-1 rounded bg-muted p-2 font-mono text-xs text-foreground/80">
                {JSON.stringify(campaign.targeting ?? {}, null, 2)}
              </dd>
            </div>
          </dl>
        </Card>

        <CampaignActions
          brandAccountId={accountId}
          campaignId={campaign.id}
          status={campaign.status}
        />
      </div>
    </div>
  );
}
