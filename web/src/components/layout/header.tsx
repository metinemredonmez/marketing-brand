import Link from "next/link";
import { LogOut, ArrowRight, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/api/client";
import { logoutAction } from "@/app/actions/auth";
import { getTranslations } from "@/lib/i18n/server";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LocaleSwitch } from "@/components/locale/locale-switch";
import { CityClocks } from "./city-clocks";
import { MobileMenu } from "./mobile-menu";

export async function Header() {
  const user = await getCurrentUser();
  const t = await getTranslations();

  const navLinks = [
    { href: "/", label: t("marketing.nav.home") },
    { href: "/kategori/ai-marketing", label: t("marketing.nav.aiMarketing") },
    { href: "/kategori/marka-hamlesi", label: "Marka Hamlesi" },
    { href: "/ajans-rehberi", label: t("marketing.nav.agencyDirectory") },
    { href: "/akademi", label: t("marketing.nav.academy") },
    { href: "/premium", label: t("marketing.nav.premium") },
  ];

  const today = new Intl.DateTimeFormat(
    t.locale === "en" ? "en-US" : "tr-TR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(new Date());

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* ─── Utility strip — events + sign in */}
      <div className="border-b">
        <div className="container mx-auto flex h-9 items-center justify-between gap-3 px-4 text-xs">
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/etkinlikler"
              className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-0.5 font-medium text-foreground/80 hover:border-accent hover:text-foreground"
            >
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">
                {t("marketing.footer.about")
                  .toLowerCase()
                  .includes("about")
                  ? "Events"
                  : "Etkinlikler"}
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full border bg-amber-100/60 px-2.5 py-0.5 font-medium text-amber-900 hover:border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <Mail className="h-3 w-3" />
              <span className="hidden sm:inline">Newsletter</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LocaleSwitch />
            <ThemeToggle />
            {user ? (
              <span className="hidden text-foreground/70 md:inline">
                {user.fullName}
              </span>
            ) : (
              <Link
                href="/login"
                className="font-semibold uppercase tracking-widest text-foreground hover:text-accent"
              >
                {t("marketing.auth.login")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ─── Brand row — wordmark + clocks + tagline */}
      <div className="border-b">
        <div className="container relative mx-auto flex items-center justify-between gap-4 px-4 py-5">
          {/* Left clocks */}
          <CityClocks side="left" />

          {/* Center wordmark */}
          <Link
            href="/"
            className="flex flex-col items-center text-center"
            aria-label="MarkaRadar"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t("landing.hero.eyebrow")}
            </span>
            <span
              className="mt-0.5 font-display text-3xl font-bold leading-none tracking-tight text-foreground sm:text-4xl md:text-5xl"
              style={{ letterSpacing: "-0.04em" }}
            >
              MarkaRadar
            </span>
          </Link>

          {/* Right clocks */}
          <CityClocks side="right" />

          {/* Mobile menu — top right */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden">
            <MobileMenu
              links={navLinks}
              brandStudioLabel="Brand Studio"
              loginLabel={t("marketing.auth.login")}
              registerLabel={t("marketing.auth.register")}
              userName={user?.fullName}
              onLogout={
                user ? (
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" /> {t("marketing.auth.logout")}
                    </button>
                  </form>
                ) : null
              }
            />
          </div>
        </div>
      </div>

      {/* ─── Nav row — date + nav + brand studio */}
      <div className="hidden md:block">
        <div className="container mx-auto flex h-12 items-center gap-6 px-4 text-sm">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {today}
          </span>

          <nav className="flex flex-1 items-center gap-5 overflow-x-auto">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="whitespace-nowrap font-medium text-foreground/80 hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 border-l pl-5">
            <Link
              href="/reklam-ver"
              className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
            >
              Brand Studio <ArrowRight className="h-3 w-3" />
            </Link>
            {user ? (
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut size={14} />
                </Button>
              </form>
            ) : (
              <Button asChild size="sm">
                <Link href="/register">{t("marketing.auth.register")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
