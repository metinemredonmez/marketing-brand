import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Trophy,
  Video,
  Sparkles,
  Mic,
} from "lucide-react";
import { getEvent, type EventType } from "@/lib/api/events";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n/server";

interface Props {
  params: Promise<{ slug: string }>;
}

const TYPE_ICON: Record<EventType, React.ElementType> = {
  summit: Sparkles,
  workshop: Mic,
  webinar: Video,
  meetup: Users,
  awards: Trophy,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const e = await getEvent(slug);
    return {
      title: `${e.title} — MarkaRadar`,
      description: e.description ?? undefined,
    };
  } catch {
    return { title: "Etkinlik bulunamadı" };
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  let event;
  try {
    event = await getEvent(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const t = await getTranslations();
  const fmt = t.locale === "en" ? "en-US" : "tr-TR";
  const start = new Date(event.startsAt);
  const end = event.endsAt ? new Date(event.endsAt) : null;
  const Icon = TYPE_ICON[event.type] ?? Calendar;
  const isOpen = event.status === "registration_open";

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link
        href="/etkinlikler"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> {t("eventsPage.eyebrow")}
      </Link>

      <div className="mt-6 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/80">
          <Icon className="h-3 w-3" /> {t(`eventsPage.typeLabel.${event.type}`)}
        </span>
        <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
          {t(`eventsPage.statusLabel.${event.status}`)}
        </span>
      </div>

      <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl md:tracking-[-0.03em]">
        {event.title}
      </h1>
      {event.description && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-xl">
          {event.description}
        </p>
      )}

      <div className="mt-8 grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Tarih
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">
            {start.toLocaleString(fmt, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {end ? (
              <>
                {" → "}
                {end.toLocaleString(fmt, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            ) : null}
          </div>
        </div>
        {event.venue && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Mekan
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <MapPin className="h-3.5 w-3.5" /> {event.venue}
              {event.city ? `, ${event.city}` : ""}
            </div>
          </div>
        )}
        {event.capacity && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Katılım
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Users className="h-3.5 w-3.5" />
              {t("eventsPage.registered", { count: event.registeredCount })} /{" "}
              {event.capacity}
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="relative mt-10 overflow-hidden rounded-2xl border bg-brand-900 p-8 text-white isolate">
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-brand-900 to-brand-600/80"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-1/2 h-[300px] w-[400px] -translate-y-1/2 rounded-full bg-accent/30 blur-3xl"
          />
          <div className="relative">
            <h3 className="text-xl font-bold tracking-tight md:text-2xl md:tracking-[-0.02em]">
              Etkinliğe kayıt ol
            </h3>
            <p className="mt-2 text-sm text-white/80">
              {event.capacity && event.registeredCount >= event.capacity
                ? "Kontenjan dolu, yedek listeye katıl."
                : "Sınırlı kontenjan. Kayıt formu yakında bağlanacak."}
            </p>
            <div className="mt-5">
              <Button asChild size="lg" variant="accent">
                <Link href="/iletisim">
                  İletişime geç <Calendar className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
