"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  brandSignupAction,
  type BrandFormState,
} from "@/app/actions/brand";
import { useTranslations } from "@/lib/i18n/client";
import { LocaleSwitch } from "@/components/locale/locale-switch";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function BrandSignupPage() {
  const [state, action, pending] = useActionState<
    BrandFormState | null,
    FormData
  >(brandSignupAction, null);
  const { t } = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-xl rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-2 flex justify-end gap-2">
          <LocaleSwitch />
          <ThemeToggle />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <Building2 className="h-6 w-6 text-accent" />
          </div>
          <div className="text-xs uppercase tracking-wide text-accent">
            {t("brandPortal.signup.tagline")}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("brandPortal.signup.title")}
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t("brandPortal.signup.subtitle")}
          </p>
        </div>

        <form action={action} className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="companyName">
              {t("brandPortal.signup.companyName")} *
            </Label>
            <Input
              id="companyName"
              name="companyName"
              required
              maxLength={200}
              className="mt-1.5"
              placeholder="Örnek Yazılım A.Ş."
            />
          </div>
          <div>
            <Label htmlFor="contactName">
              {t("brandPortal.signup.contactName")} *
            </Label>
            <Input
              id="contactName"
              name="contactName"
              required
              maxLength={150}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">
              {t("brandPortal.signup.contactPhone")}
            </Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              className="mt-1.5"
              placeholder="+90 5XX XXX XX XX"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="contactEmail">
              {t("brandPortal.signup.contactEmail")} *
            </Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
              className="mt-1.5"
              placeholder="cmo@firma.com"
            />
          </div>
          <div>
            <Label htmlFor="industry">
              {t("brandPortal.signup.industry")}
            </Label>
            <Input
              id="industry"
              name="industry"
              maxLength={80}
              className="mt-1.5"
              placeholder={t("brandPortal.signup.industryPlaceholder")}
            />
          </div>
          <div>
            <Label htmlFor="companySize">
              {t("brandPortal.signup.companySize")}
            </Label>
            <select
              id="companySize"
              name="companySize"
              className="mt-1.5 h-10 w-full rounded-md border bg-card px-3 text-sm"
            >
              <option value="">
                {t("brandPortal.signup.companySizePlaceholder")}
              </option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-1000">201-1000</option>
              <option value="1000+">1000+</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="website">{t("brandPortal.signup.website")}</Label>
            <Input
              id="website"
              name="website"
              type="url"
              className="mt-1.5"
              placeholder="https://..."
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="password">
              {t("brandPortal.signup.password")} *
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t("brandPortal.signup.passwordHint")}
            </p>
          </div>

          {state?.message && !state.ok && (
            <div className="sm:col-span-2 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
              {state.message}
            </div>
          )}

          <div className="sm:col-span-2 mt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={pending}
            >
              {pending
                ? t("brandPortal.signup.submitting")
                : t("brandPortal.signup.submit")}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t("brandPortal.signup.tos1")}
              <Link
                href="/kullanim-kosullari"
                className="font-medium hover:underline"
              >
                {t("brandPortal.signup.tosTerms")}
              </Link>
              {t("brandPortal.signup.tos2")}
              <Link href="/kvkk" className="font-medium hover:underline">
                {t("brandPortal.signup.tosKvkk")}
              </Link>
              {t("brandPortal.signup.tos3")}
            </p>
          </div>

          <div className="sm:col-span-2 text-center text-sm text-muted-foreground">
            {t("brandPortal.signup.already")}{" "}
            <Link
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              {t("brandPortal.signup.login")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
