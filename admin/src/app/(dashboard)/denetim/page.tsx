import { ShieldCheck } from "lucide-react";
import { auditLogApi } from "@/lib/api/audit-log";
import { getTranslations } from "@/lib/i18n/server";
import { AuditRow } from "./_row";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string;
    resource?: string;
    actorEmail?: string;
    failedOnly?: string;
  }>;
}) {
  const sp = await searchParams;
  const t = await getTranslations();

  const [data, actions, resources] = await Promise.all([
    auditLogApi
      .list({
        action: sp.action,
        resource: sp.resource,
        actorEmail: sp.actorEmail,
        failedOnly: sp.failedOnly === "true",
        limit: 100,
      })
      .catch(() => ({ items: [], total: 0, limit: 0, offset: 0 })),
    auditLogApi.actions().catch(() => []),
    auditLogApi.resources().catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <ShieldCheck size={24} /> {t("audit.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("audit.subtitle")} ·{" "}
          {t("audit.countLabel", { count: data.total })}
        </p>
      </header>

      <form
        method="GET"
        className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border bg-card p-3"
      >
        <div className="flex-1 min-w-40">
          <label className="text-xs text-muted-foreground">
            {t("audit.filter.action")}
          </label>
          <select
            name="action"
            defaultValue={sp.action ?? ""}
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
          >
            <option value="">{t("common.all")}</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-40">
          <label className="text-xs text-muted-foreground">
            {t("audit.filter.resource")}
          </label>
          <select
            name="resource"
            defaultValue={sp.resource ?? ""}
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
          >
            <option value="">{t("common.all")}</option>
            {resources.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-48">
          <label className="text-xs text-muted-foreground">
            {t("audit.filter.actorEmail")}
          </label>
          <input
            type="text"
            name="actorEmail"
            defaultValue={sp.actorEmail ?? ""}
            placeholder="user@..."
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
          />
        </div>
        <label className="inline-flex h-9 items-center gap-1.5 px-2 text-xs text-foreground/80">
          <input
            type="checkbox"
            name="failedOnly"
            value="true"
            defaultChecked={sp.failedOnly === "true"}
            className="h-3.5 w-3.5"
          />
          {t("audit.filter.failedOnly")}
        </label>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("audit.filter.apply")}
        </button>
        <a
          href="/denetim"
          className="h-9 inline-flex items-center rounded-md border px-3 text-sm text-foreground/80 hover:bg-muted"
        >
          {t("audit.filter.clear")}
        </a>
      </form>

      {data.items.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
          {t("audit.empty")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">
                  {t("audit.column.time")}
                </th>
                <th className="px-3 py-2 font-medium">
                  {t("audit.column.actor")}
                </th>
                <th className="px-3 py-2 font-medium">
                  {t("audit.column.action")}
                </th>
                <th className="px-3 py-2 font-medium">
                  {t("audit.column.resource")}
                </th>
                <th className="px-3 py-2 font-medium">
                  {t("audit.column.status")}
                </th>
                <th className="px-3 py-2 font-medium">
                  {t("audit.column.changes")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((entry) => (
                <AuditRow key={entry.id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
