import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { listArticles } from "@/lib/api/articles";
import { ArticleCard } from "@/components/article/article-card";
import { GridPattern } from "@/components/marketing/grid-pattern";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  "ai-marketing": "AI Marketing",
  "marka-kampanyalari": "Marka Kampanyaları",
  "marka-hamlesi": "Marka Hamlesi",
  "ajans-haberleri": "Ajans Haberleri",
  "sosyal-medya": "Sosyal Medya",
  influencer: "Influencer Marketing",
  performans: "Performans Pazarlama",
  globalden: "Globalden Türkiye'ye",
  rehber: "Rehberler",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "ai-marketing":
    "Yapay zekânın pazarlama dünyasındaki etkisi — yeni araçlar, vaka çalışmaları, AI-native stratejiler.",
  "marka-kampanyalari":
    "Türkiye ve dünyadan dikkat çeken marka kampanyaları — ne yaptılar, ne işe yaradı.",
  "marka-hamlesi":
    "Markaların büyük hamleleri — strateji, sayısal sonuç, sektör için ne anlama geliyor.",
  "ajans-haberleri":
    "Ajans dünyasının nabzı — büyüme hikâyeleri, yeni iş kayıpları, transferler.",
  "sosyal-medya":
    "Sosyal medya pazarlaması, platform değişiklikleri, yeni formatlar.",
  influencer:
    "Influencer marketing, brand-creator işbirlikleri, ROI ölçümleri.",
  performans:
    "Performans pazarlama — Meta, Google, TikTok ads, conversion stratejileri.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = CATEGORY_LABELS[slug] ?? slug;
  return {
    title: `${name} — MarkaRadar`,
    description:
      CATEGORY_DESCRIPTIONS[slug] ??
      `Türkiye'nin ${name.toLowerCase()} gündemi.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));
  const limit = 24;
  const offset = (page - 1) * limit;

  const name = CATEGORY_LABELS[slug] ?? slug;
  const description = CATEGORY_DESCRIPTIONS[slug];
  let data;
  try {
    data = await listArticles({ category: slug, limit, offset });
  } catch {
    data = { items: [], total: 0, limit, offset };
  }
  const totalPages = Math.max(1, Math.ceil(data.total / limit));

  return (
    <>
      {/* HERO — Linear minimal */}
      <section className="relative overflow-hidden border-b">
        <GridPattern variant="dots" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-accent/[0.05] blur-3xl"
        />
        <div className="container relative mx-auto max-w-5xl px-4 py-16 md:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Ana sayfa
          </Link>
          <div className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-accent">
            Kategori
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground md:text-6xl md:tracking-[-0.03em]">
            {name}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              {description}
            </p>
          )}
          <div className="mt-5 text-xs text-muted-foreground">
            {data.total} haber
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        {data.items.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
            Bu kategoride henüz haber yok.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            {page > 1 ? (
              <Link
                href={`/kategori/${slug}?page=${page - 1}`}
                className="inline-flex h-9 items-center gap-1 rounded-md border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-3 w-3" /> Önceki
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-md border bg-muted/30 px-4 text-sm font-medium text-muted-foreground">
                <ArrowLeft className="h-3 w-3" /> Önceki
              </span>
            )}
            <span className="font-mono text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/kategori/${slug}?page=${page + 1}`}
                className="inline-flex h-9 items-center gap-1 rounded-md border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
              >
                Sonraki <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-md border bg-muted/30 px-4 text-sm font-medium text-muted-foreground">
                Sonraki <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>
        )}
      </section>
    </>
  );
}
