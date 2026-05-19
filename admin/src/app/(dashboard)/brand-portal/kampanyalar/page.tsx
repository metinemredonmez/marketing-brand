import { Megaphone } from "lucide-react";
import { adminBrandApi } from "@/lib/api/brand-portal";
import { getTranslations } from "@/lib/i18n/server";
import { CampaignReviewCard } from "./_card";

export default async function AdminBrandCampaignQueuePage() {
  const queue = await adminBrandApi.campaignQueue().catch(() => []);
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Megaphone size={24} /> {t("brandStudio.campaigns.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("brandStudio.campaigns.subtitle", { count: queue.length })}
        </p>
        <div className="mt-3 rounded-md bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {t("brandStudio.campaigns.reminder")}
        </div>
      </header>

      {queue.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Megaphone size={48} className="mx-auto text-emerald-300" />
          <p className="mt-4 text-muted-foreground">
            {t("brandStudio.campaigns.empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((c) => (
            <CampaignReviewCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
