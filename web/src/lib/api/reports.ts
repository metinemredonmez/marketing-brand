import { apiFetch } from "./client";

export interface ReportItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  priceTry: number;
  isFree: boolean;
  includedInTier: string | null;
  downloadCount: number;
  publishedAt: string | null;
}

export const listReports = () =>
  apiFetch<ReportItem[]>("/reports", { revalidate: 300 });
