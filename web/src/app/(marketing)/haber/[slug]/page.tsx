import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, Building2, Megaphone } from "lucide-react";
import { getArticle } from "@/lib/api/articles";
import { ApiError, getCurrentUser } from "@/lib/api/client";
import { ArticlePaywall } from "@/components/article/paywall";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const a = await getArticle(slug);
    const ogFallback = `/api/og?title=${encodeURIComponent(a.title)}${
      a.category ? `&category=${encodeURIComponent(a.category.name)}` : ""
    }&eyebrow=${encodeURIComponent("MarkaRadar")}`;
    return {
      title: a.title,
      description: a.spot ?? a.aiSummary ?? undefined,
      openGraph: {
        title: a.title,
        description: a.spot ?? undefined,
        type: "article",
        images: [a.coverUrl ?? ogFallback],
      },
      twitter: {
        card: "summary_large_image",
        title: a.title,
        description: a.spot ?? undefined,
        images: [a.coverUrl ?? ogFallback],
      },
    };
  } catch {
    return { title: "Haber bulunamadı" };
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  let article;
  try {
    article = await getArticle(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const user = await getCurrentUser();
  const showPaywall = article.isPremium && !user;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      <ArticleJsonLd
        title={article.title}
        slug={article.slug}
        description={article.spot ?? article.aiSummary}
        coverUrl={article.coverUrl}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        author={article.author}
        category={article.category}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Anasayfa", url: "/" },
          ...(article.category
            ? [
                {
                  name: article.category.name,
                  url: `/kategori/${article.category.slug}`,
                },
              ]
            : []),
          { name: article.title, url: `/haber/${article.slug}` },
        ]}
      />
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Ana sayfa
      </Link>

      {/* Meta header */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {article.category && (
          <Link
            href={`/kategori/${article.category.slug}`}
            className="text-[11px] font-semibold uppercase tracking-widest text-accent hover:underline"
          >
            {article.category.name}
          </Link>
        )}
        {article.isPremium && (
          <Badge
            variant="accent"
            className="text-[10px] uppercase tracking-widest"
          >
            Premium
          </Badge>
        )}
        {article.isSponsored && (
          <Badge
            variant="warning"
            className="text-[10px] uppercase tracking-widest"
          >
            Sponsorlu{" "}
            {article.sponsorLabel ? `· ${article.sponsorLabel}` : ""}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl md:tracking-[-0.03em]">
        {article.title}
      </h1>

      {/* Spot */}
      {article.spot && (
        <p className="mt-5 text-xl leading-relaxed text-muted-foreground md:text-2xl">
          {article.spot}
        </p>
      )}

      {/* Byline */}
      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-y py-4 text-sm text-muted-foreground">
        {article.author && (
          <span className="font-medium text-foreground">
            {article.author.fullName}
          </span>
        )}
        {article.publishedAt && (
          <>
            <span aria-hidden>·</span>
            <span>{formatDate(article.publishedAt)}</span>
          </>
        )}
        {article.readingTime && (
          <>
            <span aria-hidden>·</span>
            <span>{article.readingTime} dk okuma</span>
          </>
        )}
        {typeof article.aiHumanRatio === "number" && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest">
            <Sparkles className="h-2.5 w-2.5 text-accent" />{" "}
            %{article.aiHumanRatio} AI
          </span>
        )}
      </div>

      {/* Cover image */}
      {article.coverUrl && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src={article.coverUrl}
            alt={article.coverAlt ?? article.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* AI Summary */}
      {article.aiSummary && (
        <aside className="mt-10 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
            <Sparkles className="h-3 w-3" /> AI Özet — 30 saniye
          </div>
          <p className="mt-2 text-base leading-relaxed text-foreground/90">
            {article.aiSummary}
          </p>
        </aside>
      )}

      {/* Main body */}
      {showPaywall ? (
        <>
          {article.body && (
            <div
              className="prose prose-stone dark:prose-invert mt-10 max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:font-bold [mask-image:linear-gradient(180deg,#000_60%,transparent)]"
              dangerouslySetInnerHTML={{
                __html: article.body.slice(0, 800),
              }}
            />
          )}
          <ArticlePaywall isAuthenticated={!!user} />
        </>
      ) : (
        <div
          className="prose prose-stone dark:prose-invert mt-10 max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:font-bold prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: article.body ?? "" }}
        />
      )}

      {/* Semaform structured analysis */}
      {!showPaywall && (
        <section className="mt-12 border-t pt-10">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-accent">
            AI-native analiz
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl md:tracking-[-0.02em]">
            Bu haberden çıkarılacak.
          </h2>

          {article.aiWhyMatters && (
            <div className="mt-6 rounded-lg border border-dashed bg-muted/30 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Neden önemli?
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
                {article.aiWhyMatters}
              </p>
            </div>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {Array.isArray(article.aiBrandTakeaways) &&
              article.aiBrandTakeaways.length > 0 && (
                <SemaformBox
                  icon={Building2}
                  label="Markalar için çıkarım"
                  items={article.aiBrandTakeaways}
                  tone="brand"
                />
              )}

            {Array.isArray(article.aiAgencyTakeaways) &&
              article.aiAgencyTakeaways.length > 0 && (
                <SemaformBox
                  icon={Megaphone}
                  label="Ajanslar için çıkarım"
                  items={article.aiAgencyTakeaways}
                  tone="agency"
                />
              )}
          </div>
        </section>
      )}
    </article>
  );
}

function SemaformBox({
  icon: Icon,
  label,
  items,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  items: string[];
  tone: "brand" | "agency";
}) {
  const styles =
    tone === "brand"
      ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30"
      : "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30";
  const accent =
    tone === "brand"
      ? "text-emerald-700 dark:text-emerald-400"
      : "text-blue-700 dark:text-blue-400";

  return (
    <div className={`rounded-lg border p-4 ${styles}`}>
      <div
        className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest ${accent}`}
      >
        <Icon className="h-3 w-3" /> {label}
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm leading-relaxed text-foreground/90 before:mr-1.5 before:content-['—'] before:text-foreground/40"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
