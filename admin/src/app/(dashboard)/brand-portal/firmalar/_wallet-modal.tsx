"use client";

import { useState, useTransition } from "react";
import { Wallet, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adjustWalletAction } from "@/app/actions/brand-portal";
import { useTranslations } from "@/lib/i18n/client";
import type { AdminBrandAccount } from "@/lib/api/brand-portal";

export function WalletAdjustModal({
  account,
  onClose,
}: {
  account: AdminBrandAccount;
  onClose: () => void;
}) {
  const { t, locale } = useTranslations();
  const fmt = locale === "en" ? "en-US" : "tr-TR";
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);
  const [pending, start] = useTransition();

  const currentBalance = account.wallet ? Number(account.wallet.balanceTry) : 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount === 0) {
      setMessage({ kind: "err", text: t("common.error") });
      return;
    }
    start(async () => {
      const r = await adjustWalletAction(account.id, amount, reason);
      if (!r.ok) {
        setMessage({
          kind: "err",
          text: r.message ?? t("common.error"),
        });
        return;
      }
      const key =
        amount > 0
          ? "brandStudio.accounts.walletAdjust.successAdded"
          : "brandStudio.accounts.walletAdjust.successDeducted";
      setMessage({
        kind: "ok",
        text: t(key, { amount: Math.abs(amount).toLocaleString(fmt) }),
      });
      // Auto-close after 1.2s on success
      setTimeout(onClose, 1200);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Wallet className="h-4 w-4" />{" "}
            {t("brandStudio.accounts.walletAdjust.title", {
              company: account.companyName,
            })}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="text-xs text-muted-foreground">
              {t("brandStudio.accounts.walletAdjust.currentBalance")}
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-foreground">
              {currentBalance.toLocaleString(fmt, {
                style: "currency",
                currency: "TRY",
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="adjust-amount">
              {t("brandStudio.accounts.walletAdjust.amount")}
            </Label>
            <Input
              id="adjust-amount"
              type="number"
              step="0.01"
              required
              value={amount === 0 ? "" : amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1.5 font-mono"
              placeholder="0.00"
              autoFocus
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t("brandStudio.accounts.walletAdjust.amountHint")}
            </p>
            {amount !== 0 && (
              <p className="mt-1 text-xs text-foreground/80">
                ⇒{" "}
                {(currentBalance + amount).toLocaleString(fmt, {
                  style: "currency",
                  currency: "TRY",
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="adjust-reason">
              {t("brandStudio.accounts.walletAdjust.reason")}
            </Label>
            <Textarea
              id="adjust-reason"
              rows={3}
              required
              minLength={5}
              maxLength={250}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5"
              placeholder={t(
                "brandStudio.accounts.walletAdjust.reasonPlaceholder",
              )}
            />
          </div>

          {message && (
            <div
              className={`rounded-md p-3 text-sm ${
                message.kind === "ok"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending || amount === 0 || reason.trim().length < 5}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  {t("brandStudio.accounts.walletAdjust.submitting")}
                </>
              ) : (
                t("brandStudio.accounts.walletAdjust.submit")
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
