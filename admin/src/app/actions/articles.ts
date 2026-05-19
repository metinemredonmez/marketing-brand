"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ArticleInput {
  title: string;
  spot?: string;
  body: string;
  slug?: string;
  categoryId?: string;
  coverUrl?: string;
  status?: "draft" | "in_review" | "scheduled" | "published" | "archived";
  scheduledAt?: string;
  isPremium?: boolean;
  isSponsored?: boolean;
  sourceUrl?: string;
  sourceName?: string;
  // AI alanları
  aiSummary?: string;
  aiWhyMatters?: string;
  aiBrandTakeaways?: string[];
  aiAgencyTakeaways?: string[];
  aiHumanRatio?: number;
}

export interface CrudResult {
  ok: boolean;
  message?: string;
  data?: { id: string; slug: string };
}

async function apiCall(path: string, method: string, body?: unknown) {
  const cookieStr = (await cookies()).toString();
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStr,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.message ?? `API ${res.status}`);
  }
  return res.json();
}

export async function createArticle(input: ArticleInput): Promise<CrudResult> {
  try {
    const data = await apiCall("/admin/articles", "POST", input);
    revalidatePath("/icerik");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function updateArticle(
  id: string,
  input: Partial<ArticleInput>,
): Promise<CrudResult> {
  try {
    const data = await apiCall(`/admin/articles/${id}`, "PATCH", input);
    revalidatePath("/icerik");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function publishArticle(id: string): Promise<CrudResult> {
  try {
    const data = await apiCall(`/admin/articles/${id}/publish`, "POST");
    revalidatePath("/icerik");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function unpublishArticle(id: string): Promise<CrudResult> {
  try {
    const data = await apiCall(`/admin/articles/${id}/unpublish`, "POST");
    revalidatePath("/icerik");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function deleteArticle(id: string): Promise<CrudResult> {
  try {
    await apiCall(`/admin/articles/${id}`, "DELETE");
    revalidatePath("/icerik");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
