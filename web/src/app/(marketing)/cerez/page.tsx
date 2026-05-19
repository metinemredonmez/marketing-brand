import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/marketing/block-renderer";
import { getPageContent } from "@/lib/api/page-contents";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Çerez Politikası — MarkaRadar",
  description:
    "MarkaRadar çerez kullanımı, izin, üçüncü taraf çerez politikası.",
};

export default async function CookiePage() {
  const t = await getTranslations();
  const cms = await getPageContent(
    "cerez",
    t.locale === "en" ? "en" : "tr",
  );
  if (!cms || cms.blocks.length === 0) notFound();
  return <BlockRenderer blocks={cms.blocks} />;
}
