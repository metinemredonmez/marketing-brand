import { AiStudio } from "@/components/dashboard/ai-studio";
import { getTranslations } from "@/lib/i18n/server";

export default async function AiStudyoPage() {
  const t = await getTranslations();
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {t("aiStudio.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("aiStudio.subtitle")}
        </p>
      </header>
      <AiStudio />
    </div>
  );
}
