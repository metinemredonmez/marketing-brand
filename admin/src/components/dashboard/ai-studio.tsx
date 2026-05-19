"use client";

import { useState, useTransition } from "react";
import { Sparkles, Copy, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { generateAll } from "@/app/actions/ai";

interface FormatOutput {
  type: string;
  data: unknown;
  costUsd: number;
  durationMs: number;
  model: string;
  provider: string;
  cached: boolean;
}

const FORMAT_TITLES: Record<string, { title: string; emoji: string }> = {
  title: { title: "Başlık (5 varyant)", emoji: "📰" },
  spot: { title: "Spot (3 varyant)", emoji: "✍️" },
  body: { title: "Haber gövdesi", emoji: "📄" },
  ai_summary: { title: "AI Özet + Çıkarımlar", emoji: "🧠" },
  linkedin_post: { title: "LinkedIn postu", emoji: "💼" },
  instagram_carousel: { title: "Instagram carousel (7 slayt)", emoji: "📸" },
  reels_script: { title: "Reels script (30s)", emoji: "🎬" },
  seo_meta: { title: "SEO meta", emoji: "🔍" },
  cover_image_prompt: { title: "Kapak görseli prompt", emoji: "🎨" },
};

export function AiStudio() {
  const [source, setSource] = useState("");
  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");
  const [results, setResults] = useState<Record<string, FormatOutput> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [totalCost, setTotalCost] = useState(0);

  const handleGenerate = () => {
    if (source.trim().length < 100) {
      setError("Kaynak metin en az 100 karakter olmalı");
      return;
    }
    setError(null);
    setResults(null);

    startTransition(async () => {
      const res = await generateAll(source, provider);
      if (!res.ok) {
        setError(res.message ?? "Hata");
        return;
      }
      const data = res.data as Record<string, FormatOutput>;
      setResults(data);
      const cost = Object.values(data).reduce<number>(
        (sum, r) => sum + (r.costUsd ?? 0),
        0,
      );
      setTotalCost(cost);
    });
  };

  return (
    <div className="space-y-6">
      {/* Kaynak girişi */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Kaynak metin</h2>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="provider" className="text-muted-foreground">
              Provider:
            </label>
            <select
              id="provider"
              value={provider}
              onChange={(e) =>
                setProvider(e.target.value as "openai" | "anthropic")
              }
              className="h-9 rounded-md border bg-card px-3 text-sm"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
        </div>

        <Textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={10}
          placeholder="Kaynak haberini yapıştır veya URL'den çekilmiş metni yapıştır. AI bundan 8 format üretecek..."
          className="mt-4 text-sm"
          disabled={isPending}
        />

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {source.length} karakter · {Math.ceil(source.split(/\s+/).length)} kelime
          </div>
          <Button onClick={handleGenerate} disabled={isPending} size="lg">
            <Sparkles size={16} />
            {isPending ? "8 format üretiliyor..." : "AI ile üret"}
          </Button>
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Sonuçlar */}
      {results && (
        <>
          <div className="rounded-xl border bg-emerald-50 p-4 text-sm dark:bg-emerald-950/40">
            <div className="flex items-center justify-between">
              <span className="font-medium text-emerald-900 dark:text-emerald-200">
                ✓ 8 format üretildi
              </span>
              <span className="text-emerald-700">
                Toplam: ${totalCost.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(results).map(([key, output]) => (
              <FormatCard key={key} formatKey={key} output={output} />
            ))}
          </div>

          <div className="rounded-xl border bg-brand-50 p-6">
            <h3 className="text-lg font-bold text-foreground">
              Makaleye kaydet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Bu üretimi düzenleyip yeni bir makale taslağına dönüştür.
            </p>
            <div className="mt-4">
              <Button asChild size="lg">
                <a
                  href={`/icerik/yeni?ai_data=${encodeURIComponent(JSON.stringify(results))}`}
                >
                  <Save size={16} /> Makale taslağı oluştur
                </a>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FormatCard({
  formatKey,
  output,
}: {
  formatKey: string;
  output: FormatOutput;
}) {
  const meta = FORMAT_TITLES[formatKey] ?? { title: formatKey, emoji: "🤖" };
  const display = JSON.stringify(output.data, null, 2);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-foreground">
          {meta.emoji} {meta.title}
        </h3>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={output.cached ? "warning" : "secondary"}>
            {output.cached ? "Cache" : output.model}
          </Badge>
          <span className="text-xs text-muted-foreground">
            ${output.costUsd.toFixed(4)} · {output.durationMs}ms
          </span>
        </div>
      </div>

      <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">
        {display}
      </pre>

      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(display);
          }}
        >
          <Copy size={12} /> Kopyala
        </Button>
      </div>
    </div>
  );
}
