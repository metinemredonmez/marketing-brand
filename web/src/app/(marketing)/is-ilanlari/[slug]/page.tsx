import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { getJob } from "@/lib/api/jobs";
import { ApiError } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n/server";

interface Props {
  params: Promise<{ slug: string }>;
}

const SENIORITY_LABEL: Record<string, string> = {
  intern: "Stajyer",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  director: "Director",
};

const EMPLOYMENT_LABEL: Record<string, string> = {
  full_time: "Tam zamanlı",
  part_time: "Yarı zamanlı",
  freelance: "Freelance",
  contract: "Sözleşmeli",
  internship: "Staj",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const j = await getJob(slug);
    return {
      title: `${j.title} — ${j.companyName}`,
      description: j.description.slice(0, 160),
    };
  } catch {
    return { title: "İlan bulunamadı" };
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  let job;
  try {
    job = await getJob(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const t = await getTranslations();
  const fmt = t.locale === "en" ? "en-US" : "tr-TR";
  const applyHref =
    job.applyUrl ?? (job.applyEmail ? `mailto:${job.applyEmail}` : null);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link
        href="/is-ilanlari"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> {t("jobsPage.detail.back")}
      </Link>

      {/* Header */}
      <header className="mt-6">
        <div className="flex flex-wrap gap-2">
          {job.plan === "premium_distribution" && (
            <Badge
              variant="accent"
              className="text-[10px] uppercase tracking-widest"
            >
              Premium ilan
            </Badge>
          )}
          {job.plan === "featured" && (
            <Badge className="text-[10px] uppercase tracking-widest">
              Featured
            </Badge>
          )}
          {job.isRemote && (
            <Badge
              variant="secondary"
              className="text-[10px] uppercase tracking-widest"
            >
              {t("jobsPage.remote")}
            </Badge>
          )}
        </div>
        <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl md:tracking-[-0.03em]">
          {job.title}
        </h1>
        <div className="mt-3 inline-flex items-center gap-1.5 text-lg text-foreground/85">
          <Building2 size={16} /> {job.companyName}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase size={13} /> {SENIORITY_LABEL[job.seniority]}
          </span>
          <span>{EMPLOYMENT_LABEL[job.employmentType]}</span>
          {job.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} /> {job.location}
            </span>
          )}
          {(job.salaryMin || job.salaryMax) && (
            <span className="inline-flex items-center gap-1.5 font-mono">
              <DollarSign size={13} />
              {job.salaryMin ? Number(job.salaryMin).toLocaleString(fmt) : ""}
              {job.salaryMin && job.salaryMax ? "–" : ""}
              {job.salaryMax
                ? Number(job.salaryMax).toLocaleString(fmt)
                : ""}{" "}
              {job.currency}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} /> {formatDate(job.publishedAt)}
          </span>
        </div>
      </header>

      {/* Description */}
      <div
        className="prose prose-stone dark:prose-invert mt-10 max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:font-bold prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: `<h2>İş tanımı</h2><div>${job.description.replace(/\n/g, "<br/>")}</div>`,
        }}
      />

      {/* Apply CTA */}
      {applyHref && (
        <div className="mt-12 rounded-2xl border bg-gradient-to-br from-brand-900 to-brand-600 p-8 text-white">
          <h3 className="text-xl font-bold tracking-tight md:text-2xl md:tracking-[-0.02em]">
            Bu pozisyon ilgini çekiyor mu?
          </h3>
          <p className="mt-2 text-sm text-white/80">
            Başvurun doğrudan {job.companyName} ekibine ulaşır.
          </p>
          <div className="mt-5">
            <Button asChild size="lg" variant="accent">
              <a href={applyHref} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={15} /> {t("jobsPage.detail.apply")}
              </a>
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
