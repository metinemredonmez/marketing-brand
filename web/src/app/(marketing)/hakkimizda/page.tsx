import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Users,
  Building2,
  Mail,
  Trophy,
  Newspaper,
  GraduationCap,
  ArrowRight,
  Eye,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { BlockRenderer } from "@/components/marketing/block-renderer";
import { getPageContent } from "@/lib/api/page-contents";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "MarkaRadar Hakkında",
  description:
    "Türkiye'nin AI-native pazarlama medyası — vizyon, misyon, iletişim.",
};

export default async function AboutPage() {
  const t = await getTranslations();

  // CMS — eğer admin'den /sayfalar üzerinden içerik girilmişse onu render et
  const cms = await getPageContent(
    "hakkimizda",
    t.locale === "en" ? "en" : "tr",
  );
  if (cms && cms.blocks.length > 0) {
    return <BlockRenderer blocks={cms.blocks} />;
  }

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <GridPattern variant="dots" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-3xl"
        />
        <div className="container relative mx-auto max-w-5xl px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("about.eyebrow")}
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl whitespace-pre-line text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl md:tracking-[-0.03em]">
            {t("about.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      {/* VISION + MISSION */}
      <section className="container mx-auto max-w-5xl px-4 py-20 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Eye className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("about.vision.label")}
            </div>
            <p className="mt-2 text-base leading-relaxed text-foreground/90">
              {t("about.vision.body")}
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Target className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("about.mission.label")}
            </div>
            <p className="mt-2 text-base leading-relaxed text-foreground/90">
              {t("about.mission.body")}
            </p>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="border-y bg-surface">
        <div className="container mx-auto max-w-5xl px-4 py-20 md:py-24">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl md:tracking-[-0.02em]">
            {t("about.whatWeDo")}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={Newspaper}
              text={t("about.features.newsletter")}
              href="/#newsletter"
            />
            <Feature
              icon={Building2}
              text={t("about.features.directory")}
              href="/ajans-rehberi"
            />
            <Feature
              icon={Sparkles}
              text={t("about.features.aiStudio")}
              href="/marka-kayit"
            />
            <Feature
              icon={Users}
              text={t("about.features.premium")}
              href="/premium"
            />
            <Feature
              icon={Trophy}
              text={t("about.features.awards")}
              href="/etkinlikler"
            />
            <Feature
              icon={GraduationCap}
              text={t("about.features.academy")}
              href="/akademi"
            />
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="container mx-auto max-w-5xl px-4 py-20 md:py-24">
        <div className="relative isolate overflow-hidden rounded-2xl border bg-brand-900 p-8 text-white md:p-12">
          <div
            aria-hidden
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=1600&q=70&auto=format')] bg-cover bg-center opacity-[0.18]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-900/95 to-brand-600/80"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-1/2 h-[400px] w-[500px] -translate-y-1/2 rounded-full bg-accent/30 blur-3xl"
          />
          <div className="relative">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-accent">
              {t("about.contactCta.title")}
            </div>
            <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight md:text-4xl md:tracking-[-0.02em]">
              {t("about.contactCta.body")}{" "}
              <a
                href="mailto:hello@markaradar.com"
                className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
              >
                hello@markaradar.com
              </a>
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="accent">
                <Link href="/reklam-ver">
                  {t("about.contactCta.advertise")}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/iletisim"
                className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
              >
                <Mail className="mr-1 inline h-3.5 w-3.5" />{" "}
                {t("about.contactCta.contact")} →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({
  icon: Icon,
  text,
  href,
}: {
  icon: React.ElementType;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-2xl border bg-card p-5 transition-all hover:border-accent/40 hover:shadow-md"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70 group-hover:bg-accent/10 group-hover:text-accent">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
    </Link>
  );
}
