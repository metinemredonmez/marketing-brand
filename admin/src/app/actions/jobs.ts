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

export interface JobInput {
  title: string;
  description: string;
  companyName: string;
  category: string;
  seniority: string;
  employmentType: string;
  location?: string;
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  applyUrl?: string;
  applyEmail?: string;
  plan?: string;
}

export async function createJob(input: JobInput) {
  try {
    const data = await call("/admin/jobs", "POST", input);
    revalidatePath("/is-ilanlari");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function withdrawJob(id: string) {
  try {
    await call(`/admin/jobs/${id}`, "DELETE");
    revalidatePath("/is-ilanlari");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function markJobFilled(id: string) {
  try {
    await call(`/admin/jobs/${id}/mark-filled`, "POST");
    revalidatePath("/is-ilanlari");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
