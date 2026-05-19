"use client";

import { Cookie } from "lucide-react";
import { openCookieBanner } from "./cookie-banner";

export function CookiePrefsButton() {
  return (
    <button
      type="button"
      onClick={openCookieBanner}
      className="inline-flex items-center gap-1 text-left hover:text-foreground"
    >
      <Cookie className="h-3 w-3" />
      Çerez tercihleri
    </button>
  );
}
