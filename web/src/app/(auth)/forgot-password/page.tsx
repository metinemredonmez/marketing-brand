"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword, type FormState } from "@/app/actions/password";
import { useTranslations } from "@/lib/i18n/client";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<
    FormState | null,
    FormData
  >(forgotPassword, null);
  const { t } = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <Link href="/" className="text-lg font-bold text-foreground">
          MarkaRadar
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          {t("auth.forgot.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.forgot.subtitle")}
        </p>

        {state?.ok ? (
          <div className="mt-6 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            {state.message ?? t("auth.forgot.sent")}
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">{t("auth.forgot.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
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
              {isPending
                ? t("auth.forgot.submitting")
                : t("auth.forgot.submit")}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-brand-500 hover:underline">
            ← {t("auth.forgot.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
