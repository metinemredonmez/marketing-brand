"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

export async function approveReview(id: string, upgrade = false) {
  try {
    await call(
      `/admin/agency-reviews/${id}/approve${upgrade ? "?upgrade=true" : ""}`,
      "POST",
    );
    revalidatePath("/reviews");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function rejectReview(id: string, notes: string) {
  try {
    await call(`/admin/agency-reviews/${id}/reject`, "POST", { notes });
    revalidatePath("/reviews");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
