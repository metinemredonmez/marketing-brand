import { ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { ReviewCard } from "@/components/dashboard/review-card";
import { getTranslations } from "@/lib/i18n/server";

export default async function ReviewQueuePage() {
  let queue: Parameters<typeof ReviewCard>[0]["review"][] = [];
  try {
    queue = await apiFetch("/admin/agency-reviews/queue");
  } catch {}
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <ShieldCheck size={24} /> {t("reviews.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("reviews.subtitle", { count: queue.length })}
        </p>
      </header>

      {queue.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <ShieldCheck size={48} className="mx-auto text-emerald-300" />
          <p className="mt-4 text-muted-foreground">{t("reviews.empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}
