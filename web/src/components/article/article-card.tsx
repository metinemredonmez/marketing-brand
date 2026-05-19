import Link from "next/link";
import Image from "next/image";
import type { ArticleListItem } from "@/lib/api/articles";
import { formatDate } from "@/lib/utils";

export function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <Link
      href={`/haber/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {article.coverUrl ? (
          <Image
            src={article.coverUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            MarkaRadar
          </div>
        )}
        {article.isPremium && (
          <span className="absolute right-2 top-2 rounded bg-accent px-2 py-1 text-xs font-semibold text-white">
            Premium
          </span>
        )}
        {article.isSponsored && (
          <span className="absolute left-2 top-2 rounded bg-slate-900/80 px-2 py-1 text-xs font-semibold text-white">
            Sponsorlu
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {article.category && (
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {article.category.name}
          </div>
        )}
        <h3 className="mt-1 text-lg font-semibold text-foreground group-hover:text-brand-500">
          {article.title}
        </h3>
        {article.spot && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.spot}</p>
        )}
        <div className="mt-auto pt-3 text-xs text-muted-foreground">
          {formatDate(article.publishedAt)}
          {article.readingTime ? ` · ${article.readingTime} dk okuma` : null}
        </div>
      </div>
    </Link>
  );
}
