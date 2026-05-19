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
    const b = await res.json().catch(() => ({}));
    throw new Error(b.message ?? `API ${res.status}`);
  }
  return res.json();
}

export async function createAgency(input: {
  name: string;
  tagline?: string;
  description?: string;
  city?: string;
  website?: string;
  email?: string;
  linkedinUrl?: string;
  services?: string[];
}) {
  try {
    const data = await call("/admin/agencies", "POST", input);
    revalidatePath("/ajans");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function setAgencyTier(
  id: string,
  tier: "free" | "basic" | "premium" | "featured" | "elite",
  durationMonths = 12,
) {
  try {
    await call(`/admin/agencies/${id}/tier`, "POST", { tier, durationMonths });
    revalidatePath("/ajans");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function deactivateAgency(id: string) {
  try {
    await call(`/admin/agencies/${id}`, "DELETE");
    revalidatePath("/ajans");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
