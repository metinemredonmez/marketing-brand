"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

/**
 * Server-rendered <Sidebar /> aside'ını mobilde drawer'a çevirir.
 * Server sidebar (i18n + auth gerektiriyor) prop olarak alınır.
 */
export function SidebarMobile({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Route değişince drawer'ı kapat
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Esc ile kapat
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger — sadece mobilde */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card text-foreground shadow-sm md:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Drawer + backdrop — sadece mobilde */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85vw] shrink-0 overflow-y-auto border-r bg-surface shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            {/* Server sidebar — md:block override */}
            <div className="[&>aside]:!block [&>aside]:!w-full [&>aside]:!border-r-0">
              {children}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
