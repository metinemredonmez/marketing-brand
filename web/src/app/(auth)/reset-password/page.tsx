"use client";

import Link from "next/link";
import { use } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword, type FormState } from "@/app/actions/password";
import { useTranslations } from "@/lib/i18n/client";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = use(searchParams);
  const [state, formAction, isPending] = useActionState<
    FormState | null,
    FormData
  >(resetPassword, null);
  const { t } = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <Link href="/" className="text-lg font-bold text-foreground">
          MarkaRadar
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          {t("auth.reset.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.reset.subtitle")}
        </p>

        {!token ? (
          <div className="mt-6 rounded-md bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {t("auth.verify.failed")}
          </div>
        ) : state?.ok ? (
          <div className="mt-6">
            <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {state.message ?? t("auth.reset.success")}
            </div>
            <Button asChild className="mt-4 w-full" size="lg">
              <Link href="/login">{t("auth.verify.goLogin")}</Link>
            </Button>
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            <input type="hidden" name="token" value={token} />
            <div>
              <Label htmlFor="password">
                {t("auth.reset.newPassword")} (
                {t("auth.register.passwordHint")})
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1.5"
                disabled={isPending}
                autoComplete="new-password"
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
              {isPending
                ? t("auth.reset.submitting")
                : t("auth.reset.submit")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
