"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface BrandFormState {
  ok: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

async function brandFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const { json, headers, ...rest } = init;
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
      ...(headers as Record<string, string> | undefined),
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    let body: { message?: string } = {};
    try {
      body = (await res.json()) as { message?: string };
    } catch {
      // ignore
    }
    return {
      ok: false,
      status: res.status,
      message: body.message ?? `API ${res.status}`,
    };
  }
  if (res.status === 204) return { ok: true, data: undefined as T };
  return { ok: true, data: (await res.json()) as T };
}

// ── Public — signup
export async function brandSignupAction(
  _prev: BrandFormState | null,
  formData: FormData,
): Promise<BrandFormState> {
  const body = {
    companyName: String(formData.get("companyName") || "").trim(),
    contactName: String(formData.get("contactName") || "").trim(),
    contactEmail: String(formData.get("contactEmail") || "")
      .trim()
      .toLowerCase(),
    contactPhone: String(formData.get("contactPhone") || "").trim() || undefined,
    password: String(formData.get("password") || ""),
    website: String(formData.get("website") || "").trim() || undefined,
    industry: String(formData.get("industry") || "").trim() || undefined,
    companySize: String(formData.get("companySize") || "").trim() || undefined,
  };
  if (body.password.length < 8) {
    return { ok: false, message: "Şifre en az 8 karakter olmalı" };
  }
  if (!body.companyName || !body.contactName || !body.contactEmail) {
    return { ok: false, message: "Tüm zorunlu alanları doldur" };
  }

  // 1) Signup brand
  const signup = await brandFetch<{ user: { email: string }; brand: { id: string } }>(
    "/brand/signup",
    { method: "POST", json: body },
  );
  if (!signup.ok) return { ok: false, message: signup.message };

  // 2) Otomatik login
  const loginRes = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.contactEmail, password: body.password }),
  });
  if (loginRes.ok) {
    let setCookies: string[] = [];
    const headersExt = loginRes.headers as Headers & {
      getSetCookie?: () => string[];
      raw?: () => Record<string, string[]>;
    };
    if (typeof headersExt.getSetCookie === "function") {
      setCookies = headersExt.getSetCookie();
    } else if (typeof headersExt.raw === "function") {
      setCookies = headersExt.raw()["set-cookie"] ?? [];
    } else {
      const single = loginRes.headers.get("set-cookie");
      if (single) setCookies = [single];
    }
    const cookieStore = await cookies();
    for (const raw of setCookies) {
      if (!raw) continue;
      const [main] = raw.split(";");
      const eq = main.indexOf("=");
      if (eq < 0) continue;
      const name = main.slice(0, eq).trim();
      const value = main.slice(eq + 1).trim();
      if (!name || !value) continue;
      cookieStore.set({
        name,
        value,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: name === "mr_access" ? 15 * 60 : 30 * 24 * 60 * 60,
      });
    }
  }

  redirect("/marka-paneli");
}

// ── KYC
export async function submitKycAction(
  brandAccountId: string,
  _prev: BrandFormState | null,
  formData: FormData,
): Promise<BrandFormState> {
  const body = {
    taxNumber: String(formData.get("taxNumber") || "").trim(),
    taxOffice: String(formData.get("taxOffice") || "").trim(),
    website: String(formData.get("website") || "").trim() || undefined,
  };
  if (!/^\d{10,11}$/.test(body.taxNumber)) {
    return { ok: false, message: "Vergi numarası 10 veya 11 haneli olmalı" };
  }
  const res = await brandFetch(`/brand/accounts/${brandAccountId}/kyc`, {
    method: "POST",
    json: body,
  });
  if (!res.ok) return { ok: false, message: res.message };
  revalidatePath(`/marka-paneli`);
  return { ok: true, message: "KYC bilgileri kaydedildi" };
}

// ── Invite team member
export async function inviteUserAction(
  brandAccountId: string,
  _prev: BrandFormState | null,
  formData: FormData,
): Promise<BrandFormState> {
  const body = {
    email: String(formData.get("email") || "")
      .trim()
      .toLowerCase(),
    role: String(formData.get("role") || "editor"),
  };
  const res = await brandFetch(
    `/brand/accounts/${brandAccountId}/invite`,
    { method: "POST", json: body },
  );
  if (!res.ok) return { ok: false, message: res.message };
  revalidatePath(`/marka-paneli/ekip`);
  return { ok: true, message: "Davet gönderildi" };
}

// ── Wallet recharge (Stripe checkout)
export async function rechargeWalletAction(
  brandAccountId: string,
  amountTry: number,
): Promise<{ ok: boolean; message?: string; url?: string }> {
  if (amountTry < 1000) {
    return { ok: false, message: "Minimum 1.000 ₺ yükleme yapılabilir" };
  }
  const res = await brandFetch<{ checkoutUrl: string; sessionId: string }>(
    `/brand/accounts/${brandAccountId}/wallet/recharge`,
    { method: "POST", json: { amountTry } },
  );
  if (!res.ok) return { ok: false, message: res.message };
  return { ok: true, url: res.data.checkoutUrl };
}

// ── AI generate
export async function generateBrandContentAction(
  brandAccountId: string,
  generationType: string,
  vars: Record<string, string>,
): Promise<{
  ok: boolean;
  message?: string;
  data?: {
    generationId: string;
    type: string;
    output: Record<string, unknown>;
  };
}> {
  const res = await brandFetch<{
    generationId: string;
    type: string;
    output: Record<string, unknown>;
  }>(`/brand/accounts/${brandAccountId}/ai/generate`, {
    method: "POST",
    json: { generationType, vars },
  });
  if (!res.ok) return { ok: false, message: res.message };
  return { ok: true, data: res.data };
}

// ── Creative save
export async function saveCreativeAction(
  brandAccountId: string,
  payload: {
    type: string;
    name: string;
    content: Record<string, unknown>;
    aiGenerationId?: string;
    clickUrl?: string;
    altText?: string;
    assetUrl?: string;
  },
): Promise<{ ok: boolean; message?: string; data?: { id: string } }> {
  const res = await brandFetch<{ id: string }>(
    `/brand/accounts/${brandAccountId}/creatives`,
    { method: "POST", json: payload },
  );
  if (!res.ok) return { ok: false, message: res.message };
  revalidatePath(`/marka-paneli/ai`);
  return { ok: true, data: res.data };
}

export async function markCreativeReadyAction(
  brandAccountId: string,
  creativeId: string,
): Promise<{ ok: boolean; message?: string }> {
  const res = await brandFetch(
    `/brand/accounts/${brandAccountId}/creatives/${creativeId}/ready`,
    { method: "POST" },
  );
  if (!res.ok) return { ok: false, message: res.message };
  revalidatePath(`/marka-paneli`);
  return { ok: true };
}

// ── Campaign create
export async function createCampaignAction(
  brandAccountId: string,
  _prev: BrandFormState | null,
  formData: FormData,
): Promise<BrandFormState> {
  const targeting = {
    audience: String(formData.get("audience") || "").trim() || undefined,
    categories: String(formData.get("categories") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    cities: String(formData.get("cities") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  const body = {
    name: String(formData.get("name") || "").trim(),
    goal: String(formData.get("goal") || "awareness"),
    type: String(formData.get("type") || "self_serve"),
    placement: String(formData.get("placement") || "homepage_top"),
    creativeId: String(formData.get("creativeId") || "").trim(),
    startAt: String(formData.get("startAt") || ""),
    endAt: String(formData.get("endAt") || ""),
    budgetTry: Number(formData.get("budgetTry") || 0),
    targeting,
  };
  if (!body.name || !body.creativeId || !body.startAt || !body.endAt) {
    return { ok: false, message: "Tüm zorunlu alanları doldur" };
  }
  if (body.budgetTry < 5000) {
    return { ok: false, message: "Minimum bütçe 5.000 ₺" };
  }
  const res = await brandFetch<{ id: string }>(
    `/brand/accounts/${brandAccountId}/campaigns`,
    { method: "POST", json: body },
  );
  if (!res.ok) return { ok: false, message: res.message };
  revalidatePath(`/marka-paneli/kampanya`);
  redirect(`/marka-paneli/kampanya/${res.data.id}`);
}

export async function pauseCampaignAction(
  brandAccountId: string,
  campaignId: string,
): Promise<{ ok: boolean; message?: string }> {
  const res = await brandFetch(
    `/brand/accounts/${brandAccountId}/campaigns/${campaignId}/pause`,
    { method: "POST" },
  );
  if (!res.ok) return { ok: false, message: res.message };
  revalidatePath(`/marka-paneli/kampanya/${campaignId}`);
  return { ok: true };
}

export async function resumeCampaignAction(
  brandAccountId: string,
  campaignId: string,
): Promise<{ ok: boolean; message?: string }> {
  const res = await brandFetch(
    `/brand/accounts/${brandAccountId}/campaigns/${campaignId}/resume`,
    { method: "POST" },
  );
  if (!res.ok) return { ok: false, message: res.message };
  revalidatePath(`/marka-paneli/kampanya/${campaignId}`);
  return { ok: true };
}
