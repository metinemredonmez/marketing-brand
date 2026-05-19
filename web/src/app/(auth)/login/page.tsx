"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type AuthFormState } from "@/app/actions/auth";
import { useTranslations } from "@/lib/i18n/client";
import { LocaleSwitch } from "@/components/locale/locale-switch";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<
    AuthFormState | null,
    FormData
  >(loginAction, null);
  const { t } = useTranslations();

  // Next.js 15 server action redirect bug workaround — full reload ile cookie aktif
  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-2 flex justify-end gap-2">
          <LocaleSwitch />
          <ThemeToggle />
        </div>
        <div className="text-center">
          <Link href="/" className="text-lg font-bold text-foreground">
            MarkaRadar
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            {t("auth.login.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("auth.login.subtitle")}{" "}
            <Link
              href="/register"
              className="font-medium text-brand-500 hover:underline"
            >
              {t("auth.login.createAccount")}
            </Link>
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">{t("auth.login.email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1.5"
              disabled={isPending}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("auth.login.password")}</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-500 hover:underline"
              >
                {t("auth.login.forgot")}
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              className="mt-1.5"
              disabled={isPending}
            />
          </div>

          {state?.message && !state.ok && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
              {state.message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
