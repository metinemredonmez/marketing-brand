import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ArticlePaywall({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <div className="relative mt-8 overflow-hidden rounded-xl border-2 border-brand-500 bg-gradient-to-br from-brand-50 via-white to-brand-50 p-8 shadow-lg">
      <div className="pointer-events-none absolute -top-12 -right-8 size-32 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative">
        <Badge variant="accent" className="mb-3">
          <Sparkles size={12} className="mr-1" /> MarkaRadar+ Premium
        </Badge>
        <h3 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Lock size={22} /> Devamını okumak için premium üye ol
        </h3>
        <p className="mt-2 max-w-2xl text-foreground/80">
          Bu yazının geri kalanı, "markalar için çıkarım" + "ajanslar için
          çıkarım" + AI'nın stratejik analizi MarkaRadar+ Pro üyelerine özel.
        </p>

        <ul className="mt-4 grid gap-2 text-sm text-foreground/80 md:grid-cols-2">
          <li className="flex items-center gap-2">
            <span className="text-brand-500">✓</span> Haftalık deep dive analiz
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand-500">✓</span> CMO Club Slack erişimi
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand-500">✓</span> Türkiye Pazarlama Endeksi
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand-500">✓</span> Reklamsız okuma
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="accent" size="lg">
            <Link href="/premium">Tarifeleri Gör</Link>
          </Button>
          {!isAuthenticated && (
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Zaten üyeyim → Giriş</Link>
            </Button>
          )}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Founding Member fiyatı sadece ilk 200 üye için: $49/yıl lifetime
          fiyat kilidi.
        </p>
      </div>
    </div>
  );
}
