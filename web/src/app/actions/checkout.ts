"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface CheckoutResult {
  ok: boolean;
  message?: string;
  checkoutUrl?: string;
}

export async function startCheckout(
  _prev: CheckoutResult | null,
  formData: FormData,
): Promise<CheckoutResult> {
  const tier = formData.get("tier") as string;
  const billingInterval = formData.get("billingInterval") as string;
  const provider = formData.get("provider") as string;

  if (!tier || !billingInterval || !provider) {
    return { ok: false, message: "Tarife seçimi eksik" };
  }

  const cookieStr = (await cookies()).toString();
  if (!cookieStr.includes("mr_access")) {
    return {
      ok: false,
      message: "Önce giriş yapman gerek. /login sayfasına yönlendirileceksin.",
    };
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/subscriptions/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStr,
      },
      body: JSON.stringify({ tier, billingInterval, provider }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: body.message ?? "Checkout başlatılamadı",
      };
    }

    const data = await res.json();
    return { ok: true, checkoutUrl: data.checkoutUrl };
  } catch {
    return { ok: false, message: "Bağlantı hatası" };
  }
}
