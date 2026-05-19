import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  Sparkles,
  Megaphone,
  Wallet,
  BarChart3,
  Users,
  LogOut,
} from "lucide-react";
import { getCurrentUser } from "@/lib/api/client";
import { brandApi } from "@/lib/api/brand";
import { logoutAction } from "@/app/actions/auth";
import { getTranslations } from "@/lib/i18n/server";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LocaleSwitch } from "@/components/locale/locale-switch";

const NAV = [
  { href: "/marka-paneli", i18n: "brandPortal.nav.dashboard", icon: Building2 },
  {
    href: "/marka-paneli/ai",
    i18n: "brandPortal.nav.ai",
    icon: Sparkles,
  },
  {
    href: "/marka-paneli/kampanya",
    i18n: "brandPortal.nav.campaigns",
    icon: Megaphone,
  },
  {
    href: "/marka-paneli/cuzdan",
    i18n: "brandPortal.nav.wallet",
    icon: Wallet,
  },
  {
    href: "/marka-paneli/raporlar",
    i18n: "brandPortal.nav.reports",
    icon: BarChart3,
  },
  { href: "/marka-paneli/ekip", i18n: "brandPortal.nav.team", icon: Users },
];

export default async function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/marka-paneli");
  if (user.role !== "brand_user" && user.role !== "super_admin") {
    redirect("/marka-kayit");
  }

  let accounts: Awaited<ReturnType<typeof brandApi.myAccounts>> = [];
  try {
    accounts = await brandApi.myAccounts();
  } catch {
    redirect("/marka-kayit");
  }
  if (accounts.length === 0) redirect("/marka-kayit");

  const primary = accounts[0]?.brandAccount;
  const t = await getTranslations();
  const locale = t.locale === "en" ? "en-US" : "tr-TR";
  const balance = primary?.wallet ? Number(primary.wallet.balanceTry) : 0;

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="border-b px-5 py-4">
          <Link href="/" className="text-sm font-bold text-foreground">
            MarkaRadar
          </Link>
          <div className="mt-0.5 text-xs uppercase tracking-wide text-accent">
            {t("brandPortal.studioLabel")}
          </div>
        </div>
        <div className="border-b px-5 py-4">
          <div className="text-sm font-semibold text-foreground">
            {primary?.companyName}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {t("brandPortal.balance")}:{" "}
            <span className="font-mono font-semibold text-foreground">
              {balance.toLocaleString(locale, {
                style: "currency",
                currency: "TRY",
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          {primary?.status === "pending_kyc" && (
            <div className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {t("brandPortal.pendingKyc")}
            </div>
          )}
        </div>
        <nav className="flex-1 px-2 py-3">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {t(n.i18n)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t px-3 py-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <LocaleSwitch />
            <ThemeToggle />
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" /> {t("common.logout")}
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-10 md:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
