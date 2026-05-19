import { Building2 } from "lucide-react";
import { adminBrandApi } from "@/lib/api/brand-portal";
import { getTranslations } from "@/lib/i18n/server";
import { AccountRow } from "./_row";

export default async function AdminBrandAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const accounts = await adminBrandApi.listAccounts(status).catch(() => []);
  const t = await getTranslations();

  const STATUS_FILTERS: Array<{ v?: string; label: string }> = [
    { label: t("brandStudio.accounts.filter.all") },
    {
      v: "pending_kyc",
      label: t("brandStudio.accounts.filter.pendingKyc"),
    },
    { v: "active", label: t("brandStudio.accounts.filter.active") },
    { v: "suspended", label: t("brandStudio.accounts.filter.suspended") },
    { v: "rejected", label: t("brandStudio.accounts.filter.rejected") },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Building2 size={24} /> {t("brandStudio.accounts.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("brandStudio.accounts.subtitle")}
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active =
            (f.v ?? "") === (status ?? "") || (!f.v && !status);
          return (
            <a
              key={f.label}
              href={f.v ? `?status=${f.v}` : "?"}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-card text-foreground/80 hover:border-border"
              }`}
            >
              {f.label}
            </a>
          );
        })}
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
          {t("brandStudio.accounts.empty")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">
                  {t("brandStudio.accounts.column.company")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("brandStudio.accounts.column.contact")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("brandStudio.accounts.column.tax")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("brandStudio.accounts.column.wallet")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("brandStudio.accounts.column.status")}
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  {t("brandStudio.accounts.column.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {accounts.map((a) => (
                <AccountRow key={a.id} account={a} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
