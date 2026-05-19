"use client";

import { useTransition } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  pauseCampaignAction,
  resumeCampaignAction,
} from "@/app/actions/brand";
import { useTranslations } from "@/lib/i18n/client";

export function CampaignActions({
  brandAccountId,
  campaignId,
  status,
}: {
  brandAccountId: string;
  campaignId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const { t } = useTranslations();

  const canPause = status === "active" || status === "scheduled";
  const canResume = status === "paused";

  function pause() {
    start(async () => {
      await pauseCampaignAction(brandAccountId, campaignId);
    });
  }
  function resume() {
    start(async () => {
      await resumeCampaignAction(brandAccountId, campaignId);
    });
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-foreground">
        {t("brandPortal.campaigns.detail.actions")}
      </h3>
      <div className="mt-4 space-y-2">
        {canPause && (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={pause}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Pause className="mr-2 h-4 w-4" />
            )}
            {t("brandPortal.campaigns.detail.pause")}
          </Button>
        )}
        {canResume && (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={resume}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {t("brandPortal.campaigns.detail.resume")}
          </Button>
        )}
        {!canPause && !canResume && (
          <p className="text-xs text-muted-foreground">
            {t("brandPortal.campaigns.detail.noActions")}
          </p>
        )}
      </div>
    </Card>
  );
}
