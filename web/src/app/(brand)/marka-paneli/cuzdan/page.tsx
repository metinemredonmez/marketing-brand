import { brandApi } from "@/lib/api/brand";
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, ArrowDownUp } from "lucide-react";
import { getTranslations } from "@/lib/i18n/server";
import { RechargeForm } from "./_form";

export default async function WalletPage() {
  const accounts = await brandApi.myAccounts();
  const account = accounts[0].brandAccount;
  const wallet = await brandApi.myWallet(account.id);
  const t = await getTranslations();
  const localeFmt = t.locale === "en" ? "en-US" : "tr-TR";

  const balance = Number(wallet.balanceTry);
  const spent = Number(wallet.totalSpentTry);
  const topped = Number(wallet.totalRechargedTry);

  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide text-accent">
        {t("brandPortal.nav.wallet")}
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        {t("brandPortal.wallet.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("brandPortal.wallet.subtitle")}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" />{" "}
            {t("brandPortal.wallet.balance")}
          </div>
          <div className="mt-2 font-mono text-3xl font-bold text-foreground">
            {balance.toLocaleString(localeFmt, {
              style: "currency",
              currency: "TRY",
              maximumFractionDigits: 0,
            })}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <ArrowDownUp className="h-3.5 w-3.5" />{" "}
            {t("brandPortal.wallet.spent")}
          </div>
          <div className="mt-2 font-mono text-3xl font-bold text-foreground">
            {spent.toLocaleString(localeFmt, {
              style: "currency",
              currency: "TRY",
              maximumFractionDigits: 0,
            })}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />{" "}
            {t("brandPortal.wallet.topped")}
          </div>
          <div className="mt-2 font-mono text-3xl font-bold text-foreground">
            {topped.toLocaleString(localeFmt, {
              style: "currency",
              currency: "TRY",
              maximumFractionDigits: 0,
            })}
          </div>
        </Card>
      </div>

      <Card className="mt-8 p-6">
        <h3 className="text-sm font-semibold text-foreground">
          {t("brandPortal.wallet.rechargeTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("brandPortal.wallet.rechargeSubtitle")}
        </p>
        <div className="mt-5">
          <RechargeForm brandAccountId={account.id} />
        </div>
      </Card>
    </div>
  );
}
