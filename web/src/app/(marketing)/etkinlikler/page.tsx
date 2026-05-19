import Link from "next/link";
import type { Metadata } from "next";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Video,
  Sparkles,
  Mic,
  ArrowRight,
} from "lucide-react";
import { listEvents, type EventItem, type EventType } from "@/lib/api/events";
import { Badge } from "@/components/ui/badge";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Etkinlikler — MarkaRadar",
  description:
    "Türkiye AI Marketing Summit, ödül törenleri ve webinar'lar.",
};

const TYPE_ICON: Record<EventType, React.ElementType> = {
  summit: Sparkles,
  workshop: Mic,
  webinar: Video,
  meetup: Users,
  awards: Trophy,
};

const STATUS_COLOR: Record<string, string> = {
  announced: "bg-muted text-foreground/80",
  registration_open:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  sold_out:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  in_progress: "bg-accent/15 text-accent",
  completed: "bg-muted text-muted-foreground",
  canceled: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
};

export default async function EventsPage() {
  let events: EventItem[] = [];
  try {
    events = await listEvents();
  } catch {}

  const t = await getTranslations();
  const fmt = t.locale === "en" ? "en-US" : "tr-TR";

  // Sırala: registration_open önce, sonra announced, sonra in_progress, sonra completed
  const order: Record<string, number> = {
    registration_open: 0,
    announced: 1,
    in_progress: 2,
    sold_out: 3,
    completed: 4,
    canceled: 5,
  };
  events.sort((a, b) => (order[a.status] ?? 99) - (order[b.status] ?? 99));

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <GridPattern variant="dots" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-[400px] w-[900px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-3xl"
        />
        <div className="container relative mx-auto max-w-5xl px-4 py-20 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
            <Calendar className="h-3 w-3" /> {t("eventsPage.eyebrow")}
          </div>
          <h1 className="mt-6 max-w-3xl whitespace-pre-line text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl md:tracking-[-0.03em]">
            {t("eventsPage.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("eventsPage.subtitle")}
          </p>
        </div>
      </section>

      {/* LIST */}
      <section className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
        {events.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <Calendar
              size={48}
              className="mx-auto text-muted-foreground/40"
            />
            <p className="mt-4 text-muted-foreground">
              {t("eventsPage.empty")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((e) => {
              const Icon = TYPE_ICON[e.type] ?? Calendar;
              const start = new Date(e.startsAt);
              const isAwards = e.type === "awards";
              return (
                <article
                  key={e.id}
                  className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:border-accent/40 hover:shadow-md md:flex-row md:items-start md:gap-6 ${
                    isAwards
                      ? "border-accent/30 bg-accent/[0.02]"
                      : ""
                  }`}
                >
                  {/* Cover thumbnail + date overlay */}
                  <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl bg-muted md:h-32 md:w-48">
                    {e.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={e.coverUrl}
                        alt={e.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/40">
                        <Icon className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-foreground/0 to-transparent" />
                    {/* Date overlay */}
                    <div className="absolute bottom-2 left-2 flex w-16 flex-col items-center rounded-lg border border-white/10 bg-card/95 p-1.5 text-center backdrop-blur">
                      <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                        {start.toLocaleDateString(fmt, { month: "short" })}
                      </div>
                      <div className="font-display text-xl font-bold leading-none tracking-tight text-foreground">
                        {start.getDate()}
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground">
                        {start.getFullYear()}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/80">
                        <Icon className="h-3 w-3" />{" "}
                        {t(`eventsPage.typeLabel.${e.type}`)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                          STATUS_COLOR[e.status] ?? "bg-muted"
                        }`}
                      >
                        {t(`eventsPage.statusLabel.${e.status}`)}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground group-hover:text-accent md:text-2xl">
                      {e.title}
                    </h2>
                    {e.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {e.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={11} />
                        {start.toLocaleString(fmt, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {e.venue && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} /> {e.venue}
                          {e.city ? `, ${e.city}` : ""}
                        </span>
                      )}
                      {e.capacity && (
                        <span className="inline-flex items-center gap-1">
                          <Users size={11} />
                          {t("eventsPage.registered", {
                            count: e.registeredCount,
                          })}{" "}
                          / {e.capacity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex shrink-0 items-end md:items-start">
                    <Link
                      href={`/etkinlikler/${e.slug}`}
                      className="inline-flex items-center gap-1 rounded-md border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
                    >
                      {t("eventsPage.learnMore")}{" "}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
