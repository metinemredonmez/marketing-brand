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
    <aside className="hidden w-64 shrink-0 border-r bg-surface md:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/"
          className="font-bold text-foreground dark:text-foreground"
        >
          MarkaRadar
        </Link>
        <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {t("app.adminBadge")}
        </span>
      </div>

      <nav className="p-3 text-sm">
        {SECTIONS.map((section) => (
          <div key={section.i18n} className="mb-4">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t(section.i18n)}
            </div>
            <div className="space-y-0.5">
              {section.items.map(({ href, i18n, icon: Icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-2.5 rounded-md px-3 py-2 text-foreground/80 hover:bg-background hover:text-foreground"
                >
                  <Icon size={15} />
                  <span className="flex-1">{t(i18n)}</span>
                  {badge && (
                    <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
