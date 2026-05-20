"use client";

import { useState } from "react";
import { Sparkles, Lock, AtSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/lib/i18n/client";
import { LocaleSwitch } from "@/components/locale/locale-switch";

export default function LoginPage() {
  const { t } = useTranslations();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsPending(true);

    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.message ?? "Giriş başarısız");
        setIsPending(false);
        return;
      }
      window.location.href = data.redirectTo ?? "/";
    } catch {
      setErrorMessage("Bağlantı hatası");
      setIsPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Mesh gradient blobs — Linear/Vercel style */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-32 h-[500px] w-[500px] rounded-full bg-brand-500/15 blur-[120px] dark:bg-brand-500/[0.08]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-40 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[120px] dark:bg-accent/[0.08]"
      />

      {/* Dot grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--foreground) / 0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />

      {/* Locale switch — sağ üst */}
      <div className="absolute right-4 top-4 z-10">
        <LocaleSwitch />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border bg-card/80 backdrop-blur">
            <div
              aria-hidden
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent"
            />
            <Sparkles
              className="relative h-6 w-6 text-accent"
              strokeWidth={2}
            />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground md:tracking-[-0.02em]">
            MarkaRadar
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Admin
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border bg-card/80 p-7 shadow-xl shadow-black/[0.04] backdrop-blur dark:shadow-black/30">
          <div className="mb-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {t("login.subtitle") || "Yönetim paneline giriş"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              E-posta ve şifrenle güvenli giriş yap
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t("login.email") || "E-posta"}
              </label>
              <div className="relative mt-2">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="h-11 pl-10"
                  placeholder="admin@markaradar.com"
                  disabled={isPending}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t("login.password") || "Şifre"}
              </label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="current-password"
                  className="h-11 pl-10"
                  placeholder="••••••••"
                  disabled={isPending}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50/80 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="mt-2 h-11 w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t("login.submitting") || "Giriş yapılıyor..."}
                </>
              ) : (
                <>
                  {t("login.submit") || "Giriş Yap"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-6 border-t pt-4">
            <p className="text-center text-xs text-muted-foreground">
              Sadece yetkili personel
            </p>
          </div>
        </div>

        {/* Bottom small print */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground/70">
          © {new Date().getFullYear()} MarkaRadar · Tüm hakları saklıdır
        </p>
      </div>
    </div>
  );
}
