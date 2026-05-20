import Link from "next/link";
import {
  Home,
  FileText,
  Sparkles,
  Building2,
  ShieldCheck,
  Mail,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  Briefcase,
  GraduationCap,
  Trophy,
  MessageSquare,
  FileBarChart,
  Megaphone,
} from "lucide-react";
import { getTranslations } from "@/lib/i18n/server";

interface NavItem {
  href: string;
  /** translation key path */
  i18n: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  /** translation key path */
  i18n: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    i18n: "nav.section.main",
    items: [
      { href: "/", i18n: "nav.dashboard", icon: Home },
      { href: "/analitik", i18n: "nav.analytics", icon: BarChart3 },
    ],
  },
  {
    i18n: "nav.section.content",
    items: [
      { href: "/icerik", i18n: "nav.articles", icon: FileText },
      {
        href: "/ai-studyo",
        i18n: "nav.aiStudio",
        icon: Sparkles,
        badge: "AI",
      },
      { href: "/yorumlar", i18n: "nav.comments", icon: MessageSquare },
    ],
  },
  {
    i18n: "nav.section.marketing",
    items: [
      { href: "/newsletter", i18n: "nav.newsletter", icon: Mail },
      { href: "/raporlar", i18n: "nav.reports", icon: FileBarChart },
    ],
  },
  {
    i18n: "nav.section.community",
    items: [
      { href: "/ajans", i18n: "nav.agencies", icon: Building2 },
      { href: "/reviews", i18n: "nav.reviewModeration", icon: ShieldCheck },
      { href: "/is-ilanlari", i18n: "nav.jobs", icon: Briefcase },
      { href: "/akademi", i18n: "nav.academy", icon: GraduationCap },
      { href: "/etkinlikler", i18n: "nav.events", icon: Trophy },
    ],
  },
  {
    i18n: "nav.section.brandStudio",
    items: [
      {
        href: "/brand-portal/firmalar",
        i18n: "nav.brandAccounts",
        icon: Building2,
      },
      {
        href: "/brand-portal/kampanyalar",
        i18n: "nav.approvalQueue",
        icon: Megaphone,
        badge: "NEW",
      },
    ],
  },
  {
    i18n: "nav.section.commerce",
    items: [
      { href: "/premium", i18n: "nav.premium", icon: CreditCard },
      { href: "/kullanicilar", i18n: "nav.users", icon: Users },
    ],
  },
  {
    i18n: "nav.section.system",
    items: [
      { href: "/sayfalar", i18n: "nav.pages", icon: FileText },
      { href: "/denetim", i18n: "nav.auditLog", icon: ShieldCheck },
      { href: "/ayarlar", i18n: "nav.settings", icon: Settings },
    ],
  },
];

export async function Sidebar() {
  const t = await getTranslations();
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
      {/* Brand mark */}
      <div className="flex h-14 items-center gap-2.5 border-b px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 ring-1 ring-accent/30">
          <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-none">
          <Link
            href="/"
            className="font-display text-sm font-bold tracking-tight text-foreground"
          >
            MarkaRadar
          </Link>
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
            {t("app.adminBadge")}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 text-[13px]">
        {SECTIONS.map((section, sIdx) => (
          <div key={section.i18n} className={sIdx === 0 ? "" : "mt-5"}>
            <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              {t(section.i18n)}
            </div>
            <div className="space-y-0.5">
              {section.items.map(({ href, i18n, icon: Icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon
                    size={14}
                    strokeWidth={1.75}
                    className="text-muted-foreground/70 group-hover:text-accent"
                  />
                  <span className="flex-1">{t(i18n)}</span>
                  {badge && (
                    <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — version */}
      <div className="border-t px-5 py-3 text-[10px] font-mono text-muted-foreground/60">
        v0.1.0 · {new Date().getFullYear()}
      </div>
    </aside>
  );
}
