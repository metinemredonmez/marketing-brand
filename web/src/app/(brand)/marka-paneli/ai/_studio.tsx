"use client";

import { useState, useTransition } from "react";
import { Sparkles, Save, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  generateBrandContentAction,
  saveCreativeAction,
} from "@/app/actions/brand";

type FieldDef = { key: string; label: string; multiline?: boolean; hint?: string };

interface PromptType {
  type: string;
  label: string;
  description: string;
  creativeType:
    | "linkedin_post"
    | "sponsored_article"
    | "banner"
    | "newsletter_blurb"
    | "reels_script";
  fields: FieldDef[];
}

const TYPES: PromptType[] = [
  {
    type: "product_launch_post",
    label: "Ürün Lansman Postu (LinkedIn)",
    description:
      "Yeni ürün için LinkedIn formatlı, 800-1300 karakter, CTA + hashtag içeren post.",
    creativeType: "linkedin_post",
    fields: [
      { key: "product_name", label: "Ürün adı" },
      {
        key: "product_description",
        label: "Ürün açıklaması",
        multiline: true,
      },
      { key: "key_benefits", label: "Ana faydalar (virgülle)", multiline: true },
      { key: "target_audience", label: "Hedef kitle" },
      { key: "cta", label: "CTA (örn. Demo iste)" },
    ],
  },
  {
    type: "brand_story_article",
    label: "Marka Hamlesi (Sponsor Makale)",
    description:
      "2000 kelimelik 'Marka Hamlesi' formatında editöryel sponsor makale.",
    creativeType: "sponsored_article",
    fields: [
      { key: "story_topic", label: "Hikaye konusu", multiline: true },
      { key: "key_data", label: "Anahtar veriler", multiline: true },
      { key: "target_outcome", label: "Hedef çıktı" },
    ],
  },
  {
    type: "banner_creative_brief",
    label: "Banner Görsel Brief (DALL·E)",
    description:
      "Banner reklam görseli için AI prompt + ALT text + headline önerisi.",
    creativeType: "banner",
    fields: [
      { key: "campaign_message", label: "Kampanya mesajı", multiline: true },
      {
        key: "brand_colors",
        label: "Marka renkleri (hex)",
        hint: "#0A2540, #FF6B35",
      },
      {
        key: "placement",
        label: "Banner placement",
        hint: "homepage_top / sidebar_sticky / article_inline",
      },
    ],
  },
  {
    type: "newsletter_blurb",
    label: "Newsletter Sponsor Blurb (80 kelime)",
    description:
      "MarkaRadar 'Pazarlama 5' newsletter'ında çıkacak 80 kelimelik sponsor metin.",
    creativeType: "newsletter_blurb",
    fields: [
      { key: "product_name", label: "Ürün/hizmet adı" },
      { key: "key_benefit", label: "Ana fayda" },
      { key: "cta_url", label: "CTA URL" },
    ],
  },
  {
    type: "reels_brand_script",
    label: "Reels/TikTok Script (30sn)",
    description:
      "30 saniyelik short-form video script — sahne sahne, voiceover dahil.",
    creativeType: "reels_script",
    fields: [
      { key: "product_name", label: "Ürün adı" },
      { key: "key_message", label: "Ana mesaj" },
      { key: "target_audience", label: "Hedef kitle" },
    ],
  },
  {
    type: "case_study",
    label: "Case Study (Effie/Cannes formatı)",
    description:
      "Vaka analizi: challenge → insight → solution → execution → results.",
    creativeType: "sponsored_article",
    fields: [
      { key: "timeline", label: "Süreç (örn. 6 ay)" },
      { key: "challenge", label: "Sorun", multiline: true },
      { key: "solution", label: "Uygulanan çözüm", multiline: true },
      { key: "results", label: "Sayısal sonuçlar", multiline: true },
    ],
  },
  {
    type: "competitor_diff_angle",
    label: "Rakipten Fark Açısı",
    description:
      "Pazarda rakiplerden farklılaşma açısı önerileri — somut, karalamasız.",
    creativeType: "linkedin_post",
    fields: [
      { key: "product_name", label: "Ürün adı" },
      {
        key: "competitors_text",
        label: "Rakipler hakkında bilgi",
        multiline: true,
      },
    ],
  },
  {
    type: "target_audience_brief",
    label: "Hedef Kitle Analizi",
    description:
      "MarkaRadar kitlesinde hangi CMO/segmente reach edilecek analizi.",
    creativeType: "linkedin_post",
    fields: [
      { key: "product_name", label: "Ürün adı" },
      { key: "target_segment", label: "Hedef segment" },
    ],
  },
];

export function AiStudio({
  brandAccountId,
  brandName,
}: {
  brandAccountId: string;
  brandName: string;
}) {
  const [selected, setSelected] = useState<PromptType>(TYPES[0]);
  const [vars, setVars] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<{
    generationId: string;
    output: Record<string, unknown>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [creativeName, setCreativeName] = useState("");
  const [clickUrl, setClickUrl] = useState("");
  const [isGenerating, startGenerate] = useTransition();
  const [isSaving, startSave] = useTransition();

  function selectType(t: PromptType) {
    setSelected(t);
    setVars({});
    setOutput(null);
    setError(null);
    setSaveMsg(null);
  }

  function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaveMsg(null);
    startGenerate(async () => {
      const result = await generateBrandContentAction(
        brandAccountId,
        selected.type,
        { ...vars, brand_name: brandName },
      );
      if (!result.ok) {
        setError(result.message ?? "Üretim başarısız");
        return;
      }
      setOutput(result.data ?? null);
      const suggested =
        (result.data?.output as { title?: string; post_text?: string })
          ?.title ??
        (result.data?.output as { post_text?: string })?.post_text?.slice(
          0,
          60,
        ) ??
        `${selected.label} - ${new Date().toLocaleDateString("tr-TR")}`;
      setCreativeName(suggested);
    });
  }

  function onSave() {
    if (!output) return;
    setSaveMsg(null);
    startSave(async () => {
      const result = await saveCreativeAction(brandAccountId, {
        type: selected.creativeType,
        name: creativeName || selected.label,
        content: output.output,
        aiGenerationId: output.generationId,
        clickUrl: clickUrl || undefined,
      });
      if (!result.ok) {
        setSaveMsg(result.message ?? "Kayıt başarısız");
        return;
      }
      setSaveMsg("Creative kaydedildi (Kampanyalar > Yeni'den yayınlayabilirsin)");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sol: prompt tipi seçim */}
      <aside className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          İçerik türü
        </div>
        {TYPES.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => selectType(t)}
            className={`flex w-full flex-col items-start rounded-lg border p-3 text-left text-sm transition-colors ${
              selected.type === t.type
                ? "border-accent bg-accent/5"
                : "border-border bg-card hover:border-border"
            }`}
          >
            <span className="font-semibold text-foreground">{t.label}</span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              {t.description}
            </span>
          </button>
        ))}
      </aside>

      {/* Sağ: form + output */}
      <div className="space-y-6">
        <Card className="p-5">
          <form onSubmit={onGenerate} className="space-y-4">
            <div className="text-sm font-semibold text-foreground">
              {selected.label}
            </div>
            {selected.fields.map((f) => (
              <div key={f.key}>
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.multiline ? (
                  <Textarea
                    id={f.key}
                    rows={3}
                    required
                    className="mt-1.5"
                    placeholder={f.hint}
                    value={vars[f.key] ?? ""}
                    onChange={(e) =>
                      setVars({ ...vars, [f.key]: e.target.value })
                    }
                  />
                ) : (
                  <Input
                    id={f.key}
                    required
                    className="mt-1.5"
                    placeholder={f.hint}
                    value={vars[f.key] ?? ""}
                    onChange={(e) =>
                      setVars({ ...vars, [f.key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Üretiyor...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> İçeriği üret
                </>
              )}
            </Button>
          </form>
        </Card>

        {output && (
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Wand2 className="h-4 w-4 text-accent" /> Çıktı
              </div>
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {output.generationId.slice(0, 8)}
              </span>
            </div>

            <div className="mt-4 space-y-3 rounded-lg border bg-muted p-4 font-mono text-xs">
              <RenderOutput output={output.output} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="creative-name">Creative adı</Label>
                <Input
                  id="creative-name"
                  className="mt-1.5"
                  value={creativeName}
                  onChange={(e) => setCreativeName(e.target.value)}
                  placeholder="Kütüphanede görünecek isim"
                />
              </div>
              <div>
                <Label htmlFor="click-url">Tıklama URL'si (opsiyonel)</Label>
                <Input
                  id="click-url"
                  type="url"
                  className="mt-1.5"
                  value={clickUrl}
                  onChange={(e) => setClickUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Kütüphaneye kaydet
              </Button>
              {saveMsg && (
                <span className="text-xs text-emerald-700">{saveMsg}</span>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function RenderOutput({ output }: { output: Record<string, unknown> }) {
  return (
    <>
      {Object.entries(output).map(([k, v]) => (
        <div key={k}>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {k}
          </div>
          <div className="whitespace-pre-wrap text-foreground">
            {typeof v === "string" ? v : JSON.stringify(v, null, 2)}
          </div>
        </div>
      ))}
    </>
  );
}
