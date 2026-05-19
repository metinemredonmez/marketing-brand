import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  UserPlus,
  Wand2,
  Wallet,
  CheckCircle2,
  Wallet as WalletIcon,
  Clock,
  CircleDollarSign,
  Unlock,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { BlockRenderer } from "@/components/marketing/block-renderer";
import { getPageContent } from "@/lib/api/page-contents";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Reklam Ver — Brand Studio",
  description:
    "Türkçe AI ile sponsor içerik üret, MarkaRadar'da yayınla. Self-serve reklam platformu.",
};

export default async function AdvertisePage() {
  const t = await getTranslations();

  // CMS — admin'den /sayfalar üzerinden içerik girilmişse onu render et
  const cms = await getPageContent(
    "reklam-ver",
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
          className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl"
        />
        <div className="container relative mx-auto max-w-5xl px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
            <Sparkles size={12} /> {t("advertise.eyebrow")}
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl whitespace-pre-line text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl md:tracking-[-0.03em]">
            {t("advertise.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("advertise.subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href="/marka-kayit">
                {t("advertise.primaryCta")}{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/iletisim">
                <Mail className="h-4 w-4" /> {t("advertise.secondaryCta")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b bg-surface">
        <div className="container mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-12 max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("advertise.how.eyebrow")}
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl md:tracking-[-0.02em]">
              {t("advertise.how.title")}
            </h2>
          </div>

          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Step
              n={1}
              icon={UserPlus}
              title={t("advertise.how.step1Title")}
              desc={t("advertise.how.step1Desc")}
            />
            <Step
              n={2}
              icon={Wand2}
              title={t("advertise.how.step2Title")}
              desc={t("advertise.how.step2Desc")}
            />
            <Step
              n={3}
              icon={Wallet}
              title={t("advertise.how.step3Title")}
              desc={t("advertise.how.step3Desc")}
            />
            <Step
              n={4}
              icon={CheckCircle2}
              title={t("advertise.how.step4Title")}
              desc={t("advertise.how.step4Desc")}
            />
          </ol>
        </div>
      </section>

      {/* PRICING */}
      <section className="container mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mb-10 max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t("advertise.pricing.eyebrow")}
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl md:tracking-[-0.02em]">
            {t("advertise.pricing.title")}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {t("advertise.pricing.subtitle")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PricingTile
            icon={WalletIcon}
            title={t("advertise.pricing.minBudgetTitle")}
            desc={t("advertise.pricing.minBudgetDesc")}
          />
          <PricingTile
            icon={CircleDollarSign}
            title={t("advertise.pricing.cpmTitle")}
            desc={t("advertise.pricing.cpmDesc")}
          />
          <PricingTile
            icon={Clock}
            title={t("advertise.pricing.approvalTitle")}
            desc={t("advertise.pricing.approvalDesc")}
          />
          <PricingTile
            icon={Unlock}
            title={t("advertise.pricing.noLockInTitle")}
            desc={t("advertise.pricing.noLockInDesc")}
          />
        </div>
      </section>

      {/* RULES */}
      <section className="border-y bg-surface">
        <div className="container mx-auto max-w-3xl px-4 py-20 md:py-24">
          <div className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t("advertise.rules.eyebrow")}
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl md:tracking-[-0.02em]">
            {t("advertise.rules.title")}
          </h2>
          <ul className="mt-8 space-y-3">
            {(["r1", "r2", "r3", "r4", "r5", "r6"] as const).map((k) => (
              <li
                key={k}
                className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm leading-relaxed text-foreground/85"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                  strokeWidth={1.75}
                />
                {t(`advertise.rules.${k}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 py-20 md:py-24">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl md:tracking-[-0.02em]">
          {t("advertise.faq.title")}
        </h2>
        <div className="mt-8 divide-y border-y">
          {(["q1", "q2", "q3", "q4"] as const).map((k) => (
            <FaqItem
              key={k}
              q={t(`advertise.faq.${k}`)}
              a={t(`advertise.faq.${k.replace("q", "a")}`)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="relative mt-12 overflow-hidden rounded-2xl border bg-brand-900 p-8 text-white isolate">
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
            className="pointer-events-none absolute -right-20 top-1/2 h-[300px] w-[400px] -translate-y-1/2 rounded-full bg-accent/30 blur-3xl"
          />
          <div className="relative">
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl md:tracking-[-0.02em]">
              {t("advertise.title").replace("\n", " ")}
            </h3>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="accent">
                <Link href="/marka-kayit">
                  {t("advertise.primaryCta")}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/iletisim"
                className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
              >
                {t("advertise.secondaryCta")} →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Step({
  n,
  icon: Icon,
  title,
  desc,
}: {
  n: number;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <li className="relative flex flex-col rounded-2xl border bg-card p-6">
      <span className="text-[10px] font-mono font-bold text-muted-foreground">
        STEP {String(n).padStart(2, "0")}
      </span>
      <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </li>
  );
}

function PricingTile({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="mt-4 text-sm font-semibold text-foreground">{title}</div>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-foreground">
        {q}
        <span className="text-muted-foreground transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
    </details>
  );
}
