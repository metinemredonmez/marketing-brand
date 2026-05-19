import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-muted-foreground">
        <SearchX className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <h1 className="mt-4 text-4xl font-extrabold text-foreground">
        Sayfa bulunamadı
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Aradığın sayfa kaybolmuş — belki taşındı, belki silindi. Ana sayfadan
        yeniden başlayabilirsin.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">Ana sayfa</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/ajans-rehberi">Ajans rehberi</Link>
        </Button>
      </div>
    </div>
  );
}
