"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
} from "react";
import {
  DEFAULT_LOCALE,
  interpolate,
  lookup,
  type Locale,
} from "./config";
import { setLocaleAction } from "./actions";

interface I18nContextValue {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLocale: (l: Locale) => void;
  isPending: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({
  locale: initialLocale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [isPending, start] = useTransition();

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      interpolate(lookup(initialLocale, key), vars),
    [initialLocale],
  );

  const setLocale = useCallback(
    (l: Locale) => {
      start(async () => {
        await setLocaleAction(l);
      });
    },
    [start],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale: initialLocale, t, setLocale, isPending }),
    [initialLocale, t, setLocale, isPending],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslations(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback — provider yoksa default locale ile çalış
    const t = (key: string, vars?: Record<string, string | number>) =>
      interpolate(lookup(DEFAULT_LOCALE, key), vars);
    return {
      locale: DEFAULT_LOCALE,
      t,
      setLocale: () => undefined,
      isPending: false,
    };
  }
  return ctx;
}
