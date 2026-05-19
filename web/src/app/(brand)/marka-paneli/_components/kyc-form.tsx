"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  submitKycAction,
  type BrandFormState,
} from "@/app/actions/brand";
import { useTranslations } from "@/lib/i18n/client";

export function KycForm({ brandAccountId }: { brandAccountId: string }) {
  const [state, action, pending] = useActionState<
    BrandFormState | null,
    FormData
  >(submitKycAction.bind(null, brandAccountId), null);
  const { t } = useTranslations();

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-3">
      <div>
        <Label htmlFor="taxNumber">{t("brandPortal.kyc.taxNumber")}</Label>
        <Input
          id="taxNumber"
          name="taxNumber"
          required
          maxLength={11}
          pattern="\d{10,11}"
          placeholder={t("brandPortal.kyc.taxNumberPlaceholder")}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="taxOffice">{t("brandPortal.kyc.taxOffice")}</Label>
        <Input
          id="taxOffice"
          name="taxOffice"
          required
          placeholder={t("brandPortal.kyc.taxOfficePlaceholder")}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="website">{t("brandPortal.kyc.website")}</Label>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="https://..."
          className="mt-1.5"
        />
      </div>
      <div className="sm:col-span-3 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? t("brandPortal.kyc.submitting")
            : t("brandPortal.kyc.submit")}
        </Button>
        {state?.message && (
          <span
            className={`text-xs ${
              state.ok ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
