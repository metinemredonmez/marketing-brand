import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Megaphone, Building2, Newspaper, ArrowRight } from "lucide-react";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { BlockRenderer } from "@/components/marketing/block-renderer";
import { getPageContent } from "@/lib/api/page-contents";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "İletişim — MarkaRadar",
  description: "Sponsorluk, basın, ortaklık talepleri için bizimle iletişime geç.",
};

export default async function ContactPage() {
  const t = await getTranslations();

  // CMS — admin'den /sayfalar üzerinden içerik girilmişse onu render et
  const cms = await getPageContent(
    "iletisim",
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
          className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[900px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-3xl"
        />
        <div className="container relative mx-auto max-w-5xl px-4 py-20 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
            <Mail className="h-3 w-3" /> {t("contact.eyebrow")}
          </div>
          <h1 className="mx-auto mt-6 max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl md:tracking-[-0.03em]">
            {t("contact.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            {t("contact.subtitle")}
          </p>
          <a
            href={`mailto:${t("contact.inbox")}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 font-mono text-sm font-semibold text-foreground hover:border-accent hover:text-accent"
          >
            <Mail className="h-3.5 w-3.5" />
            {t("contact.inbox")}
          </a>
        </div>
      </section>

      {/* CARDS */}
      <section className="container mx-auto max-w-5xl px-4 py-16 md:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          <Card
            icon={Megaphone}
            title={t("contact.cards.sponsor.title")}
            desc={t("contact.cards.sponsor.desc")}
            href="/reklam-ver"
            cta={t("contact.cards.sponsor.cta")}
            accent
          />
          <Card
            icon={Building2}
            title={t("contact.cards.agency.title")}
            desc={t("contact.cards.agency.desc")}
            href="/ajans-rehberi"
            cta={t("contact.cards.agency.cta")}
          />
          <Card
            icon={Newspaper}
            title={t("contact.cards.press.title")}
            desc={t("contact.cards.press.desc")}
            href={`mailto:${t("contact.inbox")}`}
            cta={t("contact.cards.press.cta")}
          />
        </div>
      </section>
    </>
  );
}

function Card({
  icon: Icon,
  title,
  desc,
  href,
  cta,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  href: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border p-6 transition-all hover:border-accent/50 hover:shadow-md ${
        accent ? "border-accent/30 bg-accent/[0.02]" : "bg-card"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          accent ? "bg-accent/15 text-accent" : "bg-muted text-foreground/70"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
      <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
