"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TiptapEditor } from "./tiptap-editor";
import {
  createArticle,
  updateArticle,
  publishArticle,
  type ArticleInput,
} from "@/app/actions/articles";

interface Props {
  initial?: Partial<ArticleInput> & { id?: string; slug?: string };
}

export function ArticleForm({ initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [spot, setSpot] = useState(initial?.spot ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [isPremium, setIsPremium] = useState(initial?.isPremium ?? false);
  const [isSponsored, setIsSponsored] = useState(
    initial?.isSponsored ?? false,
  );
  const [aiSummary, setAiSummary] = useState(initial?.aiSummary ?? "");
  const [aiWhyMatters, setAiWhyMatters] = useState(
    initial?.aiWhyMatters ?? "",
  );

  const save = (publish = false) => {
    setError(null);
    if (title.length < 5) {
      setError("Başlık en az 5 karakter olmalı");
      return;
    }
    if (body.length < 50) {
      setError("İçerik en az 50 karakter olmalı");
      return;
    }

    const input: ArticleInput = {
      title,
      spot,
      body,
      coverUrl: coverUrl || undefined,
      isPremium,
      isSponsored,
      aiSummary: aiSummary || undefined,
      aiWhyMatters: aiWhyMatters || undefined,
      status: publish ? "published" : "draft",
    };

    startTransition(async () => {
      const res = initial?.id
        ? await updateArticle(initial.id, input)
        : await createArticle(input);

      if (!res.ok) {
        setError(res.message ?? "Kayıt başarısız");
        return;
      }

      if (publish && res.data?.id && !initial?.id) {
        await publishArticle(res.data.id);
      }

      router.push("/icerik");
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Başlık + spot */}
      <div className="rounded-xl border bg-card p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              className="mt-1.5"
              placeholder="Türkiye'de AI marketing trendi: 5 marka analizi"
            />
            <div className="mt-1 text-xs text-muted-foreground">
              {title.length} / 200 karakter
            </div>
          </div>

          <div>
            <Label htmlFor="spot">Spot (200-280 karakter)</Label>
            <Textarea
              id="spot"
              value={spot}
              onChange={(e) => setSpot(e.target.value)}
              maxLength={320}
              rows={2}
              className="mt-1.5"
              placeholder="Hem sosyal medya hem meta description olarak kullanılır"
            />
            <div className="mt-1 text-xs text-muted-foreground">
              {spot.length} / 320 karakter
            </div>
          </div>

          <div>
            <Label htmlFor="cover">Kapak görseli URL'i</Label>
            <Input
              id="cover"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="mt-1.5"
              placeholder="https://media.markaradar.com/articles/cover/..."
            />
          </div>
        </div>
      </div>

      {/* Ana içerik */}
      <div className="rounded-xl border bg-card p-6">
        <Label>İçerik *</Label>
        <div className="mt-2">
          <TiptapEditor value={body} onChange={setBody} />
        </div>
      </div>

      {/* AI alanları */}
      <div className="rounded-xl border bg-brand-50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-brand-500" />
          <h3 className="font-bold text-foreground">AI Üretim Alanları</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ai-summary">AI Özet (3 madde, 250 kelime)</Label>
            <Textarea
              id="ai-summary"
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              rows={3}
              className="mt-1.5 bg-card"
            />
          </div>

          <div>
            <Label htmlFor="ai-why">Neden önemli?</Label>
            <Textarea
              id="ai-why"
              value={aiWhyMatters}
              onChange={(e) => setAiWhyMatters(e.target.value)}
              rows={2}
              className="mt-1.5 bg-card"
            />
          </div>
        </div>
      </div>

      {/* Flag'ler */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="size-4"
            />
            <Badge variant="accent">Premium</Badge>
            <span className="text-muted-foreground">
              Sadece MarkaRadar+ üyelere açık
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isSponsored}
              onChange={(e) => setIsSponsored(e.target.checked)}
              className="size-4"
            />
            <Badge variant="warning">Sponsorlu</Badge>
            <span className="text-muted-foreground">
              Açıkça "Sponsorlu" etiketi gösterilir
            </span>
          </label>
        </div>
      </div>

      {/* Action bar */}
      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-2 border-t bg-card px-6 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => save(false)}
          disabled={isPending}
        >
          <Save size={16} /> Taslak kaydet
        </Button>
        <Button
          type="button"
          onClick={() => save(true)}
          disabled={isPending}
        >
          <Send size={16} />
          {isPending ? "Yayınlanıyor..." : "Yayınla"}
        </Button>
      </div>
    </div>
  );
}
