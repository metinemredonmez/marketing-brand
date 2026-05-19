import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Check,
} from "lucide-react";
import { getCourse } from "@/lib/api/courses";
import { ApiError } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n/server";

interface Props {
  params: Promise<{ slug: string }>;
}

const FORMAT_KEY: Record<string, string> = {
  online_cohort: "academyPage.format.online",
  self_paced: "academyPage.format.selfPaced",
  in_person: "academyPage.format.inPerson",
};

const COHORT_STATUS_LABEL: Record<string, string> = {
  open: "Başvurulara açık",
  full: "Dolu",
  in_progress: "Devam ediyor",
  completed: "Tamamlandı",
  canceled: "İptal edildi",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const c = await getCourse(slug);
    return {
      title: `${c.title} — MarkaRadar Akademi`,
      description: c.subtitle ?? c.description ?? undefined,
    };
  } catch {
    return { title: "Kurs bulunamadı" };
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  let course;
  try {
    course = await getCourse(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const t = await getTranslations();
  const fmt = t.locale === "en" ? "en-US" : "tr-TR";
  const openCohort = course.cohorts.find((c) => c.status === "open");

  return (
    <>
      {/* HERO */}
      <section className="border-b">
        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
          <Link
            href="/akademi"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> {t("academyPage.detail.back")}
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="text-[10px] uppercase tracking-widest"
            >
              {FORMAT_KEY[course.format]
                ? t(FORMAT_KEY[course.format])
                : course.format}
            </Badge>
            {course.level && (
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-widest"
              >
                {course.level}
              </Badge>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl md:tracking-[-0.03em]">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-xl">
              {course.subtitle}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {course.durationWeeks && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} />{" "}
                {t("academyPage.detail.duration", {
                  weeks: course.durationWeeks,
                })}
              </span>
            )}
            {course.capacity && (
              <span className="inline-flex items-center gap-1.5">
                <Users size={13} /> {course.capacity}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left — description + outcomes + cohorts */}
          <div className="space-y-12 lg:col-span-2">
            {course.description && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                  Genel bakış
                </div>
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-foreground/85">
                  {course.description}
                </p>
              </div>
            )}

            {course.outcomes.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                  {t("academyPage.detail.outcomes")}
                </div>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {course.outcomes.map((o, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm leading-relaxed text-foreground/90"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                        strokeWidth={2.5}
                      />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.cohorts.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                  {t("academyPage.detail.cohorts")}
                </div>
                <div className="mt-4 space-y-2">
                  {course.cohorts.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4"
                    >
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          Kohort #{c.cohortNumber}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar size={11} />
                          {new Date(c.startDate).toLocaleDateString(fmt)} →{" "}
                          {new Date(c.endDate).toLocaleDateString(fmt)}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {c.enrolledCount}
                          {c.capacity ? ` / ${c.capacity}` : ""}{" "}
                          {t("academyPage.detail.enrolled")}
                        </div>
                      </div>
                      <Badge
                        variant={
                          c.status === "open"
                            ? "success"
                            : c.status === "full"
                              ? "warning"
                              : "secondary"
                        }
                        className="text-[10px] uppercase tracking-widest"
                      >
                        {COHORT_STATUS_LABEL[c.status] ?? c.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {course.prerequisites && course.prerequisites.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Ön gereksinimler
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-foreground/85">
                  {course.prerequisites.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right sticky — price + CTA */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              {course.earlyBirdPriceTry ? (
                <>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                    {t("academyPage.earlyBird")}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight text-foreground md:tracking-[-0.02em]">
                      {Number(course.earlyBirdPriceTry).toLocaleString(fmt)} ₺
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground line-through">
                    {Number(course.priceTry).toLocaleString(fmt)} ₺
                  </div>
                </>
              ) : (
                <div className="text-4xl font-bold tracking-tight text-foreground md:tracking-[-0.02em]">
                  {Number(course.priceTry).toLocaleString(fmt)} ₺
                </div>
              )}

              {openCohort ? (
                <>
                  <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      <Calendar className="h-3 w-3" />{" "}
                      {t("academyPage.nextCohort")}
                    </div>
                    <div className="mt-1.5 text-foreground/85">
                      {new Date(openCohort.startDate).toLocaleDateString(fmt)}
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="accent"
                    size="lg"
                    className="mt-5 w-full"
                  >
                    <Link href={`/login?next=/akademi/${course.slug}`}>
                      <GraduationCap size={16} /> {t("academyPage.enroll")}
                    </Link>
                  </Button>
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Önce hesap aç, sonra kohort'a kayıt olabilirsin.
                  </p>
                </>
              ) : (
                <div className="mt-5 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  Şu anda açık kohort yok. Newsletter'a abone ol, duyuralım.
                </div>
              )}
            </div>

            {/* Instructor placeholder */}
            <div className="mt-4 rounded-2xl border bg-card p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t("academyPage.detail.instructor")}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground/70">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    MarkaRadar Akademi
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Sektör profesyonelleri tarafından verilir.
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
