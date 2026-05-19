import { redirect } from "next/navigation";
import { brandApi } from "@/lib/api/brand";
import { getTranslations } from "@/lib/i18n/server";
import { NewCampaignForm } from "./_form";

export default async function NewCampaignPage() {
  const accounts = await brandApi.myAccounts();
  const account = accounts[0].brandAccount;

  if (account.status !== "active") {
    redirect("/marka-paneli?kyc=required");
  }

  const creatives = await brandApi
    .myCreatives(account.id, { status: "ready" })
    .catch(() => []);
  const draftCreatives = await brandApi
    .myCreatives(account.id, { status: "draft" })
    .catch(() => []);
  const wallet = await brandApi.myWallet(account.id).catch(() => null);
  const t = await getTranslations();

  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide text-accent">
        {t("brandPortal.campaigns.new")}
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        {t("brandPortal.campaigns.builder.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("brandPortal.campaigns.builder.subtitle")}
      </p>

      <NewCampaignForm
        brandAccountId={account.id}
        readyCreatives={creatives}
        draftCreatives={draftCreatives}
        balance={wallet ? Number(wallet.balanceTry) : 0}
      />
    </div>
  );
}
