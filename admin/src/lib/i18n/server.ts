import "server-only";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  type Locale,
  interpolate,
  lookup,
  messages,
} from "./config";

/** Cookie'den locale oku. Geçersizse default'a düş. */
export async function getLocale(): Promise<Locale> {
  try {
    const c = (await cookies()).get(LOCALE_COOKIE)?.value;
    if (c && (LOCALES as readonly string[]).includes(c)) {
      return c as Locale;
    }
  } catch {
    // RSC dışında çağrılırsa
  }
  return DEFAULT_LOCALE;
}

/**
 * Server Component'lerde kullan:
 *   const t = await getTranslations();
 *   t("nav.dashboard")
 */
export async function getTranslations() {
  const locale = await getLocale();
  function t(
    key: string,
    vars?: Record<string, string | number>,
  ): string {
    return interpolate(lookup(locale, key), vars);
  }
  return Object.assign(t, { locale, messages: messages[locale] });
}
