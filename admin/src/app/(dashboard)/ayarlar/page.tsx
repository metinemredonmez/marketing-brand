import {
  Settings as SettingsIcon,
  Database,
  Server,
  HardDrive,
  Sparkles,
  Mail,
  CreditCard,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { API_BASE, apiFetch } from "@/lib/api/client";
import { Card } from "@/components/ui/card";
import { getTranslations } from "@/lib/i18n/server";

interface HealthResp {
  status: string;
  uptime: number;
  version: string;
  checks: {
    db: { ok: boolean };
    redis: { ok: boolean };
  };
}

interface AiUsage {
  totalCostUsd: number;
  budgetUsd: number;
  remainingUsd: number;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return [d ? `${d}d` : "", h ? `${h}h` : "", `${m}m`].filter(Boolean).join(" ");
}

export default async function SettingsPage() {
  const t = await getTranslations();

  let health: HealthResp | null = null;
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    if (res.ok) health = await res.json();
  } catch {}

  let aiUsage: AiUsage | null = null;
  try {
    aiUsage = await apiFetch<AiUsage>("/admin/ai/usage");
  } catch {}

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <SettingsIcon size={24} /> {t("settings.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </header>

      <Card className="mb-6 p-6">
        <h2 className="font-bold text-foreground">{t("settings.services.title")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ServiceRow
            icon={Database}
            label={t("settings.services.database")}
            ok={health?.checks.db.ok ?? false}
            okText={t("settings.services.healthy")}
            badText={t("settings.services.unhealthy")}
          />
          <ServiceRow
            icon={Server}
            label={t("settings.services.redis")}
            ok={health?.checks.redis.ok ?? false}
            okText={t("settings.services.healthy")}
            badText={t("settings.services.unhealthy")}
          />
          <ServiceRow
            icon={HardDrive}
            label={t("settings.services.storage")}
            ok={true}
            okText={t("settings.services.configured")}
            badText={t("settings.services.notConfigured")}
          />
          <ServiceRow
            icon={Sparkles}
            label={t("settings.services.ai")}
            ok={!!aiUsage}
            okText={t("settings.services.configured")}
            badText={t("settings.services.notConfigured")}
          />
          <ServiceRow
            icon={Mail}
            label={t("settings.services.mail")}
            ok={true}
            okText={t("settings.services.configured")}
            badText={t("settings.services.notConfigured")}
          />
          <ServiceRow
            icon={CreditCard}
            label={t("settings.services.payment")}
            ok={false}
            okText={t("settings.services.configured")}
            badText={t("settings.services.notConfigured")}
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-bold text-foreground">
            {t("settings.appInfo.title")}
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t("settings.appInfo.version")}
              </dt>
              <dd className="font-mono text-foreground">
                {health?.version ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t("settings.appInfo.environment")}
              </dt>
              <dd className="font-mono text-foreground">
                {process.env.NODE_ENV ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t("settings.appInfo.uptime")}
              </dt>
              <dd className="font-mono text-foreground">
                {health ? formatUptime(health.uptime) : "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-bold text-foreground">
            {t("settings.aiBudget.title")}
          </h2>
          {aiUsage ? (
            <>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    {t("settings.aiBudget.cap")}
                  </dt>
                  <dd className="font-mono text-foreground">
                    ${aiUsage.budgetUsd.toFixed(0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    {t("settings.aiBudget.used")}
                  </dt>
                  <dd className="font-mono text-foreground">
                    ${aiUsage.totalCostUsd.toFixed(2)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    {t("settings.aiBudget.remaining")}
                  </dt>
                  <dd className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    ${aiUsage.remainingUsd.toFixed(2)}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-accent"
                  style={{
                    width: `${Math.min(
                      100,
                      (aiUsage.totalCostUsd / aiUsage.budgetUsd) * 100,
                    )}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">—</p>
          )}
        </Card>
      </div>

      <Card className="mt-6 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        {t("settings.placeholder")}
      </Card>
    </div>
  );
}

function ServiceRow({
  icon: Icon,
  label,
  ok,
  okText,
  badText,
}: {
  icon: React.ElementType;
  label: string;
  ok: boolean;
  okText: string;
  badText: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-card p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon size={14} /> {label}
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          ok
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
        }`}
      >
        {ok ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : (
          <XCircle className="h-3 w-3" />
        )}
        {ok ? okText : badText}
      </span>
    </div>
  );
}
