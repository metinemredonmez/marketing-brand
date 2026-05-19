import { AgencyForm } from "@/components/dashboard/agency-form";
import { getTranslations } from "@/lib/i18n/server";

export default async function YeniAjansPage() {
  const t = await getTranslations();
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {t("forms.newAgency.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("forms.newAgency.subtitle")}
        </p>
      </header>
      <AgencyForm />
    </div>
  );
}
