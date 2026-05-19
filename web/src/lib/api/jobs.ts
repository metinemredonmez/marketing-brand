import "server-only";
import { apiFetch } from "./client";

export interface JobListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  companyName: string;
  category: string;
  seniority: string;
  employmentType: string;
  location: string | null;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  plan: string;
  publishedAt: string;
  expiresAt: string | null;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export async function listJobs(params: {
  limit?: number;
  offset?: number;
  category?: string;
  seniority?: string;
  isRemote?: boolean;
  q?: string;
} = {}): Promise<ListResult<JobListItem>> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  if (params.category) qs.set("category", params.category);
  if (params.seniority) qs.set("seniority", params.seniority);
  if (params.isRemote !== undefined) qs.set("isRemote", String(params.isRemote));
  if (params.q) qs.set("q", params.q);
  return apiFetch(`/jobs${qs.toString() ? `?${qs}` : ""}`, { revalidate: 300 });
}

export async function getJob(slug: string): Promise<JobListItem & {
  applyUrl: string | null;
  applyEmail: string | null;
  viewCount: number;
}> {
  return apiFetch(`/jobs/${slug}`, { revalidate: 300 });
}
