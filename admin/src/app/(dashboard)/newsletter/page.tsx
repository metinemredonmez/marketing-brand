import { Mail } from "lucide-react";
import { NewsletterComposer } from "@/components/dashboard/newsletter-composer";
import { API_BASE } from "@/lib/api/client";
import { getTranslations } from "@/lib/i18n/server";

export default async function NewsletterPage() {
  let stats = { confirmedCount: 0 };
  try {
    const res = await fetch(`${API_BASE}/api/v1/newsletter/stats`, {
      cache: "no-store",
    });
    if (res.ok) stats = await res.json();
  } catch {}
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Mail size={24} /> {t("newsletter.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("newsletter.subtitle")}
        </p>
      </header>
      <NewsletterComposer stats={stats} />
    </div>
  );
}
