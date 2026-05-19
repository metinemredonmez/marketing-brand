/**
 * JSON-LD structured data — schema.org
 * Server component, <Script> ya da inline <script> ile basabilirsin
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://markaradar.com";

interface Author {
  fullName: string;
  avatarUrl?: string | null;
  linkedinUrl?: string | null;
}

interface ArticleSchemaProps {
  title: string;
  slug: string;
  description?: string | null;
  coverUrl?: string | null;
  publishedAt: string;
  updatedAt?: string | null;
  author?: Author | null;
  category?: { slug: string; name: string } | null;
}

export function ArticleJsonLd({
  title,
  slug,
  description,
  coverUrl,
  publishedAt,
  updatedAt,
  author,
  category,
}: ArticleSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: description ?? undefined,
    image: coverUrl
      ? [coverUrl]
      : [`${SITE_URL}/api/og?title=${encodeURIComponent(title)}`],
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/haber/${slug}`,
    },
    author: author
      ? {
          "@type": "Person",
          name: author.fullName,
          image: author.avatarUrl ?? undefined,
          sameAs: author.linkedinUrl ? [author.linkedinUrl] : undefined,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "MarkaRadar",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    articleSection: category?.name,
    inLanguage: "tr-TR",
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MarkaRadar",
    alternateName: "MarkaRadar — Türkiye'nin AI-native pazarlama medyası",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    foundingDate: "2026",
    description:
      "Türkiye'nin pazarlama, reklam ve marka gündemini AI ile yakalayan medya platformu.",
    sameAs: [
      "https://twitter.com/markaradar",
      "https://linkedin.com/company/markaradar",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@markaradar.com",
      contactType: "customer service",
      availableLanguage: ["Turkish", "English"],
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MarkaRadar",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/arama?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["tr-TR", "en-US"],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url.startsWith("http") ? it.url : `${SITE_URL}${it.url}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface FaqItem {
  q: string;
  a: string;
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
