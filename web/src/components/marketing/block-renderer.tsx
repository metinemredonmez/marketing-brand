import Link from "next/link";
import {
  ArrowRight,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Building2,
  Briefcase,
  TrendingUp,
  GraduationCap,
  FileBarChart,
  Zap,
  BarChart3,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Marquee } from "@/components/ui/marquee";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { PageBlock } from "@/lib/api/page-contents";

const ICONS: Record<string, LucideIcon> = {
  Newspaper,
  ShieldCheck,
  Sparkles,
  Building2,
  Briefcase,
  TrendingUp,
  GraduationCap,
  FileBarChart,
  Zap,
  BarChart3,
  Mail,
};

function pickIcon(name?: unknown): LucideIcon {
  if (typeof name === "string" && name in ICONS) return ICONS[name];
  return Sparkles;
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function HeroBlock({ block }: { block: PageBlock }) {
  return (
    <section className="relative overflow-hidden border-b">
      <GridPattern variant="dots" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[320px] w-[800px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-3xl"
      />
      <div className="container relative mx-auto max-w-5xl px-4 py-20 md:py-24">
        {block.eyebrow ? (
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
            <Sparkles className="h-3 w-3" /> {asString(block.eyebrow)}
          </div>
        ) : null}
        <h1 className="mt-6 max-w-3xl whitespace-pre-line text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl md:tracking-[-0.03em]">
          {asString(block.title)}
        </h1>
        {block.subtitle ? (
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {asString(block.subtitle)}
          </p>
        ) : null}
        {block.ctaLabel && block.ctaHref ? (
          <div className="mt-8">
            <Button asChild size="lg" variant="accent">
              <Link href={asString(block.ctaHref)}>
                {asString(block.ctaLabel)}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function FeatureGridBlock({ block }: { block: PageBlock }) {
  const items = Array.isArray(block.items) ? block.items : [];
  return (
    <section className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
      {block.heading ? (
        <h2 className="mb-10 max-w-2xl text-3xl font-bold tracking-tight text-foreground md:text-4xl md:tracking-[-0.02em]">
          {asString(block.heading)}
        </h2>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((raw, i) => {
          const it = raw as Record<string, unknown>;
          const Icon = pickIcon(it.icon);
          return (
            <div
              key={i}
              className="rounded-2xl border bg-card p-6 transition-colors hover:border-accent/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/30">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 text-base font-bold tracking-tight text-foreground">
                {asString(it.title)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {asString(it.desc)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FaqBlock({ block }: { block: PageBlock }) {
  const items = Array.isArray(block.items) ? block.items : [];
  return (
    <section className="border-t bg-surface">
      <div className="container mx-auto max-w-3xl px-4 py-16 md:py-20">
        {block.title ? (
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {asString(block.title)}
          </h2>
        ) : null}
        <Accordion
          type="single"
          collapsible
          className="rounded-2xl border bg-card px-6"
        >
          {items.map((raw, i) => {
            const it = raw as Record<string, unknown>;
            return (
              <AccordionItem
                key={i}
                value={`q${i}`}
                className="border-b last:border-b-0"
              >
                <AccordionTrigger>{asString(it.q)}</AccordionTrigger>
                <AccordionContent>{asString(it.a)}</AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}

function TextBlock({ block }: { block: PageBlock }) {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="rounded-2xl border bg-card p-8">
        <article
          className="prose prose-stone dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: asString(block.html) }}
        />
      </div>
    </section>
  );
}

function CtaBannerBlock({ block }: { block: PageBlock }) {
  return (
    <section className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-brand-900 to-brand-600 p-8 text-white md:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-1/2 h-[300px] w-[400px] -translate-y-1/2 rounded-full bg-accent/30 blur-3xl"
        />
        <div className="relative">
          <h3 className="max-w-2xl text-2xl font-bold tracking-tight md:text-4xl md:tracking-[-0.02em]">
            {asString(block.title)}
          </h3>
          {block.subtitle ? (
            <p className="mt-3 max-w-xl text-sm text-white/85 md:text-base">
              {asString(block.subtitle)}
            </p>
          ) : null}
          {block.ctaLabel && block.ctaHref ? (
            <div className="mt-6">
              <Button asChild size="lg" variant="accent">
                <Link href={asString(block.ctaHref)}>
                  {asString(block.ctaLabel)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function MarqueeBlock({ block }: { block: PageBlock }) {
  const items = Array.isArray(block.items) ? (block.items as string[]) : [];
  return (
    <section className="relative overflow-hidden border-y bg-surface">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        {block.label ? (
          <div className="text-center text-xs uppercase tracking-widest text-muted-foreground">
            {asString(block.label)}
          </div>
        ) : null}
        <div className="relative mt-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-surface to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-surface to-transparent" />
          <Marquee pauseOnHover className="[--gap:3rem] py-2 text-foreground/45">
            {items.map((label, i) => (
              <span
                key={i}
                className="text-2xl font-bold tracking-tight transition-colors hover:text-foreground"
              >
                {label}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

function BentoBlock({ block }: { block: PageBlock }) {
  const items = Array.isArray(block.items)
    ? (block.items as Array<Record<string, unknown>>)
    : [];
  return (
    <section className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
      {block.heading ? (
        <div className="mb-10 max-w-2xl">
          {block.eyebrow ? (
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
              <Sparkles className="h-3 w-3" /> {asString(block.eyebrow)}
            </div>
          ) : null}
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl md:tracking-[-0.03em]">
            {asString(block.heading)}
          </h2>
          {block.subtitle ? (
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              {asString(block.subtitle)}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((it, i) => {
          const Icon = pickIcon(it.icon);
          const accent = Boolean(it.accent);
          const href = asString(it.href, "#");
          return (
            <Link
              key={i}
              href={href}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:border-accent/50 hover:shadow-lg ${
                accent ? "border-accent/30 bg-accent/[0.02]" : ""
              }`}
            >
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
                {it.eyebrow ? (
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {asString(it.eyebrow)}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground">
                {asString(it.title)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {asString(it.desc)}
              </p>
              {it.cta ? (
                <div className="mt-auto pt-5 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  {asString(it.cta)}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function AudienceTabsBlock({ block }: { block: PageBlock }) {
  const tabs = Array.isArray(block.tabs)
    ? (block.tabs as Array<Record<string, unknown>>)
    : [];
  if (tabs.length === 0) return null;
  const defaultValue = asString(tabs[0]?.value, "tab-0");
  return (
    <section className="border-y bg-surface">
      <div className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          {block.eyebrow ? (
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
              <Zap className="h-3 w-3" /> {asString(block.eyebrow)}
            </div>
          ) : null}
          {block.title ? (
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl md:tracking-[-0.03em]">
              {asString(block.title)}
            </h2>
          ) : null}
          {block.subtitle ? (
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              {asString(block.subtitle)}
            </p>
          ) : null}
        </div>

        <Tabs defaultValue={defaultValue} className="w-full">
          <TabsList
            className="grid w-full max-w-md"
            style={{
              gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
            }}
          >
            {tabs.map((tab, i) => (
              <TabsTrigger
                key={i}
                value={asString(tab.value, `tab-${i}`)}
              >
                {asString(tab.label)}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab, i) => {
            const features = Array.isArray(tab.features)
              ? (tab.features as Array<Record<string, unknown>>)
              : [];
            return (
              <TabsContent
                key={i}
                value={asString(tab.value, `tab-${i}`)}
                className="mt-8 grid gap-4 md:grid-cols-3"
              >
                {features.map((f, j) => {
                  const Icon = pickIcon(f.icon);
                  return (
                    <div
                      key={j}
                      className="rounded-xl border bg-card p-5 transition-colors hover:border-accent/40"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/30">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <h3 className="mt-4 text-base font-bold tracking-tight text-foreground">
                        {asString(f.title)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {asString(f.desc)}
                      </p>
                    </div>
                  );
                })}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}

function StatsBlock({ block }: { block: PageBlock }) {
  const items = Array.isArray(block.items)
    ? (block.items as Array<Record<string, unknown>>)
    : [];
  return (
    <section className="border-y bg-card">
      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        {block.heading ? (
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {asString(block.heading)}
          </h2>
        ) : null}
        <div className="grid gap-6 md:grid-cols-4">
          {items.map((it, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl md:tracking-[-0.03em]">
                {asString(it.value)}
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {asString(it.label)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * BlockRenderer — admin'den gelen page-contents'i parça parça render eder.
 * Bilinmeyen block tipini sessizce atlar.
 */
export function BlockRenderer({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "hero":
            return <HeroBlock key={i} block={block} />;
          case "feature-grid":
            return <FeatureGridBlock key={i} block={block} />;
          case "faq":
            return <FaqBlock key={i} block={block} />;
          case "text":
            return <TextBlock key={i} block={block} />;
          case "cta-banner":
            return <CtaBannerBlock key={i} block={block} />;
          case "marquee":
            return <MarqueeBlock key={i} block={block} />;
          case "bento":
            return <BentoBlock key={i} block={block} />;
          case "audience-tabs":
            return <AudienceTabsBlock key={i} block={block} />;
          case "stats":
            return <StatsBlock key={i} block={block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
