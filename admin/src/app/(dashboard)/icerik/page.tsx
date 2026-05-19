import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n/server";

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  isPremium: boolean;
  isSponsored: boolean;
  publishedAt: string | null;
  updatedAt: string;
  viewCount: string | number;
  category: { name: string } | null;
  author: { fullName: string } | null;
}

const STATUS_VARIANT: Record<string, string> = {
  draft: "secondary",
  in_review: "warning",
  scheduled: "outline",
  published: "success",
  archived: "destructive",
};

export default async function IcerikPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  qs.set("limit", "50");

  let data: { items: ArticleRow[]; total: number } = { items: [], total: 0 };
  try {
    data = await apiFetch(`/admin/articles?${qs}`);
  } catch {}

  const t = await getTranslations();
  const locale = t.locale === "en" ? "en-US" : "tr-TR";
  const STATUS_KEYS = ["draft", "in_review", "scheduled", "published", "archived"];

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("articles.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("articles.countLabel", { count: data.total })}
          </p>
        </div>
        <Button asChild>
          <Link href="/icerik/yeni">
            <Plus size={16} /> {t("articles.newArticle")}
          </Link>
        </Button>
      </header>

      {/* Status filter */}
      <div className="mb-4 flex gap-2 text-sm">
        <Link
          href="/icerik"
          className={`rounded-md px-3 py-1.5 ${
            !status
              ? "bg-primary text-primary-foreground"
              : "border bg-card"
          }`}
        >
          {t("common.all")}
        </Link>
        {STATUS_KEYS.map((key) => (
          <Link
            key={key}
            href={`/icerik?status=${key}`}
            className={`rounded-md px-3 py-1.5 ${
              status === key
                ? "bg-primary text-primary-foreground"
                : "border bg-card"
            }`}
          >
            {t(`articleStatus.${key}`)}
          </Link>
        ))}
      </div>

      {data.items.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <FileText size={48} className="mx-auto text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">{t("articles.empty")}</p>
          <Button asChild className="mt-4">
            <Link href="/icerik/yeni">
              <Plus size={14} /> {t("articles.firstArticle")}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  {t("articles.column.title")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("articles.column.category")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("articles.column.status")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("articles.column.author")}
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  {t("articles.column.views")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("articles.column.updated")}
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((a) => {
                const variant = STATUS_VARIANT[a.status] ?? "secondary";
                return (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/icerik/${a.id}`}
                          className="font-medium text-foreground hover:text-brand-500"
                        >
                          {a.title}
                        </Link>
                        {a.isPremium && (
                          <Badge variant="accent">
                            {t("articles.badge.premium")}
                          </Badge>
                        )}
                        {a.isSponsored && (
                          <Badge variant="warning">
                            {t("articles.badge.sponsored")}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          variant as
                            | "default"
                            | "secondary"
                            | "success"
                            | "warning"
                            | "destructive"
                            | "outline"
                            | "accent"
                        }
                      >
                        {t(`articleStatus.${a.status}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.author?.fullName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                      {a.viewCount}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(a.updatedAt).toLocaleDateString(locale)}
                    </td>
                    <td className="px-4 py-3">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/icerik/${a.id}`}>
                          {t("articles.edit")}
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
