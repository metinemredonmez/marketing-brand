import { ArticleForm } from "@/components/dashboard/article-form";
import { getTranslations } from "@/lib/i18n/server";

export default async function YeniMakalePage() {
  const t = await getTranslations();
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {t("forms.newArticle.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("forms.newArticle.subtitle")}
        </p>
      </header>
      <ArticleForm />
    </div>
  );
}
