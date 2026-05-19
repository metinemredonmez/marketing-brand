"use client";

import { useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  setUserActiveAction,
  setUserRoleAction,
} from "@/app/actions/users";
import { useTranslations } from "@/lib/i18n/client";
import type { AdminUser } from "@/lib/api/users";

const ROLES = [
  "reader",
  "brand_user",
  "writer",
  "editor",
  "social_manager",
  "sales",
  "super_admin",
];

export function UserRow({ user }: { user: AdminUser }) {
  const [pending, start] = useTransition();
  const { t, locale } = useTranslations();
  const dateLocale = locale === "en" ? "en-US" : "tr-TR";

  function toggleActive() {
    if (
      user.isActive &&
      !confirm(
        t("users.confirmDeactivate", { name: user.fullName || user.email }),
      )
    ) {
      return;
    }
    start(async () => {
      await setUserActiveAction(user.id, !user.isActive);
    });
  }

  function onRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value;
    if (role === user.role) return;
    start(async () => {
      await setUserRoleAction(user.id, role);
    });
  }

  return (
    <tr className="hover:bg-muted">
      <td className="px-4 py-3 font-medium text-foreground">
        {user.fullName || "—"}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
      <td className="px-4 py-3">
        <select
          value={user.role}
          onChange={onRoleChange}
          disabled={pending}
          className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground disabled:opacity-50"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        {user.isActive ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            {t("users.statusActive")}
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80">
            {t("users.statusInactive")}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-xs">
        {user.emailVerified ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> {t("users.verified")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <XCircle className="h-3 w-3" /> {t("users.notVerified")}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {user.lastLoginAt
          ? new Date(user.lastLoginAt).toLocaleDateString(dateLocale)
          : t("users.never")}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString(dateLocale)}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={pending}
          onClick={toggleActive}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium disabled:opacity-50 ${
            user.isActive
              ? "bg-red-50 text-red-800 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
          }`}
        >
          {user.isActive ? t("users.deactivate") : t("users.activate")}
        </button>
      </td>
    </tr>
  );
}
