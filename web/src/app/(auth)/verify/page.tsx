import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = await getTranslations();

  let success = false;
  let message = t("auth.verify.failed");
  if (token) {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
      });
      const body = await res.json();
      success = res.ok;
      message = success
        ? t("auth.verify.success")
        : body.message ?? t("auth.verify.failed");
    } catch {
      message = t("auth.verify.failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <Link href="/" className="text-lg font-bold text-foreground">
          MarkaRadar
        </Link>
        <div className="mt-6">
          {success ? (
            <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
          ) : (
            <AlertCircle size={48} className="mx-auto text-amber-500" />
          )}
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground">
          {success ? t("auth.verify.success") : t("auth.verify.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button asChild className="mt-6" size="lg">
          <Link href={success ? "/" : "/login"}>
            {success
              ? t("marketing.nav.home")
              : t("auth.verify.goLogin")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
