"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function call(path: string, method: string, body?: unknown) {
  const cookieStr = (await cookies()).toString();
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: cookieStr },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    let b: { message?: string } = {};
    try {
      b = (await res.json()) as { message?: string };
    } catch {}
    throw new Error(b.message ?? `API ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function setBrandAccountStatusAction(
  id: string,
  status: "pending_kyc" | "active" | "suspended" | "rejected",
) {
  try {
    const data = await call(
      `/admin/brand-portal/accounts/${id}/status`,
      "POST",
      { status },
    );
    revalidatePath("/brand-portal/firmalar");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function approveBrandCampaignAction(id: string) {
  try {
    const data = await call(
      `/admin/brand-portal/campaigns/${id}/approve`,
      "POST",
    );
    revalidatePath("/brand-portal/kampanyalar");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function adjustWalletAction(
  brandAccountId: string,
  amountTry: number,
  reason: string,
) {
  try {
    if (amountTry === 0) {
      return { ok: false, message: "Tutar 0 olamaz" };
    }
    if (reason.trim().length < 5) {
      return { ok: false, message: "Gerekçe en az 5 karakter olmalı" };
    }
    const data = await call(
      `/admin/brand-portal/accounts/${brandAccountId}/wallet/adjust`,
      "POST",
      { amountTry, reason: reason.trim() },
    );
    revalidatePath("/brand-portal/firmalar");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function rejectBrandCampaignAction(
  id: string,
  reason: string,
) {
  try {
    if (reason.trim().length < 5) {
      return {
        ok: false,
        message: "Reddetme gerekçesi en az 5 karakter olmalı",
      };
    }
    const data = await call(
      `/admin/brand-portal/campaigns/${id}/reject`,
      "POST",
      { reason: reason.trim() },
    );
    revalidatePath("/brand-portal/kampanyalar");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
