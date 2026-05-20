import { LogOut, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LocaleSwitch } from "@/components/locale/locale-switch";
import { getTranslations } from "@/lib/i18n/server";

export async function Topbar({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName: string;
}) {
  const t = await getTranslations();
  // Avatar baş harfleri
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-card/80 px-5 backdrop-blur">
      {/* Sol — Search */}
      <div className="relative max-w-md flex-1">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
        />
        <input
          type="search"
          placeholder={t("common.search") + " — ⌘K"}
          className="h-9 w-full rounded-lg border bg-background/50 pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {/* Sağ */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Bildirimler"
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell size={15} strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>
        <LocaleSwitch />
        <ThemeToggle />

        <div className="mx-2 h-6 w-px bg-border" />

        {/* User chip */}
        <div className="flex items-center gap-2.5 rounded-full border bg-card pl-1 pr-3 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 text-[11px] font-bold text-accent ring-1 ring-accent/30">
            {initials || "MR"}
          </div>
          <div className="hidden text-left leading-tight md:block">
            <div className="text-xs font-semibold text-foreground">
              {userName}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {userEmail}
            </div>
          </div>
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="h-9 px-2.5 text-muted-foreground hover:text-foreground"
            title={t("common.logout")}
          >
            <LogOut size={13} strokeWidth={1.75} />
            <span className="hidden md:inline">{t("common.logout")}</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
