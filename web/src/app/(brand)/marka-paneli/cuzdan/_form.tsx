"use client";

import { useState, useTransition } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rechargeWalletAction } from "@/app/actions/brand";
import { useTranslations } from "@/lib/i18n/client";

const PRESETS = [5000, 10000, 25000, 50000, 100000];

export function RechargeForm({ brandAccountId }: { brandAccountId: string }) {
  const [amount, setAmount] = useState(10000);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const { t, locale } = useTranslations();
  const localeFmt = locale === "en" ? "en-US" : "tr-TR";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await rechargeWalletAction(brandAccountId, amount);
      if (!r.ok || !r.url) {
        setError(r.message ?? t("brandPortal.wallet.paymentFailed"));
        return;
      }
      window.location.href = r.url;
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setAmount(p)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              amount === p
                ? "border-accent bg-accent/10 text-accent"
                : "border-border hover:border-border"
            }`}
          >
            {p.toLocaleString(localeFmt)} ₺
          </button>
        ))}
      </div>
      <div className="max-w-sm">
        <Label htmlFor="amount">{t("brandPortal.wallet.customAmount")}</Label>
        <Input
          id="amount"
          type="number"
          min={1000}
          max={500000}
          step={500}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1.5 font-mono"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {t("brandPortal.wallet.customAmountHint")}
        </p>
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="mr-2 h-4 w-4" />
        )}
        {t("brandPortal.wallet.payWith", {
          amount: amount.toLocaleString(localeFmt),
        })}
      </Button>
    </form>
  );
}
