"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, ChevronDown, Loader2 } from "lucide-react";
import {
  approveBrandCampaignAction,
  rejectBrandCampaignAction,
} from "@/app/actions/brand-portal";
import type { AdminBrandCampaign } from "@/lib/api/brand-portal";
import { useTranslations } from "@/lib/i18n/client";

export function CampaignReviewCard({
  campaign,
}: {
  campaign: AdminBrandCampaign;
}) {
  const [showCreative, setShowCreative] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const { t, locale } = useTranslations();

  const brand = campaign.advertiser?.brandAccount;
  const creative = campaign.brandCreatives?.[0];
  const placement =
    typeof campaign.targeting?.placement === "string"
      ? campaign.targeting.placement
      : "—";
  const errLabel = t("common.error");

  function onApprove() {
    setMsg(null);
    start(async () => {
      const r = await approveBrandCampaignAction(campaign.id);
      if (!r.ok) setMsg(r.message ?? errLabel);
    });
  }
  function onReject() {
    setMsg(null);
    start(async () => {
      const r = await rejectBrandCampaignAction(campaign.id, reason);
      if (!r.ok) setMsg(r.message ?? errLabel);
      else setShowReject(false);
    });
  }

  const dateLocale = locale === "en" ? "en-US" : "tr-TR";

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">
            {campaign.name}
          </h3>
          <div className="mt-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {brand?.companyName ?? campaign.advertiser?.name ?? "—"}
            </span>{" "}
            · {brand?.contactName ?? "—"} ({brand?.contactEmail ?? "—"})
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="rounded bg-muted px-2 py-0.5">
              {campaign.type}
            </span>
            <span className="rounded bg-muted px-2 py-0.5">{placement}</span>
            <span className="rounded bg-muted px-2 py-0.5">
              {campaign.goal ?? "—"}
            </span>
            <span>
              {new Date(campaign.startAt).toLocaleDateString(dateLocale)} →{" "}
              {new Date(campaign.endAt).toLocaleDateString(dateLocale)}
            </span>
            <span className="font-mono font-semibold text-foreground">
              {Number(campaign.budget).toLocaleString(dateLocale)} ₺
            </span>
          </div>
        </div>
      </div>

      {creative && (
        <>
          <button
            type="button"
            onClick={() => setShowCreative(!showCreative)}
            className="mt-4 flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                showCreative ? "rotate-180" : ""
              }`}
            />
            {t("brandStudio.campaigns.reviewCreative")} ({creative.type})
          </button>
          {showCreative && (
            <div className="mt-3 rounded-md border bg-muted p-3 font-mono text-xs">
              <div className="mb-2 font-semibold text-foreground/80">
                {creative.name}
              </div>
              {creative.clickUrl && (
                <div className="mb-2 text-muted-foreground">
                  CTA URL:{" "}
                  <span className="text-accent">{creative.clickUrl}</span>
                </div>
              )}
              <pre className="whitespace-pre-wrap text-foreground">
                {JSON.stringify(creative.content, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}

      {campaign.targeting && Object.keys(campaign.targeting).length > 0 && (
        <div className="mt-3 rounded-md bg-muted p-3 text-xs">
          <div className="font-semibold text-foreground/80">
            {t("brandStudio.campaigns.targeting")}
          </div>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-foreground/80">
            {JSON.stringify(campaign.targeting, null, 2)}
          </pre>
        </div>
      )}

      {msg && (
        <div className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300">
          {msg}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onApprove}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          {t("brandStudio.campaigns.approveAndPublish")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setShowReject(!showReject)}
          className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-300"
        >
          <XCircle className="h-3 w-3" /> {t("brandStudio.campaigns.reject")}
        </button>
      </div>

      {showReject && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 dark:bg-red-950/40 dark:border-red-900">
          <label className="text-xs font-semibold text-red-900 dark:text-red-200">
            {t("brandStudio.campaigns.rejectReason")}
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1.5 w-full rounded-md border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            placeholder={t("brandStudio.campaigns.rejectPlaceholder")}
            required
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReject(false)}
              className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={pending || reason.trim().length < 5}
              onClick={onReject}
              className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {pending
                ? t("brandStudio.campaigns.sending")
                : t("brandStudio.campaigns.sendReject")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
