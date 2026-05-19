import Link from "next/link";
import { Plus, GraduationCap, Calendar, Users } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n/server";

interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  format: string;
  priceTry: number;
  earlyBirdPriceTry: number | null;
  isActive: boolean;
  cohorts: Array<{
    id: string;
    cohortNumber: number;
    startDate: string;
    endDate: string;
    enrolledCount: number;
    capacity: number | null;
    status: string;
  }>;
}

const COHORT_VARIANT: Record<string, string> = {
  open: "success",
  full: "warning",
  in_progress: "default",
  completed: "secondary",
  canceled: "destructive",
};

export default async function AkademiAdminPage() {
  let courses: Course[] = [];
  try {
    courses = await apiFetch<Course[]>("/courses");
  } catch {}
  const t = await getTranslations();
  const locale = t.locale === "en" ? "en-US" : "tr-TR";
  const cohortTotal = courses.reduce((sum, c) => sum + c.cohorts.length, 0);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <GraduationCap size={24} /> {t("academy.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("academy.subtitle", {
              courses: courses.length,
              cohorts: cohortTotal,
            })}
          </p>
        </div>
        <Button asChild>
          <Link href="/akademi/yeni-kurs">
            <Plus size={16} /> {t("academy.newCourse")}
          </Link>
        </Button>
      </header>

      {courses.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <GraduationCap
            size={48}
            className="mx-auto text-muted-foreground/40"
          />
          <p className="mt-4 text-muted-foreground">{t("academy.empty")}</p>
          <Button asChild className="mt-4">
            <Link href="/akademi/yeni-kurs">{t("academy.firstCourse")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{course.format}</Badge>
                    {!course.isActive && (
                      <Badge variant="destructive">
                        {t("academy.inactive")}
                      </Badge>
                    )}
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-foreground">
                    {course.title}
                  </h2>
                  {course.subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {course.subtitle}
                    </p>
                  )}
                  <div className="mt-2 text-sm text-muted-foreground">
                    {t("academy.price")}:{" "}
                    <span className="font-medium">
                      {Number(course.priceTry).toLocaleString(locale)} TL
                    </span>
                    {course.earlyBirdPriceTry && (
                      <span className="ml-2 text-accent">
                        ({t("academy.earlyBird")}:{" "}
                        {Number(course.earlyBirdPriceTry).toLocaleString(
                          locale,
                        )}{" "}
                        TL)
                      </span>
                    )}
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/akademi/${course.id}/yeni-kohort`}>
                    <Plus size={14} /> {t("academy.openCohort")}
                  </Link>
                </Button>
              </div>

              {course.cohorts.length > 0 && (
                <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {course.cohorts.map((c) => {
                    const variant = COHORT_VARIANT[c.status] ?? "secondary";
                    return (
                      <div
                        key={c.id}
                        className="rounded-md border bg-muted p-3 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">
                            {t("academy.cohortLabel", { n: c.cohortNumber })}
                          </span>
                          <Badge
                            variant={
                              variant as
                                | "default"
                                | "secondary"
                                | "success"
                                | "warning"
                                | "destructive"
                                | "outline"
                                | "accent"
                            }
                          >
                            {t(`academy.cohortStatus.${c.status}`)}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar size={11} />
                          {new Date(c.startDate).toLocaleDateString(locale)} →{" "}
                          {new Date(c.endDate).toLocaleDateString(locale)}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Users size={11} />
                          {c.enrolledCount}
                          {c.capacity ? ` / ${c.capacity}` : ""}{" "}
                          {t("academy.enrolledLabel")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
