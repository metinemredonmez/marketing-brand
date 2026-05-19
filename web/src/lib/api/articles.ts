import "server-only";
import { apiFetch } from "./client";

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  spot: string | null;
  coverUrl: string | null;
  publishedAt: string;
  readingTime: number | null;
  isPremium: boolean;
  isSponsored: boolean;
  sponsorLabel: string | null;
  category: { slug: string; name: string } | null;
  author: { id: string; fullName: string; avatarUrl: string | null } | null;
}

export interface ArticleDetail extends ArticleListItem {
  body: string | null;
  coverAlt: string | null;
  aiSummary: string | null;
  aiWhyMatters: string | null;
  aiBrandTakeaways: string[] | null;
  aiAgencyTakeaways: string[] | null;
  aiHumanRatio: number | null;
  updatedAt: string | null;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export async function listArticles(params: {
  limit?: number;
  offset?: number;
  category?: string;
} = {}): Promise<ListResult<ArticleListItem>> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  if (params.category) qs.set("category", params.category);
  const path = `/articles${qs.toString() ? `?${qs}` : ""}`;
  return apiFetch<ListResult<ArticleListItem>>(path, { revalidate: 30 });
}

export async function getArticle(slug: string): Promise<ArticleDetail> {
  return apiFetch<ArticleDetail>(`/articles/${slug}`, { revalidate: 60 });
}
