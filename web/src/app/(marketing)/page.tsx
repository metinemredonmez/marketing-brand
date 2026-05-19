import Link from "next/link";
import {
  ArrowRight,
  Newspaper,
  TrendingUp,
  Building2,
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  BarChart3,
  Briefcase,
  GraduationCap,
  FileBarChart,
} from "lucide-react";
import { listArticles } from "@/lib/api/articles";
import { ArticleCard } from "@/components/article/article-card";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlockRenderer } from "@/components/marketing/block-renderer";
import { getPageContent } from "@/lib/api/page-contents";
import { getTranslations } from "@/lib/i18n/server";

export default async function HomePage() {
  let articles: Awaited<ReturnType<typeof listArticles>>["items"] = [];
  let apiUp = true;
  try {
    const res = await listArticles({ limit: 6 });
    articles = res.items;
  } catch {
    apiUp = false;
  }
  const t = await getTranslations();

  // CMS — admin'den landing içeriği geliyorsa onu kullan
  const cms = await getPageContent(
    "landing",
    t.locale === "en" ? "en" : "tr",
  );
  const useCms = cms && cms.blocks.length > 0;

  return (
    <>
      {/* ─────────────────── HERO — Linear minimal + clean gradient mesh */}
      <section className="relative overflow-hidden border-b bg-background">
        {/* 1. Background photo — sadece dark mode'da görünür, light'ta tamamen gizli */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden dark:block dark:bg-[url('https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=2400&q=75&auto=format')] dark:bg-cover dark:bg-center dark:opacity-[0.08] dark:grayscale"
        />
        {/* 2. Light mode için soft gradient mesh — multi-color blob blur'lar */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-10 hidden h-[500px] w-[500px] rounded-full bg-brand-500/[0.05] blur-3xl dark:hidden md:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-10 hidden h-[500px] w-[500px] rounded-full bg-accent/[0.06] blur-3xl dark:hidden md:block"
        />
        {/* 3. Üst fade — header'a sıkı geçiş (sadece dark) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background via-background/80 to-transparent"
        />
        {/* 4. Alt fade */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/90 to-transparent"
        />
        {/* 5. Dot grid pattern */}
        <GridPattern variant="dots" />
        {/* 6. Sağ üst köşede ince accent vurgu */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-[400px] w-[400px] rounded-full bg-accent/[0.06] blur-3xl"
        />

        <div className="container relative mx-auto max-w-5xl px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("landing.hero.eyebrow")}
          </div>

          <h1 className="mx-auto mt-6 max-w-3xl whitespace-pre-line text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl md:tracking-[-0.03em]">
            {t("landing.hero.title")}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("landing.hero.subtitle")}
          </p>

          <div className="mx-auto mt-10 max-w-lg">
            <NewsletterForm source="homepage_hero" />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {t("landing.hero.micro")}
          </p>
        </div>
      </section>

      {/* ─── CMS ile yönetilen middle-sections (marquee, stats, bento, audience-tabs, cta, faq) */}
      {useCms ? <BlockRenderer blocks={cms!.blocks} /> : null}

      {/* ─────────────────── TRUST BAR — infinite marquee (CMS yoksa fallback) */}
      {!useCms ? (
      <>
      <section className="relative overflow-hidden border-b bg-surface">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <div className="text-center text-xs uppercase tracking-widest text-muted-foreground">
            {t("landing.trust.label")}
          </div>
          <div className="relative mt-6">
            {/* Edge fade masks — Vercel/Linear style */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-surface to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-surface to-transparent" />
            <Marquee
              pauseOnHover
              className="[--gap:3rem] py-2 text-foreground/45 [&>div]:items-center"
            >
              <span
                className="font-display text-2xl font-extrabold tracking-tight transition-colors hover:text-foreground"
                style={{ fontStretch: "condensed" }}
              >
                Garanti BBVA
              </span>
              <span className="text-2xl font-bold italic tracking-tight transition-colors hover:text-foreground">
                Pegasus
              </span>
              <span className="text-base font-black uppercase tracking-[0.2em] transition-colors hover:text-foreground">
                Vodafone
              </span>
              <span className="font-display text-2xl font-extrabold tracking-tight transition-colors hover:text-foreground">
                Trendyol
              </span>
              <span className="text-2xl font-bold tracking-[-0.04em] transition-colors hover:text-foreground">
                akbank
              </span>
              <span className="font-mono text-xl font-bold lowercase tracking-tight transition-colors hover:text-foreground">
                iyzico
              </span>
              <span className="text-2xl font-bold tracking-tight transition-colors hover:text-foreground">
                Hepsiburada
              </span>
              <span className="font-display text-2xl font-extrabold uppercase tracking-tight transition-colors hover:text-foreground">
                THY
              </span>
              <span className="text-2xl font-bold italic tracking-tight transition-colors hover:text-foreground">
                Getir
              </span>
              <span className="font-mono text-xl font-bold tracking-tight transition-colors hover:text-foreground">
                migros
              </span>
            </Marquee>
          </div>
        </div>
      </section>

      {/* ─────────────────── BENTO GRID — modern asymmetric */}
      <section className="container mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
            <Sparkles className="h-3 w-3" /> {t("landing.publications.eyebrow")}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl md:tracking-[-0.03em]">
            {t("landing.publications.heading")}
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            {t("landing.publications.subtitle")}
          </p>
        </div>

        {/* Bento — asymmetric 4-cell layout */}
        <div className="grid gap-4 md:grid-cols-6 md:grid-rows-2">
          {/* Cell 1 — BIG hero card (Brand Studio, accent) */}
          <BentoCard
            href="/marka-kayit"
            className="md:col-span-4 md:row-span-2"
            accent
            icon={Sparkles}
            eyebrow={t("landing.publications.brandStudio.meta")}
            title={t("landing.publications.brandStudio.title")}
            desc={t("landing.publications.brandStudio.desc")}
            cta={t("landing.publications.brandStudio.cta")}
            image="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80&auto=format"
            size="lg"
          />
          {/* Cell 2 — Pazarlama 5 */}
          <BentoCard
            href="/"
            className="md:col-span-2"
            icon={Newspaper}
            eyebrow={t("landing.publications.pazarlama5.meta")}
            title={t("landing.publications.pazarlama5.title")}
            desc={t("landing.publications.pazarlama5.desc")}
            cta={t("landing.publications.pazarlama5.cta")}
          />
          {/* Cell 3 — Marka Hamlesi */}
          <BentoCard
            href="/kategori/marka-hamlesi"
            className="md:col-span-2"
            icon={TrendingUp}
            eyebrow={t("landing.publications.markaHamlesi.meta")}
            title={t("landing.publications.markaHamlesi.title")}
            desc={t("landing.publications.markaHamlesi.desc")}
            cta={t("landing.publications.markaHamlesi.cta")}
          />
        </div>

        {/* Sub-bento — 3 smaller utility cards */}
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <BentoCard
            href="/ajans-rehberi"
            icon={Building2}
            eyebrow={t("landing.publications.ajansRehberi.meta")}
            title={t("landing.publications.ajansRehberi.title")}
            desc={t("landing.publications.ajansRehberi.desc")}
            cta={t("landing.publications.ajansRehberi.cta")}
            compact
          />
          <BentoCard
            href="/akademi"
            icon={GraduationCap}
            eyebrow="Akademi"
            title="Kohort tabanlı eğitim"
            desc="AI Prompt, Performans, Brand Strategy — sektörden uzmanlarla 4-12 hafta."
            cta="Programlar"
            compact
          />
          <BentoCard
            href="/raporlar"
            icon={FileBarChart}
            eyebrow="Raporlar"
            title="Sektör araştırmaları"
            desc="Türkiye Ajans Ekosistemi, AI Maturity, Social Commerce."
            cta="İndir"
            compact
          />
        </div>
      </section>

      {/* ─────────────────── SEMAFORM DEMO — structured analysis */}
      <section className="border-y bg-surface">
        <div className="container mx-auto max-w-5xl px-4 py-20 md:py-28">
          <div className="mb-10 max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("landing.semaform.eyebrow")}
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl md:tracking-[-0.02em]">
              {t("landing.semaform.title")}
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              {t("landing.semaform.subtitle")}
            </p>
          </div>

          {/* Mock article preview */}
          <article className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">
              {t("landing.semaform.labels.news")}
            </div>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {t("landing.semaform.example.headline")}
            </h3>
            <p className="mt-2 text-base text-muted-foreground">
              {t("landing.semaform.example.lede")}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SemaformBox
                label={t("landing.semaform.labels.brand")}
                content={t("landing.semaform.example.brandTake")}
                tone="brand"
              />
              <SemaformBox
                label={t("landing.semaform.labels.agency")}
                content={t("landing.semaform.example.agencyTake")}
                tone="agency"
              />
            </div>

            <div className="mt-4 rounded-lg border border-dashed bg-muted/30 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t("landing.semaform.labels.notable")}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                {t("landing.semaform.example.notable")}
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ─────────────────── PREMIUM TEASER */}
      <section className="container mx-auto max-w-5xl px-4 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("landing.premium.eyebrow")}
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl md:tracking-[-0.02em]">
              {t("landing.premium.title")}
            </h2>
            <p className="mt-3 max-w-md text-base text-muted-foreground">
              {t("landing.premium.subtitle")}
            </p>
            <Button asChild className="mt-6" variant="accent">
              <Link href="/premium">
                {t("landing.premium.cta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 md:w-[420px]">
            <PlanCard
              title={t("landing.premium.free.title")}
              items={[
                t("landing.premium.free.item1"),
                t("landing.premium.free.item2"),
                t("landing.premium.free.item3"),
              ]}
            />
            <PlanCard
              title={t("landing.premium.paid.title")}
              items={[
                t("landing.premium.paid.item1"),
                t("landing.premium.paid.item2"),
                t("landing.premium.paid.item3"),
                t("landing.premium.paid.item4"),
              ]}
              highlighted
            />
          </div>
        </div>
      </section>

      {/* ─────────────────── KİME UYGUN — Tabs */}
      <section className="border-y bg-surface">
        <div className="container mx-auto max-w-5xl px-4 py-20 md:py-28">
          <div className="mb-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
              <Zap className="h-3 w-3" /> {t("landing.audience.eyebrow")}
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl md:tracking-[-0.03em]">
              {t("landing.audience.title")}
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              {t("landing.audience.subtitle")}
            </p>
          </div>

          <Tabs defaultValue="brand" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="brand">
                {t("landing.audience.tabs.brand")}
              </TabsTrigger>
              <TabsTrigger value="agency">
                {t("landing.audience.tabs.agency")}
              </TabsTrigger>
              <TabsTrigger value="creator">
                {t("landing.audience.tabs.creator")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="brand" className="mt-8 grid gap-4 md:grid-cols-3">
              <FeatureMini
                icon={BarChart3}
                title={t("landing.audience.brand.f1.title")}
                desc={t("landing.audience.brand.f1.desc")}
              />
              <FeatureMini
                icon={Sparkles}
                title={t("landing.audience.brand.f2.title")}
                desc={t("landing.audience.brand.f2.desc")}
              />
              <FeatureMini
                icon={ShieldCheck}
                title={t("landing.audience.brand.f3.title")}
                desc={t("landing.audience.brand.f3.desc")}
              />
            </TabsContent>

            <TabsContent value="agency" className="mt-8 grid gap-4 md:grid-cols-3">
              <FeatureMini
                icon={Building2}
                title={t("landing.audience.agency.f1.title")}
                desc={t("landing.audience.agency.f1.desc")}
              />
              <FeatureMini
                icon={Briefcase}
                title={t("landing.audience.agency.f2.title")}
                desc={t("landing.audience.agency.f2.desc")}
              />
              <FeatureMini
                icon={TrendingUp}
                title={t("landing.audience.agency.f3.title")}
                desc={t("landing.audience.agency.f3.desc")}
              />
            </TabsContent>

            <TabsContent value="creator" className="mt-8 grid gap-4 md:grid-cols-3">
              <FeatureMini
                icon={GraduationCap}
                title={t("landing.audience.creator.f1.title")}
                desc={t("landing.audience.creator.f1.desc")}
              />
              <FeatureMini
                icon={Newspaper}
                title={t("landing.audience.creator.f2.title")}
                desc={t("landing.audience.creator.f2.desc")}
              />
              <FeatureMini
                icon={FileBarChart}
                title={t("landing.audience.creator.f3.title")}
                desc={t("landing.audience.creator.f3.desc")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ─────────────────── BRAND STUDIO CTA */}
      <section className="relative isolate overflow-hidden border-y bg-brand-900 text-white">
        {/* Layer 1: photo (dark abstract neon city — marketing vibe) */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=1920&q=70&auto=format')] bg-cover bg-center opacity-[0.18]"
        />
        {/* Layer 2: deep navy gradient on top */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-900/95 to-brand-600/80"
        />
        {/* Layer 3: orange glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/2 h-[400px] w-[600px] -translate-y-1/2 rounded-full bg-accent/30 blur-3xl"
        />
        {/* Layer 4: subtle dot pattern — modern, mask edge-feather */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1.5px)",
            backgroundSize: "28px 28px",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 80%)",
            maskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 80%)",
          }}
        />
        {/* Layer 5: noise grain — modern depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="container relative mx-auto max-w-5xl px-4 py-20 md:py-28">
          <div className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t("landing.studioCta.eyebrow")}
          </div>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl md:tracking-[-0.02em]">
            {t("landing.studioCta.title")}
          </h2>
          <p className="mt-4 max-w-xl text-base text-white/85 md:text-lg">
            {t("landing.studioCta.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href="/marka-kayit">
                {t("landing.studioCta.cta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Link
              href="/reklam-ver"
              className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
            >
              {t("landing.studioCta.learn")} →
            </Link>
          </div>
        </div>
      </section>
      </>
      ) : null}

      {/* ─────────────────── RECENT ARTICLES (her zaman dynamic, CMS dışı) */}
      <section className="container mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl md:tracking-[-0.02em]">
              {t("landing.recent.title")}
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              {t("landing.recent.subtitle")}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/kategori/ai-marketing">
              {t("landing.recent.all")} <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {!apiUp ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900">
            API offline — yakında tekrar dene.
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
            Henüz makale yok.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────── FAQ — CMS yoksa fallback */}
      {!useCms ? (
        <section className="border-t bg-surface">
          <div className="container mx-auto max-w-3xl px-4 py-20 md:py-28">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
                {t("landing.faq.eyebrow")}
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl md:tracking-[-0.03em]">
                {t("landing.faq.title")}
              </h2>
            </div>

            <Accordion
              type="single"
              collapsible
              className="rounded-2xl border bg-card px-6"
            >
              <AccordionItem value="q1" className="border-b last:border-b-0">
                <AccordionTrigger>{t("landing.faq.q1.q")}</AccordionTrigger>
                <AccordionContent>{t("landing.faq.q1.a")}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2" className="border-b last:border-b-0">
                <AccordionTrigger>{t("landing.faq.q2.q")}</AccordionTrigger>
                <AccordionContent>{t("landing.faq.q2.a")}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3" className="border-b last:border-b-0">
                <AccordionTrigger>{t("landing.faq.q3.q")}</AccordionTrigger>
                <AccordionContent>{t("landing.faq.q3.a")}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4" className="border-b last:border-b-0">
                <AccordionTrigger>{t("landing.faq.q4.q")}</AccordionTrigger>
                <AccordionContent>{t("landing.faq.q4.a")}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q5" className="border-b-0">
                <AccordionTrigger>{t("landing.faq.q5.q")}</AccordionTrigger>
                <AccordionContent>{t("landing.faq.q5.a")}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      ) : null}
    </>
  );
}

function FeatureMini({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-colors hover:border-accent/40">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/30">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

/* ─────────────────────────── Components */

function PublicationCard({
  icon: Icon,
  href,
  title,
  meta,
  desc,
  cta,
  accent,
}: {
  icon: React.ElementType;
  href: string;
  title: string;
  meta: string;
  desc: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col rounded-2xl border p-6 transition-all hover:border-accent/50 hover:shadow-md ${
        accent ? "border-accent/30 bg-accent/[0.02]" : "bg-card"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            accent
              ? "bg-accent/15 text-accent"
              : "bg-muted text-foreground/70"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {meta}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
      <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function BentoCard({
  icon: Icon,
  href,
  title,
  eyebrow,
  desc,
  cta,
  accent,
  className,
  image,
  size,
  compact,
}: {
  icon: React.ElementType;
  href: string;
  title: string;
  eyebrow: string;
  desc: string;
  cta: string;
  accent?: boolean;
  className?: string;
  image?: string;
  size?: "lg";
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative isolate flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:border-accent/50 hover:shadow-lg ${
        accent ? "border-accent/30" : ""
      } ${className ?? ""}`}
    >
      {/* Background image — only on big card */}
      {image && size === "lg" && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.18] transition-opacity duration-500 group-hover:opacity-30"
            style={{ backgroundImage: `url('${image}')` }}
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-br from-background/40 via-background/80 to-background"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 -z-10 h-[300px] w-[300px] rounded-full bg-accent/10 blur-3xl"
          />
        </>
      )}

      <div className={`flex flex-1 flex-col ${compact ? "p-5" : "p-6 md:p-8"}`}>
        <div className="flex items-start justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              accent
                ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                : "bg-muted text-foreground/70"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </span>
        </div>
        <h3
          className={`mt-5 font-bold tracking-tight text-foreground ${
            size === "lg" ? "text-2xl md:text-4xl md:tracking-[-0.02em]" : "text-lg"
          }`}
        >
          {title}
        </h3>
        <p
          className={`mt-2 leading-relaxed text-muted-foreground ${
            size === "lg" ? "text-base md:text-lg" : "text-sm"
          }`}
        >
          {desc}
        </p>
        <div className="mt-auto pt-5 inline-flex items-center gap-1 text-sm font-medium text-accent">
          {cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function SemaformBox({
  label,
  content,
  tone,
}: {
  label: string;
  content: string;
  tone: "brand" | "agency";
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        tone === "brand"
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30"
          : "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30"
      }`}
    >
      <div
        className={`text-[10px] font-semibold uppercase tracking-widest ${
          tone === "brand"
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-blue-700 dark:text-blue-400"
        }`}
      >
        {label}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
        {content}
      </p>
    </div>
  );
}

function PlanCard({
  title,
  items,
  highlighted,
}: {
  title: string;
  items: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlighted ? "border-accent/40 bg-accent/[0.03]" : "bg-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-foreground">{title}</div>
        {highlighted && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
            49 ₺/ay
          </span>
        )}
      </div>
      <ul className="mt-3 space-y-1.5">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-xs leading-relaxed text-foreground/80"
          >
            <Check
              className={`mt-0.5 h-3 w-3 shrink-0 ${
                highlighted ? "text-accent" : "text-emerald-500"
              }`}
              strokeWidth={2.5}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
