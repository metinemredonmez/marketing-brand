"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      richColors
      closeButton
      theme="light"
      toastOptions={{
        classNames: {
          toast:
            "group rounded-md border border-slate-200 bg-white p-4 shadow-md",
        },
      }}
    />
  );
}

export { toast } from "sonner";
