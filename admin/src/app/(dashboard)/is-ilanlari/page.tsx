import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n/server";

interface Job {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  seniority: string;
  employmentType: string;
  location: string | null;
  isRemote: boolean;
  plan: string;
  status: string;
  publishedAt: string | null;
  expiresAt: string | null;
  viewCount: number;
  applyCount: number;
}

const STATUS_VARIANT: Record<string, string> = {
  pending: "warning",
  active: "success",
  expired: "secondary",
  filled: "outline",
  withdrawn: "destructive",
};

const STATUS_KEYS = ["pending", "active", "expired", "filled", "withdrawn"];

export default async function JobsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  qs.set("limit", "50");

  let data: { items: Job[]; total: number } = { items: [], total: 0 };
  try {
    data = await apiFetch(`/admin/jobs?${qs}`);
  } catch {}

  const t = await getTranslations();
  const locale = t.locale === "en" ? "en-US" : "tr-TR";

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Briefcase size={24} /> {t("jobs.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("jobs.countLabel", { count: data.total })}
          </p>
        </div>
        <Button asChild>
          <Link href="/is-ilanlari/yeni">
            <Plus size={16} /> {t("jobs.new")}
          </Link>
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/is-ilanlari"
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
            href={`/is-ilanlari?status=${key}`}
            className={`rounded-md px-3 py-1.5 ${
              status === key
                ? "bg-primary text-primary-foreground"
                : "border bg-card"
            }`}
          >
            {t(`jobs.status.${key}`)}
          </Link>
        ))}
      </div>

      {data.items.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Briefcase size={48} className="mx-auto text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">{t("jobs.empty")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  {t("jobs.column.role")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("jobs.column.company")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("jobs.column.seniority")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("jobs.column.plan")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("jobs.column.status")}
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  {t("jobs.column.viewApply")}
                </th>
                <th className="px-4 py-3 font-semibold">
                  {t("jobs.column.expires")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((j) => {
                const variant = STATUS_VARIANT[j.status] ?? "secondary";
                return (
                  <tr key={j.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {j.title}
                      {j.isRemote && (
                        <Badge variant="secondary" className="ml-2">
                          {t("jobs.remote")}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {j.companyName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {j.seniority}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          j.plan === "premium_distribution"
                            ? "accent"
                            : j.plan === "featured"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {j.plan}
                      </Badge>
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
                        {t(`jobs.status.${j.status}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                      {j.viewCount} / {j.applyCount}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {j.expiresAt
                        ? new Date(j.expiresAt).toLocaleDateString(locale)
                        : "—"}
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
