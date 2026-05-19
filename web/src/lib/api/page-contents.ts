import { apiFetch } from "./client";

export interface PageBlock {
  type: string;
  [key: string]: unknown;
}

export interface PageContent {
  slug: string;
  locale: string;
  title: string | null;
  blocks: PageBlock[];
  isPublished: boolean;
  updatedAt: string;
}

/** Public — sayfa içeriği çek. 404 → null */
export async function getPageContent(
  slug: string,
  locale: "tr" | "en" = "tr",
): Promise<PageContent | null> {
  try {
    return await apiFetch<PageContent>(
      `/page-contents/${encodeURIComponent(slug)}?locale=${locale}`,
      { revalidate: 60 },
    );
  } catch {
    return null;
  }
}
