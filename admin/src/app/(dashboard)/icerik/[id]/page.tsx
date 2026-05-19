import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/dashboard/article-form";
import { apiFetch, ApiError } from "@/lib/api/client";
import { getTranslations } from "@/lib/i18n/server";

interface Article {
  id: string;
  slug: string;
  title: string;
  spot: string | null;
  body: string;
  coverUrl: string | null;
  status: string;
  isPremium: boolean;
  isSponsored: boolean;
  aiSummary: string | null;
  aiWhyMatters: string | null;
  aiBrandTakeaways: string[] | null;
  aiAgencyTakeaways: string[] | null;
  aiHumanRatio: number | null;
}

export default async function MakaleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let article: Article;
  try {
    article = await apiFetch<Article>(`/admin/articles/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("forms.editArticle.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <code>{article.slug}</code> · {article.status}
          </p>
        </div>
      </header>
      <ArticleForm
        initial={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          spot: article.spot ?? "",
          body: article.body,
          coverUrl: article.coverUrl ?? "",
          isPremium: article.isPremium,
          isSponsored: article.isSponsored,
          aiSummary: article.aiSummary ?? "",
          aiWhyMatters: article.aiWhyMatters ?? "",
        }}
      />
    </div>
  );
}
