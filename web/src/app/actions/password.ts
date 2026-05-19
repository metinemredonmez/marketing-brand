"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface FormState {
  ok: boolean;
  message: string;
}

export async function forgotPassword(
  _prev: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const email = formData.get("email") as string;
  if (!email || !email.includes("@")) {
    return { ok: false, message: "Geçerli bir e-posta gir" };
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, message: body.message ?? "Bir hata oluştu" };
    }
    return {
      ok: true,
      message:
        "Bir sıfırlama linki gönderildi. E-postanı kontrol et (spam'i de).",
    };
  } catch {
    return { ok: false, message: "Bağlantı hatası" };
  }
}

export async function resetPassword(
  _prev: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!token) return { ok: false, message: "Token eksik" };
  if (password.length < 8) {
    return { ok: false, message: "Şifre en az 8 karakter olmalı" };
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, message: body.message ?? "Sıfırlama başarısız" };
    }
    return {
      ok: true,
      message: "Şifren güncellendi. Yeni şifren ile giriş yapabilirsin.",
    };
  } catch {
    return { ok: false, message: "Bağlantı hatası" };
  }
}
