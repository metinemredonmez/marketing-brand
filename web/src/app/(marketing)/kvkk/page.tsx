import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Mail, FileText } from "lucide-react";
import { GridPattern } from "@/components/marketing/grid-pattern";
import { BlockRenderer } from "@/components/marketing/block-renderer";
import { getPageContent } from "@/lib/api/page-contents";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni — MarkaRadar",
  description:
    "MarkaRadar kişisel veri işleme politikası ve KVKK kapsamında haklarınız.",
};

export default async function KvkkPage() {
  const t = await getTranslations();
  const cms = await getPageContent("kvkk", t.locale === "en" ? "en" : "tr");
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
            <Shield className="h-3 w-3" /> Yasal
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl md:tracking-[-0.03em]">
            KVKK Aydınlatma Metni
          </h1>
          <p className="mt-4 text-sm font-mono text-muted-foreground">
            Son güncelleme: 14 Mayıs 2026
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto max-w-3xl px-4 py-16 md:py-20">
        <div className="rounded-2xl border bg-card p-8 md:p-12">
          <article className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:font-bold prose-p:leading-relaxed prose-h2:mt-10 prose-h2:text-2xl">
            <h2>1. Veri Sorumlusu</h2>
            <p>
              MarkaRadar, kullanıcılarının kişisel verilerini 6698 sayılı Kişisel
              Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla
              işlemektedir.
            </p>

            <h2>2. İşlenen Veriler</h2>
            <ul>
              <li>
                <strong>Kimlik:</strong> Ad-soyad, e-posta, LinkedIn profili
              </li>
              <li>
                <strong>İletişim:</strong> İş e-postası, telefon (opsiyonel)
              </li>
              <li>
                <strong>İşlem güvenliği:</strong> IP, user agent, oturum logları
              </li>
              <li>
                <strong>Davranışsal:</strong> Okuma davranışı, abonelik tercihleri
              </li>
              <li>
                <strong>Ödeme (premium üye):</strong> Stripe/iyzico tarafından
                işlenir; biz kart bilgisi saklamayız
              </li>
            </ul>

            <h2>3. İşleme Amaçları</h2>
            <ul>
              <li>Hizmet sunumu, abonelik yönetimi, sipariş takibi</li>
              <li>Newsletter ve içerik gönderimi (açık rıza ile)</li>
              <li>Ajans review verification süreci (e-posta + LinkedIn doğrulama)</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi (VERBİS, faturalama)</li>
              <li>Anonim agregat analitik (PostHog, Plausible)</li>
            </ul>

            <h2>4. Aktarılan Üçüncü Taraflar</h2>
            <ul>
              <li>Stripe, iyzico — ödeme işleme</li>
              <li>Resend — transactional mail</li>
              <li>Beehiiv — newsletter</li>
              <li>Cloudflare R2 — medya depolama</li>
              <li>Sentry — hata izleme (PII redacted)</li>
              <li>OpenAI/Anthropic — AI üretim (kullanıcı verisi gönderilmez)</li>
            </ul>

            <h2>5. Haklarınız</h2>
            <p>
              KVKK madde 11 kapsamında verilerinize erişme, düzeltme, silme veya
              anonimleştirme talep edebilirsiniz:
            </p>
            <ul>
              <li>
                <strong>Verilerimi indir:</strong>{" "}
                <Link href="/me">/me</Link> sayfasından ZIP olarak
              </li>
              <li>
                <strong>Hesabımı sil:</strong> 30 gün geri alma penceresi + anonim
                hale getirme
              </li>
              <li>
                <strong>Şikayet:</strong> kvkk@markaradar.com
              </li>
            </ul>

            <h2>6. Saklama Süresi</h2>
            <p>
              Aktif hesap için aboneliğiniz boyunca; pasifleştirildikten sonra 30
              gün; sonra anonimleştirme. Yasal saklama (fatura) için 10 yıl.
            </p>

            <h2>7. Çerezler</h2>
            <p>
              Sadece zorunlu çerezler (oturum, CSRF) varsayılan; analitik ve
              pazarlama çerezleri için açık rıza alınır.
            </p>
          </article>
        </div>

        {/* Contact box */}
        <div className="mt-8 rounded-2xl border bg-gradient-to-br from-brand-900 to-brand-600 p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight md:tracking-[-0.02em]">
                KVKK hakları talebi
              </h3>
              <p className="mt-1 text-sm text-white/80">
                Tüm talepleriniz 30 gün içinde yanıtlanır.
              </p>
              <a
                href="mailto:kvkk@markaradar.com"
                className="mt-3 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium hover:bg-accent-600"
              >
                <Mail className="h-3.5 w-3.5" /> kvkk@markaradar.com
              </a>
            </div>
          </div>
        </div>

        {/* See also */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
