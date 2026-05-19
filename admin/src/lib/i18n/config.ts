import { tr } from "./messages/tr";
import { en } from "./messages/en";

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";
export const LOCALE_COOKIE = "mr_admin_locale";

export const messages = { tr, en } as const;

export type Messages = typeof tr;

/**
 * Nokta-ayrı path'i destekleyen lookup.
 * "nav.dashboard" → messages[locale].nav.dashboard
 * Bulunamazsa key'in kendisini döner (geliştirici görsün).
 */
export function lookup(locale: Locale, path: string): string {
  const parts = path.split(".");
  let cur: unknown = messages[locale] ?? messages[DEFAULT_LOCALE];
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      // Fallback'e bak
      cur = undefined;
      break;
    }
  }
  if (typeof cur === "string") return cur;
  // Fallback locale
  if (locale !== DEFAULT_LOCALE) return lookup(DEFAULT_LOCALE, path);
  return path;
}

/**
 * Çok basit interpolasyon: "{name}" → vars.name
 */
export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}
