// Brand Studio API tipleri ve client wrapper.
import { apiFetch } from "./client";

export type BrandAccountStatus =
  | "pending_kyc"
  | "active"
  | "suspended"
  | "rejected";

export type BrandAccountRole = "owner" | "manager" | "editor" | "viewer";

export type BrandCreativeType =
  | "banner"
  | "sponsored_article"
  | "newsletter_blurb"
  | "linkedin_post"
  | "reels_script";

export type BrandCreativeStatus =
  | "draft"
  | "ready"
  | "in_campaign"
  | "archived";

export type AdCampaignType =
  | "banner"
  | "sponsored_content"
  | "newsletter"
  | "native"
  | "agency_premium"
  | "job_premium";

export type AdPlacement =
  | "homepage_top"
  | "category_top"
  | "article_inline"
  | "sidebar_sticky"
  | "mobile_sticky"
  | "newsletter_top";

export type BrandCampaignGoal =
  | "awareness"
  | "traffic"
  | "lead_gen"
  | "brand_story";

export interface BrandWallet {
  id: string;
  brandAccountId: string;
  balanceTry: string;
  totalSpentTry: string;
  totalRechargedTry: string;
  transactions?: Array<{
    id: string;
    type: string;
    amountTry: string;
    balanceAfter: string;
    description: string;
    createdAt: string;
  }>;
}

export interface BrandAccount {
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
  status: BrandAccountStatus;
  wallet?: BrandWallet;
  role?: BrandAccountRole;
  _count?: { creatives?: number };
}

export interface BrandAccountUserLink {
  brandAccountId: string;
  userId: string;
  role: BrandAccountRole;
  brandAccount: BrandAccount;
}

export interface BrandCreative {
  id: string;
  brandAccountId: string;
  type: BrandCreativeType;
  name: string;
  content: Record<string, unknown>;
  assetUrl?: string | null;
  clickUrl?: string | null;
  altText?: string | null;
  aiGenerationId?: string | null;
  status: BrandCreativeStatus;
  createdAt: string;
  updatedAt: string;
}

export type BrandCampaignStatus =
  | "draft"
  | "pending_approval"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "canceled"
  | "rejected";

export interface BrandCampaign {
  id: string;
  advertiserId: string;
  name: string;
  type: AdCampaignType;
  source: "manual" | "self_serve";
  status: BrandCampaignStatus;
  startAt: string;
  endAt: string;
  budget: string;
  spentTry: string;
  goal?: BrandCampaignGoal | null;
  targeting?: (Record<string, unknown> & { placement?: AdPlacement }) | null;
  rejectedReason?: string | null;
  approvedAt?: string | null;
  submittedAt?: string | null;
  totalImpressions?: number | string;
  totalClicks?: number | string;
  brandCreatives?: BrandCreative[];
}

export interface BrandSignupBody {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  password: string;
  website?: string;
  industry?: string;
  companySize?: string;
}

export const brandApi = {
  myAccounts: () =>
    apiFetch<BrandAccountUserLink[]>("/brand/accounts", { revalidate: false }),

  myAccount: (id: string) =>
    apiFetch<BrandAccount>(`/brand/accounts/${id}`, { revalidate: false }),

  myWallet: (id: string) =>
    apiFetch<BrandWallet>(`/brand/accounts/${id}/wallet`, {
      revalidate: false,
    }),

  myCreatives: (id: string, params?: { type?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set("type", params.type);
    if (params?.status) q.set("status", params.status);
    const qs = q.toString();
    return apiFetch<BrandCreative[]>(
      `/brand/accounts/${id}/creatives${qs ? `?${qs}` : ""}`,
      { revalidate: false },
    );
  },

  myCampaigns: (id: string) =>
    apiFetch<BrandCampaign[]>(`/brand/accounts/${id}/campaigns`, {
      revalidate: false,
    }),

  myCampaign: (id: string, campaignId: string) =>
    apiFetch<BrandCampaign>(
      `/brand/accounts/${id}/campaigns/${campaignId}`,
      { revalidate: false },
    ),
};
