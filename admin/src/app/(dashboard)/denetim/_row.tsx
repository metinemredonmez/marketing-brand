"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import type { AuditLogEntry } from "@/lib/api/audit-log";

export function AuditRow({ entry }: { entry: AuditLogEntry }) {
  const [open, setOpen] = useState(false);
  const { t, locale } = useTranslations();
  const fmt = locale === "en" ? "en-US" : "tr-TR";

  const hasChanges =
    entry.changes && Object.keys(entry.changes).length > 0;

  return (
    <>
      <tr className="hover:bg-muted/40">
        <td className="px-3 py-2 align-top font-mono text-xs text-muted-foreground">
          {new Date(entry.createdAt).toLocaleString(fmt)}
        </td>
        <td className="px-3 py-2 align-top">
          <div className="text-xs text-foreground/80">
            {entry.actorEmail ?? "—"}
          </div>
          {entry.ipAddress && (
            <div className="text-[10px] text-muted-foreground">
              {entry.ipAddress}
            </div>
          )}
        </td>
        <td className="px-3 py-2 align-top">
          <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
            {entry.action}
          </code>
        </td>
        <td className="px-3 py-2 align-top text-xs">
          <div className="text-foreground/80">{entry.resource}</div>
          {entry.resourceId && (
            <div className="font-mono text-[10px] text-muted-foreground">
              {entry.resourceId.slice(0, 16)}
            </div>
          )}
        </td>
        <td className="px-3 py-2 align-top">
          {entry.success ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-2.5 w-2.5" /> {t("audit.success")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-800 dark:bg-red-950/40 dark:text-red-300">
              <XCircle className="h-2.5 w-2.5" /> {t("audit.failed")}
            </span>
          )}
        </td>
        <td className="px-3 py-2 align-top">
          {hasChanges || entry.errorMessage ? (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <ChevronDown
                className={`h-3 w-3 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
              {open ? t("audit.hideDetails") : t("audit.showDetails")}
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">
              {t("audit.noChanges")}
            </span>
          )}
        </td>
      </tr>
      {open && (
        <tr className="bg-muted/30">
          <td colSpan={6} className="px-3 py-3">
            {entry.errorMessage && (
              <div className="mb-3 rounded-md bg-red-50 p-3 text-xs text-red-900 dark:bg-red-950/40 dark:text-red-300">
                <div className="font-semibold">errorMessage</div>
                <div className="mt-1 font-mono">{entry.errorMessage}</div>
              </div>
            )}
            {hasChanges && (
              <pre className="max-h-64 overflow-auto rounded-md bg-background p-3 font-mono text-[11px] text-foreground/80">
                {JSON.stringify(entry.changes, null, 2)}
              </pre>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
