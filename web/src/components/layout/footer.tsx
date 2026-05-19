import Link from "next/link";
import { getTranslations } from "@/lib/i18n/server";
import { CookiePrefsButton } from "@/components/marketing/cookie-prefs-button";

export async function Footer() {
  const t = await getTranslations();
  return (
    <footer className="mt-16 border-t bg-muted">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="font-bold text-foreground">MarkaRadar</div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("marketing.footer.tagline")}
          </p>
        </div>

        <div className="text-sm">
          <div className="mb-2 font-semibold text-foreground">
            {t("marketing.footer.sectionDiscover")}
          </div>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <Link href="/kategori/ai-marketing">
                {t("marketing.nav.aiMarketing")}
              </Link>
            </li>
            <li>
              <Link href="/ajans-rehberi">
                {t("marketing.nav.agencyDirectory")}
              </Link>
            </li>
            <li>
              <Link href="/akademi">{t("marketing.nav.academy")}</Link>
            </li>
            <li>
              <Link href="/raporlar">{t("marketing.footer.reports")}</Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <div className="mb-2 font-semibold text-foreground">
            {t("marketing.footer.sectionCompany")}
          </div>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <Link href="/hakkimizda">{t("marketing.footer.about")}</Link>
            </li>
            <li>
              <Link href="/iletisim">{t("marketing.footer.contact")}</Link>
            </li>
            <li>
              <Link href="/reklam-ver">{t("marketing.footer.advertise")}</Link>
            </li>
            <li>
              <Link href="/medya-kit">{t("marketing.footer.mediaKit")}</Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <div className="mb-2 font-semibold text-foreground">
            {t("marketing.footer.sectionLegal")}
          </div>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <Link href="/kvkk">{t("marketing.footer.kvkk")}</Link>
            </li>
            <li>
              <Link href="/gizlilik">{t("marketing.footer.privacy")}</Link>
            </li>
            <li>
              <Link href="/cerez">{t("marketing.footer.cookie")}</Link>
            </li>
            <li>
              <Link href="/kullanim-kosullari">
                {t("marketing.footer.tos")}
              </Link>
            </li>
            <li>
              <CookiePrefsButton />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MarkaRadar. {t("marketing.footer.rights")}
      </div>
    </footer>
  );
}
