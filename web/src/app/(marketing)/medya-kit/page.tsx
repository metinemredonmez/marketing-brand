import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/marketing/block-renderer";
import { getPageContent } from "@/lib/api/page-contents";
import { getTranslations } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Medya Kit — MarkaRadar",
  description:
    "MarkaRadar reklam ve sponsorluk için medya kiti — kitle, format, oran kartı.",
};

export default async function MediaKitPage() {
  const t = await getTranslations();
  const cms = await getPageContent(
    "medya-kit",
    t.locale === "en" ? "en" : "tr",
  );
  if (!cms || cms.blocks.length === 0) notFound();
  return <BlockRenderer blocks={cms.blocks} />;
}
