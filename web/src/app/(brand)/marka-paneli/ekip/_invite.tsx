"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  inviteUserAction,
  type BrandFormState,
} from "@/app/actions/brand";
import { useTranslations } from "@/lib/i18n/client";

export function InviteForm({ brandAccountId }: { brandAccountId: string }) {
  const [state, action, pending] = useActionState<
    BrandFormState | null,
    FormData
  >(inviteUserAction.bind(null, brandAccountId), null);
  const { t } = useTranslations();

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
      <div>
        <Label htmlFor="email">{t("brandPortal.team.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1.5"
          placeholder="ekip@firma.com"
        />
      </div>
      <div>
        <Label htmlFor="role">{t("brandPortal.team.role")}</Label>
        <select
          id="role"
          name="role"
          className="mt-1.5 h-10 w-full rounded-md border bg-card px-3 text-sm"
        >
          <option value="editor">Editor</option>
          <option value="manager">Manager</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          {pending
            ? t("brandPortal.team.sending")
            : t("brandPortal.team.sendInvite")}
        </Button>
      </div>
      {state?.message && (
        <div
          className={`sm:col-span-3 rounded-md p-3 text-xs ${
            state.ok
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {state.message}
        </div>
      )}
    </form>
  );
}
