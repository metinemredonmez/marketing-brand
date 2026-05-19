import { Users as UsersIcon } from "lucide-react";
import { adminUsersApi } from "@/lib/api/users";
import { getTranslations } from "@/lib/i18n/server";
import { UserRow } from "./_row";

const ROLES = [
  "reader",
  "brand_user",
  "writer",
  "editor",
  "social_manager",
  "sales",
  "super_admin",
];

export default async function UsersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const { role, q } = await searchParams;
  const data = await adminUsersApi
    .list({ role, search: q, limit: 100 })
    .catch(() => ({ items: [], total: 0 }));
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <UsersIcon size={24} /> {t("users.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("users.subtitle")} · {t("users.countLabel", { count: data.total })}
        </p>
      </header>

      <form className="mb-4 flex flex-wrap items-center gap-2" method="GET">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("users.searchPlaceholder")}
          className="h-9 w-72 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="role"
          defaultValue={role ?? ""}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="">{t("common.all")}</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("common.search")}
        </button>
      </form>

      {data.items.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
          {t("users.empty")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">
                  {t("users.column.name")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("users.column.email")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("users.column.role")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("users.column.status")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("users.column.verified")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("users.column.lastLogin")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t("users.column.joined")}
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  {t("users.column.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((u) => (
                <UserRow key={u.id} user={u} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
