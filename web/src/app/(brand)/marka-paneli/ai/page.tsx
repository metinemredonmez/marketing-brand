import { brandApi } from "@/lib/api/brand";
import { getTranslations } from "@/lib/i18n/server";
import { AiStudio } from "./_studio";

export default async function BrandAiStudioPage() {
  const accounts = await brandApi.myAccounts();
  const account = accounts[0].brandAccount;
  const t = await getTranslations();

  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide text-accent">
        {t("brandPortal.nav.ai")}
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        {t("brandPortal.ai.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("brandPortal.ai.subtitle")}
      </p>
      <div className="mt-6">
        <AiStudio
          brandAccountId={account.id}
          brandName={account.companyName}
        />
      </div>
    </div>
  );
}
