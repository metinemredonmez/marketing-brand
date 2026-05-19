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
    let b: { message?: string } = {};
    try {
      b = (await res.json()) as { message?: string };
    } catch {}
    throw new Error(b.message ?? `API ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function setUserRoleAction(id: string, role: string) {
  try {
    const data = await call(`/admin/users/${id}/role`, "POST", { role });
    revalidatePath("/kullanicilar");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function setUserActiveAction(id: string, isActive: boolean) {
  try {
    const data = await call(`/admin/users/${id}/active`, "POST", { isActive });
    revalidatePath("/kullanicilar");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
