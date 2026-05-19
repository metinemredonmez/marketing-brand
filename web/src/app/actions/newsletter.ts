"use server";

import { ApiError } from "@/lib/api/client";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface NewsletterFormState {
  ok: boolean;
  message: string;
}

export async function subscribeToNewsletter(
  _prev: NewsletterFormState | null,
  formData: FormData,
): Promise<NewsletterFormState> {
  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string | null;
  const source = (formData.get("source") as string) ?? "homepage";

  if (!email || !email.includes("@")) {
    return { ok: false, message: "Geçerli bir e-posta gir" };
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, source }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: body.message ?? "Bir hata oluştu, tekrar dene",
      };
    }

    const result = await res.json();
    if (result.status === "already_subscribed") {
      return { ok: true, message: "Zaten abone olmuşsun." };
    }
    return {
      ok: true,
      message: "Aboneliği onaylamak için e-postanı kontrol et.",
    };
  } catch (e) {
    return { ok: false, message: "Bağlantı hatası, tekrar dene" };
  }
}
