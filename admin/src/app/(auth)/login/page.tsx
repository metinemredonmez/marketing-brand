"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type AuthFormState } from "@/app/actions/auth";
import { useTranslations } from "@/lib/i18n/client";
import { LocaleSwitch } from "@/components/locale/locale-switch";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    AuthFormState | null,
    FormData
  >(loginAction, null);
  const { t } = useTranslations();

  // Server action başarıyla cookie set ettiyse client-side yönlendir.
  // Next.js 15'te server action içinde redirect() bazen cookie'leri kaybediyor —
  // bu nedenle action `redirectTo` döndürüyor, biz burada hard refresh ediyoruz.
  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      // window.location.href full reload yapar — cookie'ler okunur, middleware geçer
      window.location.href = state.redirectTo;
    }
  }, [state, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              MarkaRadar <span className="text-accent">Admin</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("login.subtitle")}
            </p>
          </div>
          <LocaleSwitch />
        </div>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">{t("login.email")}</Label>
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
            <Label htmlFor="password">{t("login.password")}</Label>
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
            {isPending ? t("login.submitting") : t("login.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
