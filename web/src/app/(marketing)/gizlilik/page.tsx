import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Eye, Database, FileText, Cookie } from "lucide-react";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { BlockRenderer } from "@/components/marketing/block-renderer";
import { getPageContent } from "@/lib/api/page-contents";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — MarkaRadar",
  description:
    "Minimum veri toplama, cookieless analitik, üçüncü taraf reklam tracker'ı yok.",
};

export default async function PrivacyPage() {
  const t = await getTranslations();
  const cms = await getPageContent("gizlilik", t.locale === "en" ? "en" : "tr");
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
          className="pointer-events-none absolute -top-24 left-1/2 h-[320px] w-[800px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-3xl"
        />
        <div className="container relative mx-auto max-w-4xl px-4 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
            <Lock className="h-3 w-3" /> Yasal
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl md:tracking-[-0.03em]">
            Gizlilik Politikası
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Minimum veri topluyoruz, açık şekilde işliyoruz, üçüncü taraflarla
            pazarlama amaçlı paylaşmıyoruz.
          </p>
          <p className="mt-3 text-sm font-mono text-muted-foreground">
            Son güncelleme: 14 Mayıs 2026
          </p>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="container mx-auto max-w-4xl px-4 py-16 md:py-20">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Database className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3 className="mt-4 text-base font-bold tracking-tight text-foreground">
              Minimum veri
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sadece hizmeti sunmak için gerekli olanı alıyoruz. Profilinizi her
              zaman <Link href="/me" className="underline">/me</Link>
              {" "}sayfasından düzenleyip silebilirsiniz.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              <Eye className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3 className="mt-4 text-base font-bold tracking-tight text-foreground">
              Cookieless analitik
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Plausible (anonim, cookie'siz) ve PostHog (opt-in). Davranış
              modelleme yok, sadece agregat sayfa istatistikleri.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Cookie className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3 className="mt-4 text-base font-bold tracking-tight text-foreground">
              Reklam tracker yok
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Facebook Pixel, Google Ads tracking, third-party cookies — hiçbiri
              kullanılmıyor.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="mt-10 rounded-2xl border bg-card p-8 md:p-12">
          <article className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:font-bold prose-p:leading-relaxed prose-h2:mt-10 prose-h2:text-2xl">
            <h2>Ne topluyoruz</h2>
            <p>
              Hesap açtığınızda: e-posta, ad-soyad, opsiyonel olarak LinkedIn
              URL. Abone iseniz: okuma davranışı (hangi makaleler/kaç dakika),
              abonelik tercihleri (segment'ler), beğeniler.
            </p>

            <h2>Nasıl saklıyoruz</h2>
            <p>
              Veriler EU bölgesindeki Postgres veritabanında, TLS encrypted
              connection üzerinden. Backup'lar günlük, 30 gün retention.
            </p>

            <h2>Kimlerle paylaşıyoruz</h2>
            <ul>
              <li>
                <strong>Ödeme:</strong> Stripe / iyzico — PCI uyumlu, biz kart
                bilgisi tutmayız
              </li>
              <li>
                <strong>E-posta:</strong> Resend (transactional), Beehiiv
                (newsletter)
              </li>
              <li>
                <strong>Medya:</strong> Cloudflare R2
              </li>
              <li>
                <strong>İzleme:</strong> Sentry (PII redact edilir)
              </li>
            </ul>

            <h2>Hak ve talepleriniz</h2>
            <p>
              Detaylı KVKK haklarınız için{" "}
              <Link href="/kvkk">KVKK aydınlatma metnimizi</Link> okuyun.
            </p>
          </article>
        </div>

        {/* See also */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/kvkk"
            className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-accent/40"
          >
            <FileText className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
            <div>
              <div className="text-sm font-semibold text-foreground group-hover:text-accent">
                KVKK Aydınlatma Metni
              </div>
              <div className="text-xs text-muted-foreground">
                Detaylı veri işleme politikası
              </div>
            </div>
          </Link>
          <Link
            href="/kullanim-kosullari"
            className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-accent/40"
          >
            <FileText className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
            <div>
              <div className="text-sm font-semibold text-foreground group-hover:text-accent">
                Kullanım Koşulları
              </div>
              <div className="text-xs text-muted-foreground">
                Hesap, içerik, abonelik kuralları
              </div>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
