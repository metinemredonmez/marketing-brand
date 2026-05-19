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

export async function getLocale(): Promise<Locale> {
  try {
    const c = (await cookies()).get(LOCALE_COOKIE)?.value;
    if (c && (LOCALES as readonly string[]).includes(c)) {
      return c as Locale;
    }
  } catch {}
  return DEFAULT_LOCALE;
}

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
