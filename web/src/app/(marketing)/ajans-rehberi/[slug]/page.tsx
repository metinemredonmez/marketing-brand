import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Globe,
  Linkedin,
  Mail,
  Star,
  CheckCircle2,
  Users,
  ThumbsUp,
  AlertTriangle,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { getAgency } from "@/lib/api/agencies";
import { ApiError, apiFetch } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewSubmitForm } from "@/components/agency/review-submit-form";
import { formatDate } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n/server";

interface Props {
  params: Promise<{ slug: string }>;
}

interface Review {
  id: string;
  reviewerName: string;
  reviewerRole: string | null;
  reviewerCompany: string | null;
  ratingOverall: number;
  ratingQuality: number;
  ratingCommunication: number;
  ratingTimeline: number;
  ratingValue: number;
  title: string;
  content: string;
  pros: string | null;
  cons: string | null;
  wouldWorkAgain: string | null;
  verificationStatus: string;
  agencyResponse: string | null;
  agencyResponseAt: string | null;
  createdAt: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const a = await getAgency(slug);
    return {
      title: `${a.name} — MarkaRadar Ajans Rehberi`,
      description:
        a.tagline ??
        `${a.name} — doğrulanmış müşteri yorumları ve ajans profili.`,
    };
  } catch {
    return { title: "Ajans bulunamadı" };
  }
}

export default async function AgencyDetailPage({ params }: Props) {
  const { slug } = await params;

  let agency;
  try {
    agency = await getAgency(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  let reviews: { items: Review[]; total: number } = { items: [], total: 0 };
  try {
    reviews = await apiFetch<{ items: Review[]; total: number }>(
      `/agencies/${agency.id}/reviews?limit=20`,
    );
  } catch {}

  const t = await getTranslations();
  const verified = agency.verificationLevel !== "unverified";
  const isHighTier = agency.tier === "elite" || agency.tier === "featured";

  return (
    <>
      {/* HERO */}
      <section className="border-b">
        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
          <Link
            href="/ajans-rehberi"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> {t("agencyDirectory.detail.back")}
          </Link>

          <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start">
            {/* Logo */}
            {agency.logoUrl ? (
              <img
                src={agency.logoUrl}
                alt={agency.name}
                className="size-20 rounded-2xl object-cover md:size-24"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground md:size-24">
                <Building2 size={36} strokeWidth={1.5} />
              </div>
            )}

            {/* Body */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {agency.tier !== "free" && (
                  <Badge
                    variant={isHighTier ? "accent" : "secondary"}
                    className="text-[10px] uppercase tracking-widest"
                  >
                    {agency.tier}
                  </Badge>
                )}
                {verified && (
                  <Badge
                    variant="success"
                    className="text-[10px] uppercase tracking-widest"
                  >
                    <CheckCircle2 size={10} className="mr-1" />{" "}
                    {t("agencyDirectory.verified")}
                  </Badge>
                )}
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl md:tracking-[-0.03em]">
                {agency.name}
              </h1>
              {agency.tagline && (
                <p className="mt-3 text-base text-muted-foreground md:text-lg">
                  {agency.tagline}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {agency.city && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} /> {agency.city}
                  </span>
                )}
                {agency.foundedYear && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} /> {agency.foundedYear}
                  </span>
                )}
                {agency.teamSizeRange && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={13} /> {agency.teamSizeRange}
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {agency.website && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={agency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe size={13} /> Website
                    </a>
                  </Button>
                )}
                {agency.linkedinUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={agency.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin size={13} /> LinkedIn
                    </a>
                  </Button>
                )}
                {agency.email && (
                  <Button asChild variant="outline" size="sm">
                    <a href={`mailto:${agency.email}`}>
                      <Mail size={13} /> E-posta
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Rating box */}
            <div className="rounded-2xl border bg-card p-5 text-center md:w-56">
              <div className="flex items-baseline justify-center gap-1">
                <Star size={20} className="fill-amber-400 text-amber-400" />
                <span className="text-4xl font-bold tracking-tight text-foreground md:tracking-[-0.02em]">
                  {Number(agency.ratingAvg).toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">/5</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t("agencyDirectory.reviewCount", { count: agency.reviewCount })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT + meta sections */}
      <section className="border-b bg-surface">
        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-3">
            {/* About */}
            <div className="md:col-span-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                {t("agencyDirectory.detail.aboutTab")}
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl md:tracking-[-0.02em]">
                {agency.name}
              </h2>
              {agency.description ? (
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/85">
                  {agency.description}
                </p>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  {agency.tagline ?? "—"}
                </p>
              )}
            </div>

            {/* Right column — services + industries */}
            <div className="space-y-6">
              {agency.services.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t("agencyDirectory.detail.services")}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {agency.services.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="text-[11px]"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {agency.industries.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t("agencyDirectory.detail.industries")}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {agency.industries.map((i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[11px]"
                      >
                        {i}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-accent">
              {t("agencyDirectory.detail.reviewsTab")}
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl md:tracking-[-0.02em]">
              {t("agencyDirectory.reviewCount", { count: reviews.total })}
            </h2>
          </div>
          <Button asChild variant="accent" size="sm">
            <a href="#review-yaz">
              {t("agencyDirectory.detail.writeReview")}
            </a>
          </Button>
        </div>

        {reviews.items.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <Star size={48} className="mx-auto text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">
              {t("agencyDirectory.detail.noReviews")}
            </p>
            <Button asChild className="mt-5" variant="accent" size="sm">
              <a href="#review-yaz">
                {t("agencyDirectory.detail.writeReview")}
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.items.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>

      {/* Review form */}
      <section id="review-yaz" className="border-t bg-surface">
        <div className="container mx-auto max-w-3xl px-4 py-16 md:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl md:tracking-[-0.02em]">
            {agency.name} ile çalıştın mı?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Şirket e-postanı kullan (gmail/yahoo kabul edilmez). LinkedIn URL'in
            doğrulama için zorunlu. Anonim review YOK — kimlik bilgilerin
            doğrulanır.
          </p>
          <div className="mt-8">
            <ReviewSubmitForm agencyId={agency.id} agencyName={agency.name} />
          </div>
        </div>
      </section>
    </>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-2xl border bg-card p-6 transition-all hover:border-accent/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {review.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={13}
                className={
                  i < review.ratingOverall
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                }
              />
            ))}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {review.reviewerName}
            </span>
            {review.reviewerRole && <span> · {review.reviewerRole}</span>}
            {review.reviewerCompany && (
              <span> @ {review.reviewerCompany}</span>
            )}
          </div>
        </div>
        <Badge
          variant="success"
          className="text-[10px] uppercase tracking-widest"
        >
          <CheckCircle2 size={10} className="mr-1" />
          {review.verificationStatus === "fully_verified"
            ? "Tam doğrulanmış"
            : "Doğrulanmış"}
        </Badge>
      </div>

      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
        {review.content}
      </p>

      {(review.pros || review.cons) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {review.pros && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                <ThumbsUp className="h-3 w-3" /> Beğenilenler
              </div>
              <p className="mt-1.5 leading-relaxed text-foreground/90">
                {review.pros}
              </p>
            </div>
          )}
          {review.cons && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" /> Geliştirme
              </div>
              <p className="mt-1.5 leading-relaxed text-foreground/90">
                {review.cons}
              </p>
            </div>
          )}
        </div>
      )}

      {review.agencyResponse && (
        <div className="mt-4 rounded-lg border-l-2 border-accent bg-muted/40 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-accent">
            Ajansın yanıtı
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
            {review.agencyResponse}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-muted-foreground">
        {formatDate(review.createdAt)}
      </div>
    </article>
  );
}
