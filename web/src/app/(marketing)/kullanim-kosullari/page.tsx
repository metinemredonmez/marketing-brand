import type { Metadata } from "next";
import Link from "next/link";
import { Scale, FileText, AlertTriangle } from "lucide-react";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { BlockRenderer } from "@/components/marketing/block-renderer";
import { getPageContent } from "@/lib/api/page-contents";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Kullanım Koşulları — MarkaRadar",
  description:
    "MarkaRadar hesap, içerik, ajans review, abonelik ve telif kuralları.",
};

export default async function TermsPage() {
  const t = await getTranslations();
  const cms = await getPageContent(
    "kullanim-kosullari",
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
          className="pointer-events-none absolute -top-24 left-1/2 h-[320px] w-[800px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-3xl"
        />
        <div className="container relative mx-auto max-w-4xl px-4 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
            <Scale className="h-3 w-3" /> Yasal
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl md:tracking-[-0.03em]">
            Kullanım Koşulları
          </h1>
          <p className="mt-3 text-sm font-mono text-muted-foreground">
            Son güncelleme: 14 Mayıs 2026
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto max-w-3xl px-4 py-16 md:py-20">
        <div className="rounded-2xl border bg-card p-8 md:p-12">
          <article className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:font-bold prose-p:leading-relaxed prose-h2:mt-10 prose-h2:text-2xl">
            <h2>1. Hizmet kapsamı</h2>
            <p>
              MarkaRadar, Türkiye'nin pazarlama, reklam ve marka medyasıdır.
              Editöryel içerik, ajans rehberi, iş ilanları, eğitim ve premium
              analiz sunar.
            </p>

            <h2>2. Hesap sorumluluğu</h2>
            <p>
              Hesabınızın güvenliğinden siz sorumlusunuz. Şifre paylaşmayın,
              şüpheli aktivite gördüğünüzde derhal şifrenizi sıfırlayın. 2FA
              önerilir (premium plan dahil).
            </p>

            <h2>3. İçerik politikası</h2>
            <p>
              Yorumlar, ajans review'ları, iş ilanları için: hakaret, iftira,
              ayrımcılık veya doğrulanmamış suçlama içeren içerik kaldırılır.
              Tekrar eden ihlal hesap kapatma sebebidir.
            </p>

            <h2>4. Verified review programı</h2>
            <p>
              Anonim review yok. Gerçek ad, iş e-postası ve LinkedIn URL'i
              zorunlu. Yanlış bilgi tespiti hesap kapatma sebebidir.
              Ajansların review'lara halka açık yanıt hakkı vardır.
            </p>

            <h2>5. Premium abonelik</h2>
            <p>
              Stripe veya iyzico üzerinden ödeme. 30 gün iade garantisi.
              Aboneliği her zaman <Link href="/me">/me</Link> sayfasından iptal
              edebilirsiniz.
            </p>

            <h2>6. Sözleşme süresi</h2>
            <p>
              Yıllık abonelikler otomatik yenilenir. Yenileme öncesi 30 gün
              e-posta hatırlatma alırsınız. İptal anında o dönem sonuna kadar
              erişiminiz devam eder.
            </p>

            <h2>7. Telif</h2>
            <p>
              MarkaRadar makaleleri ve görselleri MarkaRadar'a aittir. Atıf +
              link vererek alıntı yapabilirsiniz; tam kopya değil.
            </p>

            <h2>8. Brand Studio (self-serve reklam)</h2>
            <p>
              Reklam kampanyaları yayın öncesi insan moderasyonundan geçer.
              Yanıltıcı, yasadışı veya brand-safety ihlal eden içerikler
              reddedilir; cüzdan bakiyesi iade edilir.
            </p>

            <h2>9. Sorumluluk sınırlaması</h2>
            <p>
              MarkaRadar editöryel içerik için "olduğu gibi" sunum yapar.
              İçeriklerin doğruluğu en üst düzeyde tutulur ancak yatırım,
              hukuki veya pazarlama tavsiyesi olarak değerlendirilemez.
            </p>

            <h2>10. Geçerli hukuk</h2>
            <p>
              Bu sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda
              İstanbul mahkemeleri ve icra daireleri yetkilidir.
            </p>
          </article>
        </div>

        {/* Notice box */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-900 dark:text-amber-200">
            Önemli değişikliklerde size en az 30 gün önce e-posta ile haber
            verilir. Değişiklik tarihinden sonra siteyi kullanmaya devam etmek
            yeni koşulları kabul etmek anlamına gelir.
          </p>
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
                Veri işleme detayları
              </div>
            </div>
          </Link>
          <Link
            href="/gizlilik"
            className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-accent/40"
          >
            <FileText className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
            <div>
              <div className="text-sm font-semibold text-foreground group-hover:text-accent">
                Gizlilik Politikası
              </div>
              <div className="text-xs text-muted-foreground">
                Veri minimization yaklaşımımız
              </div>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
