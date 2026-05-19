import "server-only";
import { apiFetch } from "./client";

export interface AgencyListItem {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  city: string | null;
  tier: string;
  ratingAvg: number;
  reviewCount: number;
  services: string[];
  verificationLevel: string;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export async function listAgencies(params: {
  limit?: number;
  offset?: number;
  tier?: string;
  city?: string;
  q?: string;
} = {}): Promise<ListResult<AgencyListItem>> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  if (params.tier) qs.set("tier", params.tier);
  if (params.city) qs.set("city", params.city);
  if (params.q) qs.set("q", params.q);
  return apiFetch(`/agencies${qs.toString() ? `?${qs}` : ""}`, {
    revalidate: 300,
  });
}

export async function getAgency(slug: string): Promise<AgencyListItem & {
  description: string | null;
  foundedYear: number | null;
  teamSizeRange: string | null;
  website: string | null;
  linkedinUrl: string | null;
  industries: string[];
  clientReferences: string[];
  email: string | null;
}> {
  return apiFetch(`/agencies/${slug}`, { revalidate: 300 });
}
