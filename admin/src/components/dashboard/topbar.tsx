import { LogOut, Search } from "lucide-react";
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
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-6">
      <div className="relative w-80 max-w-full">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          placeholder={t("common.search")}
          className="w-full rounded-md border bg-muted py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex items-center gap-3">
        <LocaleSwitch />
        <ThemeToggle />
        <div className="text-right">
          <div className="text-sm font-medium text-foreground">{userName}</div>
          <div className="text-xs text-muted-foreground">{userEmail}</div>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut size={14} /> {t("common.logout")}
          </Button>
        </form>
      </div>
    </header>
  );
}
