import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/api/articles";
import { listAgencies } from "@/lib/api/agencies";
import { listCourses } from "@/lib/api/courses";
// import { listJobs } from "@/lib/api/jobs"; // İş ilanları gizlendi
import { listEvents } from "@/lib/api/events";
import { listReports } from "@/lib/api/reports";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003";

export const revalidate = 3600; // saatlik regenerate

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Statik sayfalar
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/premium`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/reklam-ver`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/ajans-rehberi`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/akademi`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/etkinlikler`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/raporlar`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/hakkimizda`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/iletisim`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/kvkk`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/gizlilik`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/kullanim-kosullari`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Kategoriler (sabit liste — DB'den de çekilebilir)
  const categories = [
    "ai-marketing",
    "marka-hamlesi",
    "marka-kampanyalari",
    "ajans-haberleri",
    "sosyal-medya",
    "influencer",
    "performans",
    "globalden",
    "rehber",
  ];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${SITE_URL}/kategori/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Dinamik route'lar — paralel fetch
  const safe = async <T>(p: Promise<T>, fallback: T): Promise<T> => {
    try {
      return await p;
    } catch {
      return fallback;
    }
  };

  const [articles, agencies, courses, events] = await Promise.all([
    safe(listArticles({ limit: 500 }), { items: [], total: 0, limit: 500, offset: 0 }),
    safe(listAgencies({ limit: 200 }), { items: [], total: 0, limit: 200, offset: 0 }),
    safe(listCourses(), []),
    safe(listEvents(), []),
  ]);

  const articleRoutes: MetadataRoute.Sitemap = articles.items.map((a) => ({
    url: `${SITE_URL}/haber/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const agencyRoutes: MetadataRoute.Sitemap = agencies.items.map((a) => ({
    url: `${SITE_URL}/ajans-rehberi/${a.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${SITE_URL}/akademi/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${SITE_URL}/etkinlikler/${e.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...agencyRoutes,
    ...courseRoutes,
    ...eventRoutes,
  ];
}
