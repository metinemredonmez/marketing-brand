"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALES, LOCALE_COOKIE, type Locale } from "./config";

export async function setLocaleAction(locale: Locale) {
  if (!(LOCALES as readonly string[]).includes(locale)) {
    return { ok: false, message: "Invalid locale" };
  }
  const store = await cookies();
  store.set({
    name: LOCALE_COOKIE,
    value: locale,
    httpOnly: false, // istemci de okuyabilsin
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60, // 1 yıl
  });
  // RSC ağacının yeniden render edilmesi için
  revalidatePath("/", "layout");
  return { ok: true };
}
