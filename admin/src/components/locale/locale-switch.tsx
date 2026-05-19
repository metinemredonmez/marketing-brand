"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { LOCALES, type Locale } from "@/lib/i18n/config";

export function LocaleSwitch() {
  const { locale, setLocale, t, isPending } = useTranslations();

  return (
    <div
      role="radiogroup"
      aria-label={t("locale.label")}
      className="inline-flex items-center gap-0.5 rounded-md border bg-card p-0.5"
    >
      <Globe size={14} className="ml-1.5 text-muted-foreground" />
      {LOCALES.map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t(`locale.${l}`)}
            disabled={isPending}
            onClick={() => setLocale(l as Locale)}
            className={`flex h-7 items-center justify-center rounded px-2 text-xs font-semibold uppercase transition-colors disabled:opacity-50 ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
