"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

export function MobileMenu({
  links,
  brandStudioLabel,
  loginLabel,
  registerLabel,
  userName,
  onLogout,
}: {
  links: NavLink[];
  brandStudioLabel: string;
  loginLabel: string;
  registerLabel: string;
  userName?: string;
  onLogout?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-l bg-card p-5 shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="self-end rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <nav className="mt-4 flex flex-col gap-1 text-sm">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-3 py-2 font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/reklam-ver"
                className="mt-2 rounded-md bg-accent/10 px-3 py-2 font-semibold text-accent hover:bg-accent/15"
              >
                {brandStudioLabel} →
              </Link>
            </nav>

            <div className="mt-auto space-y-2 border-t pt-4">
              {userName ? (
                <>
                  <div className="px-3 py-2 text-sm text-foreground">
                    {userName}
                  </div>
                  {onLogout}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block rounded-md border px-3 py-2 text-center text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {loginLabel}
                  </Link>
                  <Link
                    href="/register"
                    className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {registerLabel}
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
