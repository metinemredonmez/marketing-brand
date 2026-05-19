"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface AuthFormState {
  ok: boolean;
  message?: string;
}

function isProd() {
  return process.env.NODE_ENV === "production";
}

async function forwardSetCookies(res: Response) {
  // API'den gelen Set-Cookie header'larını Next cookie store'a yansıt
  const headers = res.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookieHeader =
    headers.getSetCookie?.() ??
    (res.headers.get("set-cookie") ? [res.headers.get("set-cookie")] : []);
  const cookieStore = await cookies();
  for (const raw of setCookieHeader) {
    if (!raw) continue;
    const [main] = raw.split(";");
    const [name, value] = main.split("=");
    if (!name || !value) continue;
    cookieStore.set({
      name: name.trim(),
      value: value.trim(),
      httpOnly: true,
      secure: isProd(),
      sameSite: "lax",
      path: "/",
      maxAge: name.trim() === "mr_access" ? 15 * 60 : 30 * 24 * 60 * 60,
    });
  }
}

export async function loginAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: body.message ?? "Giriş başarısız",
      };
    }

    await forwardSetCookies(res);
  } catch {
    return { ok: false, message: "Bağlantı hatası" };
  }

  redirect("/");
}

export async function registerAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (password.length < 8) {
    return { ok: false, message: "Şifre en az 8 karakter olmalı" };
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: body.message ?? "Kayıt başarısız",
      };
    }

    await forwardSetCookies(res);
  } catch {
    return { ok: false, message: "Bağlantı hatası" };
  }

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  try {
    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
  } catch {}
  cookieStore.delete("mr_access");
  cookieStore.delete("mr_refresh");
  redirect("/");
}
