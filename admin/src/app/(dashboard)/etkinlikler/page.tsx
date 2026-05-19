import Link from "next/link";
import { Plus, Trophy, Calendar, Users } from "lucide-react";
import { API_BASE } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n/server";

interface EventItem {
  id: string;
  slug: string;
  type: string;
  title: string;
  startsAt: string;
  status: string;
  capacity: number | null;
  registeredCount: number;
}

const STATUS_VARIANT: Record<string, string> = {
  draft: "secondary",
  announced: "outline",
  registration_open: "success",
  sold_out: "warning",
  in_progress: "default",
  completed: "secondary",
  canceled: "destructive",
};

export default async function EventsAdminPage() {
  let events: EventItem[] = [];
  try {
    const res = await fetch(`${API_BASE}/api/v1/events`, {
      cache: "no-store",
    });
    if (res.ok) events = await res.json();
  } catch {}
  const t = await getTranslations();
  const locale = t.locale === "en" ? "en-US" : "tr-TR";

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Trophy size={24} /> {t("events.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("events.subtitle", { count: events.length })}
          </p>
        </div>
        <Button asChild>
          <Link href="/etkinlikler/yeni">
            <Plus size={16} /> {t("events.new")}
          </Link>
        </Button>
      </header>

      {events.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Trophy size={48} className="mx-auto text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">{t("events.empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {t(`events.type.${e.type}`)}
                    </Badge>
                    <Badge
                      variant={
                        STATUS_VARIANT[e.status] as
                          | "default"
                          | "secondary"
                          | "success"
                          | "warning"
                          | "destructive"
                          | "outline"
                          | "accent"
                      }
                    >
                      {e.status}
                    </Badge>
                  </div>
                  <h3 className="mt-2 font-bold text-foreground">
                    {e.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {new Date(e.startsAt).toLocaleString(locale)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} /> {e.registeredCount}
                      {e.capacity ? ` / ${e.capacity}` : ""}
                    </span>
                  </div>
                </div>
                {e.type === "awards" && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/etkinlikler/${e.id}/jury`}>
                      {t("events.juryPage")}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
