import { apiFetch } from "./client";

export interface AdminBrandAccount {
  id: string;
  slug: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  website?: string | null;
  industry?: string | null;
  companySize?: string | null;
  taxNumber?: string | null;
  taxOffice?: string | null;
  status: "pending_kyc" | "active" | "suspended" | "rejected";
  createdAt: string;
  wallet?: {
    balanceTry: string;
    totalSpentTry: string;
    totalRechargedTry: string;
  };
  _count?: { users?: number; creatives?: number };
}

export interface AdminBrandCampaign {
  id: string;
  advertiserId: string;
  name: string;
  status: string;
  type: string;
  source: string;
  goal?: string | null;
  startAt: string;
  endAt: string;
  budget: string;
  spentTry: string;
  targeting?: (Record<string, unknown> & { placement?: string }) | null;
  submittedAt?: string | null;
  advertiser?: {
    name: string;
    contactName?: string | null;
    contactEmail?: string | null;
    brandAccount?: {
      id: string;
      companyName: string;
      contactName: string;
      contactEmail: string;
      status: string;
    } | null;
  };
  brandCreatives?: Array<{
    id: string;
    type: string;
    name: string;
    content: Record<string, unknown>;
    altText?: string | null;
    clickUrl?: string | null;
    assetUrl?: string | null;
  }>;
}

export const adminBrandApi = {
  listAccounts: (status?: string) =>
    apiFetch<AdminBrandAccount[]>(
      `/admin/brand-portal/accounts${status ? `?status=${status}` : ""}`,
    ),
  campaignQueue: () =>
    apiFetch<AdminBrandCampaign[]>(`/admin/brand-portal/campaigns/queue`),
};
