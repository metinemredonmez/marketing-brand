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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false as const, message: data.message ?? `API ${res.status}` };
  }
  return { ok: true as const, data };
}

export async function createPageContent(input: {
  slug: string;
  locale: string;
  title?: string;
  blocks: Array<{ type: string; [k: string]: unknown }>;
  isPublished?: boolean;
}) {
  const r = await call("/admin/page-contents", "POST", input);
  if (r.ok) revalidatePath("/sayfalar");
  return r;
}

export async function updatePageContent(
  id: string,
  input: {
    title?: string;
    blocks?: Array<{ type: string; [k: string]: unknown }>;
    isPublished?: boolean;
  },
) {
  const r = await call(`/admin/page-contents/${id}`, "PUT", input);
  if (r.ok) {
    revalidatePath("/sayfalar");
    revalidatePath(`/sayfalar/${id}`);
  }
  return r;
}

export async function deletePageContent(id: string) {
  const r = await call(`/admin/page-contents/${id}`, "DELETE");
  if (r.ok) revalidatePath("/sayfalar");
  return r;
}
