"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, PauseCircle, Wallet } from "lucide-react";
import { setBrandAccountStatusAction } from "@/app/actions/brand-portal";
import type { AdminBrandAccount } from "@/lib/api/brand-portal";
import { useTranslations } from "@/lib/i18n/client";
import { WalletAdjustModal } from "./_wallet-modal";

export function AccountRow({ account }: { account: AdminBrandAccount }) {
  const [pending, start] = useTransition();
  const [walletOpen, setWalletOpen] = useState(false);
  const { t } = useTranslations();
  const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    pending_kyc: {
      label: t("brandStudio.accounts.filter.pendingKyc"),
      color: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    },
    active: {
      label: t("brandStudio.accounts.filter.active"),
      color:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    },
    suspended: {
      label: t("brandStudio.accounts.filter.suspended"),
      color: "bg-muted text-foreground/80",
    },
    rejected: {
      label: t("brandStudio.accounts.filter.rejected"),
      color: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
    },
  };
  const meta = STATUS_LABEL[account.status] ?? {
    label: account.status,
    color: "bg-muted",
  };
  const balance = account.wallet ? Number(account.wallet.balanceTry) : 0;

  function setStatus(
    s: "pending_kyc" | "active" | "suspended" | "rejected",
  ) {
    if (
      s === "rejected" &&
      !confirm(
        t("brandStudio.accounts.rejectConfirm", {
          company: account.companyName,
        }),
      )
    ) {
      return;
    }
    start(async () => {
      await setBrandAccountStatusAction(account.id, s);
    });
  }

  return (
    <tr className="hover:bg-muted">
      <td className="px-4 py-3">
        <div className="font-semibold text-foreground">
          {account.companyName}
        </div>
        <div className="text-xs text-muted-foreground">
          {account.industry ?? "—"} · {account.companySize ?? "—"}
        </div>
      </td>
      <td className="px-4 py-3 text-xs">
        <div>{account.contactName}</div>
        <div className="text-muted-foreground">{account.contactEmail}</div>
      </td>
      <td className="px-4 py-3 font-mono text-xs">
        {account.taxNumber ? (
          <>
            <div>{account.taxNumber}</div>
            <div className="text-muted-foreground">{account.taxOffice}</div>
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs">
        {balance.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}
        >
          {meta.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => setWalletOpen(true)}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted/70"
            title={t("brandStudio.accounts.walletAdjust.button")}
          >
            <Wallet className="h-3 w-3" />{" "}
            {t("brandStudio.accounts.walletAdjust.button")}
          </button>
          {account.status === "pending_kyc" && account.taxNumber && (
            <button
              type="button"
              disabled={pending}
              onClick={() => setStatus("active")}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <CheckCircle2 className="h-3 w-3" />{" "}
              {t("brandStudio.accounts.action.activate")}
            </button>
          )}
          {account.status === "active" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => setStatus("suspended")}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted/70 disabled:opacity-50"
            >
              <PauseCircle className="h-3 w-3" />{" "}
              {t("brandStudio.accounts.action.suspend")}
            </button>
          )}
          {account.status === "suspended" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => setStatus("active")}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <CheckCircle2 className="h-3 w-3" />{" "}
              {t("brandStudio.accounts.action.reactivate")}
            </button>
          )}
          {account.status !== "rejected" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => setStatus("rejected")}
              className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-300"
            >
              <XCircle className="h-3 w-3" />{" "}
              {t("brandStudio.accounts.action.reject")}
            </button>
          )}
        </div>
        {walletOpen && (
          <WalletAdjustModal
            account={account}
            onClose={() => setWalletOpen(false)}
          />
        )}
      </td>
    </tr>
  );
}
