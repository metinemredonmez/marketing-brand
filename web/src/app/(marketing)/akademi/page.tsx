import Link from "next/link";
import type { Metadata } from "next";
import {
  GraduationCap,
  Calendar,
  Users,
  Clock,
  Check,
  ArrowRight,
} from "lucide-react";
import { listCourses, type CourseListItem } from "@/lib/api/courses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "MarkaRadar Akademi — AI Marketing Mini MBA + Sektörel Eğitimler",
  description:
    "Kohort tabanlı yoğun programlar, self-paced eğitimler ve in-person workshop'lar.",
};

const FORMAT_KEY: Record<string, string> = {
  online_cohort: "academyPage.format.online",
  self_paced: "academyPage.format.selfPaced",
  in_person: "academyPage.format.inPerson",
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
};

export default async function AkademiPage() {
  let courses: CourseListItem[] = [];
  try {
    courses = await listCourses();
  } catch {}
  const t = await getTranslations();
  const fmt = t.locale === "en" ? "en-US" : "tr-TR";

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
            <GraduationCap className="h-3 w-3" />{" "}
            {t("academyPage.eyebrow")}
          </div>
          <h1 className="mt-6 max-w-3xl whitespace-pre-line text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl md:tracking-[-0.03em]">
            {t("academyPage.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("academyPage.subtitle")}
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        {courses.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <GraduationCap
              size={48}
              className="mx-auto text-muted-foreground/40"
            />
            <p className="mt-4 text-muted-foreground">
              {t("academyPage.empty")}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {courses.map((course) => {
              const nextCohort = course.cohorts[0];
              const earlyBird = course.earlyBirdPriceTry;
              return (
                <Link
                  key={course.id}
                  href={`/akademi/${course.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:border-accent/40 hover:shadow-md"
                >
                  {/* Cover banner */}
                  <div className="relative aspect-[16/8] w-full overflow-hidden bg-muted">
                    {course.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.coverUrl}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <GraduationCap className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />
                    {/* Tag overlay */}
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase tracking-widest backdrop-blur"
                      >
                        {FORMAT_KEY[course.format]
                          ? t(FORMAT_KEY[course.format])
                          : course.format}
                      </Badge>
                      {course.level && (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-widest backdrop-blur"
                        >
                          {LEVEL_LABEL[course.level] ?? course.level}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">

                  {/* Title */}
                  <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-accent md:text-2xl">
                    {course.title}
                  </h2>
                  {course.subtitle && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {course.subtitle}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    {course.durationWeeks && (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} />{" "}
                        {t("academyPage.detail.duration", {
                          weeks: course.durationWeeks,
                        })}
                      </span>
                    )}
                    {course.capacity && (
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} /> {course.capacity}
                      </span>
                    )}
                  </div>

                  {/* Outcomes */}
                  {course.outcomes.length > 0 && (
                    <ul className="mt-5 space-y-2 text-sm text-foreground/85">
                      {course.outcomes.slice(0, 3).map((o: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check
                            className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500"
                            strokeWidth={2.5}
                          />
                          <span className="leading-relaxed">{o}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Next cohort pill */}
                  {nextCohort && (
                    <div className="mt-5 rounded-lg border bg-muted/40 p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground/85">
                        <Calendar size={11} /> {t("academyPage.nextCohort")}
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        {new Date(nextCohort.startDate).toLocaleDateString(fmt)}
                        {nextCohort.capacity && (
                          <span className="ml-1">
                            · {nextCohort.enrolledCount}/{nextCohort.capacity}{" "}
                            {t("academyPage.detail.enrolled")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer — price + CTA */}
                  <div className="mt-6 flex items-end justify-between border-t pt-5">
                    <div>
                      {earlyBird ? (
                        <>
                          <div className="text-[10px] uppercase tracking-widest text-accent">
                            {t("academyPage.earlyBird")}
                          </div>
                          <div className="mt-0.5 flex items-baseline gap-2">
                            <span className="text-xl font-bold tracking-tight text-foreground md:tracking-[-0.02em]">
                              {Number(earlyBird).toLocaleString(fmt)} ₺
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              {Number(course.priceTry).toLocaleString(fmt)} ₺
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-xl font-bold tracking-tight text-foreground md:tracking-[-0.02em]">
                          {Number(course.priceTry).toLocaleString(fmt)} ₺
                        </div>
                      )}
                    </div>
                    <Button variant="accent" size="sm" asChild>
                      <span className="pointer-events-none">
                        {t("academyPage.enroll")}{" "}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Button>
                  </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
