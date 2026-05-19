"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toaster";
import { createPageContent } from "@/app/actions/page-contents";

export default function NewPageContentPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    slug: "",
    locale: "tr",
    title: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      toast.error("Slug yalnızca harf-rakam-tire içermeli");
      return;
    }
    startTransition(async () => {
      const res = await createPageContent({
        slug: form.slug,
        locale: form.locale,
        title: form.title || undefined,
        blocks: [
          {
            type: "hero",
            eyebrow: "Yeni sayfa",
            title: form.title || form.slug,
            subtitle: "Buradan düzenle...",
          },
        ],
        isPublished: false,
      });
      if (res.ok) {
        toast.success("Oluşturuldu");
        const d = res.data as { id?: string };
        router.push(d.id ? `/sayfalar/${d.id}` : "/sayfalar");
      } else {
        toast.error(res.message ?? "Hata");
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/sayfalar"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Sayfalar
      </Link>

      <header className="mt-4 mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <FileText size={24} /> Yeni sayfa
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Slug + dil seç. Block editörü açılınca içeriği düzenle.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <div>
            <Label>Slug *</Label>
            <Input
              value={form.slug}
              onChange={(e) =>
                setForm({ ...form, slug: e.target.value.toLowerCase() })
              }
              required
              className="mt-1.5 font-mono"
              placeholder="hakkimizda"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              URL içinde kullanılır. Sadece a-z, 0-9, tire.
            </p>
          </div>
          <div>
            <Label>Dil *</Label>
            <select
              value={form.locale}
              onChange={(e) => setForm({ ...form, locale: e.target.value })}
              className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <Label>Başlık (opsiyonel)</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1.5"
              placeholder="Hakkımızda"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button asChild variant="outline" type="button">
            <Link href="/sayfalar">İptal</Link>
          </Button>
          <Button type="submit" disabled={isPending} variant="accent">
            <Save size={15} /> {isPending ? "Oluşturuluyor..." : "Oluştur"}
          </Button>
        </div>
      </form>
    </div>
  );
}
