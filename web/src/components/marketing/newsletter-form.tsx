"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  subscribeToNewsletter,
  type NewsletterFormState,
} from "@/app/actions/newsletter";

export function NewsletterForm({
  source = "homepage",
  variant = "default",
}: {
  source?: string;
  variant?: "default" | "inverse";
}) {
  const [state, formAction, isPending] = useActionState<
    NewsletterFormState | null,
    FormData
  >(subscribeToNewsletter, null);

  const isLight = variant === "inverse";

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="source" value={source} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Input
          type="email"
          name="email"
          required
          placeholder="E-postan"
          disabled={isPending}
          className={
            isLight
              ? "h-12 flex-1 border-0 bg-card text-foreground"
              : "h-12 flex-1"
          }
          aria-label="E-posta adresin"
        />
        <Button
          type="submit"
          size="lg"
          variant="accent"
          disabled={isPending}
          className="h-12"
        >
          {isPending ? "Gönderiliyor..." : "Abone Ol"}
        </Button>
      </div>
      {state?.message && (
        <p
          className={`mt-2 text-sm ${
            state.ok
              ? isLight
                ? "text-emerald-300"
                : "text-emerald-700"
              : isLight
                ? "text-red-200"
                : "text-red-600"
          }`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
      <p
        className={`mt-2 text-xs ${
          isLight ? "text-brand-100" : "text-muted-foreground"
        }`}
      >
        Her sabah 08:30 — 5 dakikada okunan günlük "Pazarlama 5". KVKK uyumlu.
      </p>
    </form>
  );
}
