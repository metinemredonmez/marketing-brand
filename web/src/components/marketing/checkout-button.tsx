"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { startCheckout, type CheckoutResult } from "@/app/actions/checkout";

export function CheckoutButton({
  tier,
  billingInterval = "yearly",
  provider = "stripe",
  variant = "default",
  children,
}: {
  tier: string;
  billingInterval?: "monthly" | "yearly";
  provider?: "stripe" | "iyzico";
  variant?: "default" | "accent" | "outline";
  children: React.ReactNode;
}) {
  const [state, formAction, isPending] = useActionState<
    CheckoutResult | null,
    FormData
  >(startCheckout, null);

  useEffect(() => {
    if (state?.ok && state.checkoutUrl) {
      window.location.href = state.checkoutUrl;
    }
  }, [state]);

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="tier" value={tier} />
      <input type="hidden" name="billingInterval" value={billingInterval} />
      <input type="hidden" name="provider" value={provider} />
      <Button
        type="submit"
        variant={variant}
        size="lg"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Yönlendiriliyor..." : children}
      </Button>
      {state && !state.ok && (
        <p className="mt-2 text-xs text-red-600">{state.message}</p>
      )}
    </form>
  );
}
