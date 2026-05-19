import "server-only";
import { apiFetch } from "./client";

export interface Tier {
  tier: "founding_member" | "lite" | "pro" | "enterprise";
  name: string;
  description: string;
  monthlyUsd: number;
  yearlyUsd: number;
  monthlyTry: number;
  yearlyTry: number;
  features: string[];
  seats: number;
}

export async function listTiers(): Promise<Tier[]> {
  return apiFetch<Tier[]>("/subscriptions/tiers", { revalidate: 3600 });
}
