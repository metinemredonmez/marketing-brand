"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cookie,
  ShieldCheck,
  BarChart3,
  Megaphone,
  X,
  Settings2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ──────────────────────────────────────────────────
// Çerez consent yönetimi — KVKK + GDPR uyumlu
// 3 kategori: necessary (her zaman açık) / analytics / marketing
// Storage: `mr_consent` cookie, 12 ay
// ──────────────────────────────────────────────────

export interface ConsentState {
  necessary: true; // her zaman
  analytics: boolean;
  marketing: boolean;
  consentedAt: string; // ISO date
}

const COOKIE_NAME = "mr_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 yıl

function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)"),
  );
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[2]));
  } catch {
    return null;
  }
}

function writeConsent(state: Omit<ConsentState, "consentedAt">) {
  const payload: ConsentState = {
    ...state,
    necessary: true,
    consentedAt: new Date().toISOString(),
  };
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(payload),
  )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  // Diğer client component'ler bilebilsin
  window.dispatchEvent(
    new CustomEvent("mr-consent-change", { detail: payload }),
  );
}

/** Bayer banner'ı yeniden açma — footer'dan "Çerez tercihleri" linki için */
export function openCookieBanner() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("mr-consent-reopen"));
}

/** Diğer kodlar consent durumunu okuyabilsin */
export function getConsent(): ConsentState | null {
  return readConsent();
}

// ──────────────────────────────────────────────────
// Banner UI
// ──────────────────────────────────────────────────

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  // İlk açılışta consent yoksa banner'ı göster
  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setOpen(true);
    } else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
    const reopen = () => setOpen(true);
    window.addEventListener("mr-consent-reopen", reopen);
    return () => window.removeEventListener("mr-consent-reopen", reopen);
  }, []);

  if (!open) return null;

  const acceptAll = () => {
    writeConsent({ necessary: true, analytics: true, marketing: true });
    setOpen(false);
  };
  const acceptNecessary = () => {
    writeConsent({ necessary: true, analytics: false, marketing: false });
    setOpen(false);
  };
  const savePrefs = () => {
    writeConsent({ necessary: true, analytics, marketing });
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Çerez tercihleri"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl animate-fade-up rounded-2xl border bg-card/95 shadow-2xl backdrop-blur-md md:bottom-6 md:left-1/2 md:-translate-x-1/2"
    >
      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/30">
            <Cookie className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold tracking-tight text-foreground">
              Çerez tercihleri
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Zorunlu çerezler her zaman aktif. Analitik ve pazarlama çerezleri
              için tercihini belirleyebilirsin.{" "}
              <Link
                href="/cerez"
                className="underline hover:text-foreground"
              >
                Çerez politikası
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={acceptNecessary}
            aria-label="Kapat"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Expanded categories */}
        {expanded && (
          <div className="mt-5 space-y-3 border-t pt-5">
            <CategoryRow
              icon={ShieldCheck}
              title="Zorunlu çerezler"
              desc="Oturum, CSRF koruma, dil tercihi. Site çalışması için şart."
              checked={true}
              disabled
            />
            <CategoryRow
              icon={BarChart3}
              title="Analitik (anonim)"
              desc="Plausible. Cookieless, kullanıcı kimliği tutulmaz."
              checked={analytics}
              onChange={setAnalytics}
            />
            <CategoryRow
              icon={Megaphone}
              title="Pazarlama"
              desc="Reklam performansı ve kişiselleştirme. Şu an kullanılmıyor."
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        )}

        {/* Action row */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          {!expanded ? (
            <>
              <Button
                variant="accent"
                onClick={acceptAll}
                className="sm:flex-1"
              >
                <Check className="h-4 w-4" /> Tümünü kabul et
              </Button>
              <Button
                variant="outline"
                onClick={acceptNecessary}
                className="sm:flex-1"
              >
                Sadece zorunlu
              </Button>
              <Button
                variant="ghost"
                onClick={() => setExpanded(true)}
                size="sm"
                className="sm:flex-none"
              >
                <Settings2 className="h-3.5 w-3.5" /> Ayarla
              </Button>
            </>
          ) : (
            <>
              <Button variant="accent" onClick={savePrefs} className="sm:flex-1">
                <Check className="h-4 w-4" /> Tercihleri kaydet
              </Button>
              <Button
                variant="outline"
                onClick={acceptAll}
                className="sm:flex-none"
              >
                Tümünü kabul et
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(false)}
              >
                Geri
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  icon: Icon,
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground/70">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {/* Toggle */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            role="switch"
            aria-checked={checked}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
              checked ? "bg-accent" : "bg-muted"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                checked ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {desc}
        </p>
      </div>
    </div>
  );
}
