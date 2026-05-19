"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Type,
  LayoutGrid,
  MessageSquareQuote,
  AlignLeft,
  Megaphone,
  GripVertical,
  Repeat,
  LayoutDashboard,
  PanelsTopLeft,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { updatePageContent } from "@/app/actions/page-contents";

// ──────────────────────────────────────────────────
// Block tipleri ve template'leri
// ──────────────────────────────────────────────────
type BlockType =
  | "hero"
  | "feature-grid"
  | "faq"
  | "text"
  | "cta-banner"
  | "marquee"
  | "bento"
  | "audience-tabs"
  | "stats";

interface HeroBlock {
  type: "hero";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}
interface FeatureItem {
  icon?: string;
  title?: string;
  desc?: string;
}
interface FeatureGridBlock {
  type: "feature-grid";
  heading?: string;
  items: FeatureItem[];
}
interface FaqItem {
  q?: string;
  a?: string;
}
interface FaqBlock {
  type: "faq";
  title?: string;
  items: FaqItem[];
}
interface TextBlock {
  type: "text";
  html?: string;
}
interface CtaBlock {
  type: "cta-banner";
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}
interface MarqueeBlock {
  type: "marquee";
  label?: string;
  items: string[];
}
interface BentoItem {
  icon?: string;
  eyebrow?: string;
  title?: string;
  desc?: string;
  cta?: string;
  href?: string;
  accent?: boolean;
}
interface BentoBlockType {
  type: "bento";
  eyebrow?: string;
  heading?: string;
  subtitle?: string;
  items: BentoItem[];
}
interface AudienceTab {
  value?: string;
  label?: string;
  features: Array<{ icon?: string; title?: string; desc?: string }>;
}
interface AudienceTabsBlock {
  type: "audience-tabs";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tabs: AudienceTab[];
}
interface StatItem {
  value?: string;
  label?: string;
}
interface StatsBlockType {
  type: "stats";
  heading?: string;
  items: StatItem[];
}
type Block =
  | HeroBlock
  | FeatureGridBlock
  | FaqBlock
  | TextBlock
  | CtaBlock
  | MarqueeBlock
  | BentoBlockType
  | AudienceTabsBlock
  | StatsBlockType;

const ICON_OPTIONS = [
  "Sparkles",
  "Newspaper",
  "ShieldCheck",
  "Building2",
  "Briefcase",
  "TrendingUp",
  "GraduationCap",
  "FileBarChart",
  "Zap",
  "BarChart3",
  "Mail",
];

const BLOCK_META: Record<
  BlockType,
  { label: string; icon: React.ElementType; description: string }
> = {
  hero: {
    label: "Hero",
    icon: Type,
    description: "Sayfa başlığı, alt yazı, opsiyonel CTA",
  },
  "feature-grid": {
    label: "Feature Grid",
    icon: LayoutGrid,
    description: "3'lü ikonlu özellik kartları",
  },
  faq: {
    label: "FAQ",
    icon: MessageSquareQuote,
    description: "Sıkça sorulan sorular accordion",
  },
  text: {
    label: "HTML Metin",
    icon: AlignLeft,
    description: "Serbest HTML — başlık, paragraf, liste",
  },
  "cta-banner": {
    label: "CTA Banner",
    icon: Megaphone,
    description: "Renkli çağrı bandı + buton",
  },
  marquee: {
    label: "Marquee",
    icon: Repeat,
    description: "Kayan marka/etiket bandı",
  },
  bento: {
    label: "Bento Grid",
    icon: LayoutDashboard,
    description: "3'lü kart grid (ikon + başlık + CTA link)",
  },
  "audience-tabs": {
    label: "Audience Tabs",
    icon: PanelsTopLeft,
    description: "Sekme tabanlı çoklu kullanıcı segmenti",
  },
  stats: {
    label: "Stats",
    icon: TrendingUp,
    description: "Büyük rakam kartları",
  },
};

function newBlock(type: BlockType): Block {
  switch (type) {
    case "hero":
      return {
        type,
        eyebrow: "",
        title: "Başlık",
        subtitle: "Alt yazı...",
      };
    case "feature-grid":
      return {
        type,
        heading: "",
        items: [
          { icon: "Sparkles", title: "Özellik 1", desc: "..." },
          { icon: "ShieldCheck", title: "Özellik 2", desc: "..." },
          { icon: "BarChart3", title: "Özellik 3", desc: "..." },
        ],
      };
    case "faq":
      return {
        type,
        title: "Sıkça sorulanlar",
        items: [
          { q: "Soru 1?", a: "Cevap 1." },
          { q: "Soru 2?", a: "Cevap 2." },
        ],
      };
    case "text":
      return {
        type,
        html: "<h2>Başlık</h2>\n<p>Buraya metin...</p>",
      };
    case "cta-banner":
      return {
        type,
        title: "Çağrı başlığı",
        subtitle: "Alt yazı.",
        ctaLabel: "Tıkla",
        ctaHref: "/",
      };
    case "marquee":
      return {
        type,
        label: "Güvenilen markalar",
        items: ["Garanti BBVA", "Pegasus", "Vodafone", "Trendyol"],
      };
    case "bento":
      return {
        type,
        eyebrow: "Yayınlar",
        heading: "Bento başlık",
        subtitle: "Alt yazı (opsiyonel)",
        items: [
          {
            icon: "Newspaper",
            eyebrow: "Günlük",
            title: "Kart 1",
            desc: "Açıklama",
            cta: "Keşfet",
            href: "/",
          },
          {
            icon: "TrendingUp",
            eyebrow: "Haftalık",
            title: "Kart 2",
            desc: "Açıklama",
            cta: "Keşfet",
            href: "/",
          },
          {
            icon: "Sparkles",
            eyebrow: "Self-serve",
            title: "Kart 3",
            desc: "Açıklama",
            cta: "Hesap aç",
            href: "/",
            accent: true,
          },
        ],
      };
    case "audience-tabs":
      return {
        type,
        eyebrow: "Kime uygun",
        title: "Üç kullanıcı tipi",
        subtitle: "Tek platform, üç farklı senaryo.",
        tabs: [
          {
            value: "brand",
            label: "Markalar",
            features: [
              { icon: "BarChart3", title: "Sektör verisi", desc: "..." },
              { icon: "Sparkles", title: "Brand Studio", desc: "..." },
              { icon: "ShieldCheck", title: "Verified", desc: "..." },
            ],
          },
          {
            value: "agency",
            label: "Ajanslar",
            features: [
              { icon: "Building2", title: "Görünürlük", desc: "..." },
              { icon: "Briefcase", title: "İlan platformu", desc: "..." },
              { icon: "TrendingUp", title: "Rekabet zekâsı", desc: "..." },
            ],
          },
        ],
      };
    case "stats":
      return {
        type,
        heading: "Sayılarla MarkaRadar",
        items: [
          { value: "12K+", label: "Pazarlamacı" },
          { value: "1.2M+", label: "Aylık okuyucu" },
          { value: "350+", label: "Ajans" },
          { value: "%72", label: "Karar verici" },
        ],
      };
  }
}

// ──────────────────────────────────────────────────
// Editör — props
// ──────────────────────────────────────────────────
interface Props {
  page: {
    id: string;
    slug: string;
    locale: string;
    title: string | null;
    // API generic shape — runtime'da type-narrow ediyoruz
    blocks: Array<{ type: string; [k: string]: unknown }>;
    isPublished: boolean;
  };
}

export function PageContentEditor({ page }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(page.title ?? "");
  const [isPublished, setIsPublished] = useState(page.isPublished);
  const [blocks, setBlocks] = useState<Block[]>(
    Array.isArray(page.blocks) ? (page.blocks as unknown as Block[]) : [],
  );
  const [isPending, startTransition] = useTransition();

  // — Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }, // küçük yanlışlığa tolerans
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(String(active.id).replace("block-", ""));
    const newIndex = Number(String(over.id).replace("block-", ""));
    if (Number.isNaN(oldIndex) || Number.isNaN(newIndex)) return;
    setBlocks((b) => arrayMove(b, oldIndex, newIndex));
  };

  // — block ops
  const addBlock = (type: BlockType) => {
    setBlocks((b) => [...b, newBlock(type)]);
  };
  const removeBlock = (i: number) => {
    if (!confirm("Bu block'u silmek istediğinden emin misin?")) return;
    setBlocks((b) => b.filter((_, idx) => idx !== i));
  };
  const moveBlock = (i: number, dir: -1 | 1) => {
    setBlocks((b) => {
      const next = [...b];
      const target = i + dir;
      if (target < 0 || target >= next.length) return b;
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  };
  const updateBlock = (i: number, patch: Partial<Block>) => {
    setBlocks((b) =>
      b.map((blk, idx) => (idx === i ? ({ ...blk, ...patch } as Block) : blk)),
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updatePageContent(page.id, {
        title,
        isPublished,
        blocks,
      });
      if (res.ok) {
        toast.success("Kaydedildi");
        router.refresh();
      } else {
        toast.error(res.message ?? "Hata");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── Sayfa meta */}
      <div className="rounded-xl border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Sayfa başlığı</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              placeholder="Hakkımızda"
            />
          </div>
          <div>
            <Label>Yayın durumu</Label>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className="mt-1.5 inline-flex h-10 items-center gap-2 rounded-md border bg-card px-4 text-sm font-medium hover:bg-muted"
            >
              {isPublished ? (
                <>
                  <Eye size={15} /> Yayında
                </>
              ) : (
                <>
                  <EyeOff size={15} /> Taslak
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Block listesi (drag-sort) */}
      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed bg-card/50 p-12 text-center">
            <LayoutGrid
              size={48}
              className="mx-auto text-muted-foreground/30"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Henüz block yok. Aşağıdan ekle.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={blocks.map((_, i) => `block-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {blocks.map((block, i) => (
                  <SortableBlockCard
                    key={i}
                    id={`block-${i}`}
                    block={block}
                    index={i}
                    total={blocks.length}
                    onChange={(patch) => updateBlock(i, patch)}
                    onMoveUp={() => moveBlock(i, -1)}
                    onMoveDown={() => moveBlock(i, 1)}
                    onDelete={() => removeBlock(i)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* ─── Block ekle */}
      <div className="rounded-xl border-2 border-dashed bg-muted/20 p-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          + Yeni block ekle
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(Object.keys(BLOCK_META) as BlockType[]).map((type) => {
            const meta = BLOCK_META[type];
            const Icon = meta.icon;
            return (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                title={meta.description}
                className="flex flex-col items-center gap-1 rounded-lg border bg-card p-3 text-xs font-medium transition-all hover:border-accent hover:bg-accent/5 hover:text-accent"
              >
                <Icon size={18} strokeWidth={1.75} />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Save + Preview */}
      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur">
        <span className="mr-auto text-xs text-muted-foreground">
          {blocks.length} block · sürüklemek için <kbd>⋮⋮</kbd> tutup taşı
        </span>
        <Button asChild variant="outline" size="lg">
          <a
            href={`${
              process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3003"
            }/${page.slug === "landing" ? "" : page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Yeni sekmede aç — kaydedilmiş hali"
          >
            <ExternalLink size={15} /> Önizle
          </a>
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending}
          size="lg"
          variant="accent"
        >
          <Save size={15} /> {isPending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Sortable wrapper — dnd-kit
// ════════════════════════════════════════════════════════════════
function SortableBlockCard(props: {
  id: string;
  block: Block;
  index: number;
  total: number;
  onChange: (patch: Partial<Block>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const { id, ...rest } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <BlockCard
        {...rest}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Block card — header + per-type form
// ════════════════════════════════════════════════════════════════
function BlockCard({
  dragHandleProps,
  block,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  block: Block;
  index: number;
  total: number;
  onChange: (patch: Partial<Block>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const meta = BLOCK_META[block.type];
  const Icon = meta.icon;
  return (
    <div className="rounded-xl border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <button
          type="button"
          {...dragHandleProps}
          aria-label="Sürükle"
          className="cursor-grab touch-none rounded-md p-1 text-muted-foreground/40 hover:bg-muted hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Icon size={14} strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold">{meta.label}</span>
          <Badge variant="secondary" className="text-[10px]">
            #{index + 1}
          </Badge>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            title="Yukarı taşı"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            title="Aşağı taşı"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
            title="Sil"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Body — per type */}
      <div className="space-y-4 p-5">
        {block.type === "hero" ? (
          <HeroEditor block={block} onChange={onChange} />
        ) : block.type === "feature-grid" ? (
          <FeatureGridEditor block={block} onChange={onChange} />
        ) : block.type === "faq" ? (
          <FaqEditor block={block} onChange={onChange} />
        ) : block.type === "text" ? (
          <TextEditor block={block} onChange={onChange} />
        ) : block.type === "cta-banner" ? (
          <CtaEditor block={block} onChange={onChange} />
        ) : block.type === "marquee" ? (
          <MarqueeEditor block={block} onChange={onChange} />
        ) : block.type === "bento" ? (
          <BentoEditor block={block} onChange={onChange} />
        ) : block.type === "audience-tabs" ? (
          <AudienceTabsEditor block={block} onChange={onChange} />
        ) : block.type === "stats" ? (
          <StatsEditor block={block} onChange={onChange} />
        ) : null}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Per-block editors
// ════════════════════════════════════════════════════════════════

function HeroEditor({
  block,
  onChange,
}: {
  block: HeroBlock;
  onChange: (patch: Partial<HeroBlock>) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label>Eyebrow (üst etiket)</Label>
        <Input
          value={block.eyebrow ?? ""}
          onChange={(e) => onChange({ eyebrow: e.target.value })}
          className="mt-1.5"
          placeholder="Şirket"
        />
      </div>
      <div>
        <Label>CTA buton metni</Label>
        <Input
          value={block.ctaLabel ?? ""}
          onChange={(e) => onChange({ ctaLabel: e.target.value })}
          className="mt-1.5"
          placeholder="(opsiyonel)"
        />
      </div>
      <div className="md:col-span-2">
        <Label>Başlık *</Label>
        <Input
          value={block.title ?? ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="mt-1.5"
          placeholder="Türkiye'nin AI-native medyası"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Satır atlatmak için \n kullanabilirsin.
        </p>
      </div>
      <div className="md:col-span-2">
        <Label>Alt yazı</Label>
        <Textarea
          value={block.subtitle ?? ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          rows={2}
          className="mt-1.5"
          placeholder="Kısa açıklama..."
        />
      </div>
      <div>
        <Label>CTA link (href)</Label>
        <Input
          value={block.ctaHref ?? ""}
          onChange={(e) => onChange({ ctaHref: e.target.value })}
          className="mt-1.5 font-mono text-sm"
          placeholder="/is-ilanlari"
        />
      </div>
    </div>
  );
}

function FeatureGridEditor({
  block,
  onChange,
}: {
  block: FeatureGridBlock;
  onChange: (patch: Partial<FeatureGridBlock>) => void;
}) {
  const items = block.items ?? [];
  const updateItem = (i: number, patch: Partial<FeatureItem>) => {
    onChange({
      items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    });
  };
  const addItem = () => {
    onChange({
      items: [
        ...items,
        { icon: "Sparkles", title: "Yeni özellik", desc: "..." },
      ],
    });
  };
  const removeItem = (i: number) => {
    onChange({ items: items.filter((_, idx) => idx !== i) });
  };

  return (
    <div>
      <div>
        <Label>Section başlığı (opsiyonel)</Label>
        <Input
          value={block.heading ?? ""}
          onChange={(e) => onChange({ heading: e.target.value })}
          className="mt-1.5"
          placeholder="Neden var?"
        />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <Label>Öğeler ({items.length})</Label>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus size={13} /> Yeni öğe
          </Button>
        </div>
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-lg border bg-muted/20 p-4"
          >
            <div className="grid gap-3 md:grid-cols-[140px_1fr_1fr_auto]">
              <div>
                <Label className="text-[10px] uppercase tracking-wider">
                  İkon
                </Label>
                <select
                  value={it.icon ?? "Sparkles"}
                  onChange={(e) => updateItem(i, { icon: e.target.value })}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
                >
                  {ICON_OPTIONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider">
                  Başlık
                </Label>
                <Input
                  value={it.title ?? ""}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider">
                  Açıklama
                </Label>
                <Input
                  value={it.desc ?? ""}
                  onChange={(e) => updateItem(i, { desc: e.target.value })}
                  className="mt-1 h-9"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="mt-5 self-start rounded-md p-2 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
                title="Öğeyi sil"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqEditor({
  block,
  onChange,
}: {
  block: FaqBlock;
  onChange: (patch: Partial<FaqBlock>) => void;
}) {
  const items = block.items ?? [];
  const updateItem = (i: number, patch: Partial<FaqItem>) => {
    onChange({
      items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    });
  };
  const addItem = () =>
    onChange({ items: [...items, { q: "Yeni soru?", a: "Cevap..." }] });
  const removeItem = (i: number) =>
    onChange({ items: items.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div>
        <Label>Section başlığı</Label>
        <Input
          value={block.title ?? ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="mt-1.5"
          placeholder="Sıkça sorulanlar"
        />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <Label>Sorular ({items.length})</Label>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus size={13} /> Yeni soru
          </Button>
        </div>
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border bg-muted/20 p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Soru {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="rounded-md p-1 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <Input
              value={it.q ?? ""}
              onChange={(e) => updateItem(i, { q: e.target.value })}
              className="mt-2"
              placeholder="Soru..."
            />
            <Textarea
              value={it.a ?? ""}
              onChange={(e) => updateItem(i, { a: e.target.value })}
              rows={3}
              className="mt-2"
              placeholder="Cevap..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TextEditor({
  block,
  onChange,
}: {
  block: TextBlock;
  onChange: (patch: Partial<TextBlock>) => void;
}) {
  return (
    <div>
      <Label>HTML içerik</Label>
      <p className="mt-1 text-xs text-muted-foreground">
        <code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code>,{" "}
        <code>&lt;ul&gt;&lt;li&gt;</code>, <code>&lt;a&gt;</code>,{" "}
        <code>&lt;strong&gt;</code> kullanabilirsin.
      </p>
      <Textarea
        value={block.html ?? ""}
        onChange={(e) => onChange({ html: e.target.value })}
        rows={14}
        className="mt-2 font-mono text-xs"
        placeholder="<h2>Başlık</h2><p>Metin...</p>"
      />
    </div>
  );
}

function CtaEditor({
  block,
  onChange,
}: {
  block: CtaBlock;
  onChange: (patch: Partial<CtaBlock>) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label>Başlık *</Label>
        <Input
          value={block.title ?? ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="mt-1.5"
          placeholder="Bizimle çalışmak ister misin?"
        />
      </div>
      <div className="md:col-span-2">
        <Label>Alt yazı</Label>
        <Textarea
          value={block.subtitle ?? ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          rows={2}
          className="mt-1.5"
          placeholder="..."
        />
      </div>
      <div>
        <Label>CTA buton metni</Label>
        <Input
          value={block.ctaLabel ?? ""}
          onChange={(e) => onChange({ ctaLabel: e.target.value })}
          className="mt-1.5"
          placeholder="Tıkla"
        />
      </div>
      <div>
        <Label>CTA link (href)</Label>
        <Input
          value={block.ctaHref ?? ""}
          onChange={(e) => onChange({ ctaHref: e.target.value })}
          className="mt-1.5 font-mono text-sm"
          placeholder="/iletisim"
        />
      </div>
    </div>
  );
}

function MarqueeEditor({
  block,
  onChange,
}: {
  block: MarqueeBlock;
  onChange: (patch: Partial<MarqueeBlock>) => void;
}) {
  const items = block.items ?? [];
  return (
    <div>
      <div>
        <Label>Section etiketi (opsiyonel)</Label>
        <Input
          value={block.label ?? ""}
          onChange={(e) => onChange({ label: e.target.value })}
          className="mt-1.5"
          placeholder="Güvenilen markalar"
        />
      </div>
      <div className="mt-5">
        <Label>Marka/etiket listesi (her satır bir öğe)</Label>
        <Textarea
          value={items.join("\n")}
          onChange={(e) =>
            onChange({
              items: e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          rows={6}
          className="mt-1.5"
          placeholder="Garanti BBVA&#10;Pegasus&#10;Vodafone"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {items.length} öğe — kayan band olarak gösterilir.
        </p>
      </div>
    </div>
  );
}

function BentoEditor({
  block,
  onChange,
}: {
  block: BentoBlockType;
  onChange: (patch: Partial<BentoBlockType>) => void;
}) {
  const items = block.items ?? [];
  const updateItem = (i: number, patch: Partial<BentoItem>) => {
    onChange({
      items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    });
  };
  const addItem = () =>
    onChange({
      items: [
        ...items,
        { icon: "Sparkles", title: "Yeni kart", desc: "...", cta: "Detay", href: "/" },
      ],
    });
  const removeItem = (i: number) =>
    onChange({ items: items.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Label className="text-[10px] uppercase tracking-wider">Eyebrow</Label>
          <Input
            value={block.eyebrow ?? ""}
            onChange={(e) => onChange({ eyebrow: e.target.value })}
            className="mt-1 h-9"
            placeholder="Yayınlar"
          />
        </div>
        <div className="md:col-span-2">
          <Label className="text-[10px] uppercase tracking-wider">Başlık</Label>
          <Input
            value={block.heading ?? ""}
            onChange={(e) => onChange({ heading: e.target.value })}
            className="mt-1 h-9"
            placeholder="..."
          />
        </div>
        <div className="md:col-span-3">
          <Label className="text-[10px] uppercase tracking-wider">
            Alt yazı
          </Label>
          <Input
            value={block.subtitle ?? ""}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            className="mt-1 h-9"
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <Label>Kartlar ({items.length})</Label>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus size={13} /> Yeni kart
          </Button>
        </div>
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Kart {i + 1}
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={Boolean(it.accent)}
                    onChange={(e) =>
                      updateItem(i, { accent: e.target.checked })
                    }
                    className="rounded"
                  />
                  Accent (turuncu vurgu)
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-[140px_140px_1fr]">
              <div>
                <Label className="text-[10px] uppercase tracking-wider">
                  İkon
                </Label>
                <select
                  value={it.icon ?? "Sparkles"}
                  onChange={(e) => updateItem(i, { icon: e.target.value })}
                  className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
                >
                  {ICON_OPTIONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider">
                  Eyebrow
                </Label>
                <Input
                  value={it.eyebrow ?? ""}
                  onChange={(e) => updateItem(i, { eyebrow: e.target.value })}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider">
                  Başlık
                </Label>
                <Input
                  value={it.title ?? ""}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                  className="mt-1 h-9"
                />
              </div>
              <div className="md:col-span-3">
                <Label className="text-[10px] uppercase tracking-wider">
                  Açıklama
                </Label>
                <Textarea
                  value={it.desc ?? ""}
                  onChange={(e) => updateItem(i, { desc: e.target.value })}
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider">
                  CTA metin
                </Label>
                <Input
                  value={it.cta ?? ""}
                  onChange={(e) => updateItem(i, { cta: e.target.value })}
                  className="mt-1 h-9"
                  placeholder="Detay"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-[10px] uppercase tracking-wider">
                  CTA link
                </Label>
                <Input
                  value={it.href ?? ""}
                  onChange={(e) => updateItem(i, { href: e.target.value })}
                  className="mt-1 h-9 font-mono text-sm"
                  placeholder="/raporlar"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AudienceTabsEditor({
  block,
  onChange,
}: {
  block: AudienceTabsBlock;
  onChange: (patch: Partial<AudienceTabsBlock>) => void;
}) {
  const tabs = block.tabs ?? [];
  const updateTab = (i: number, patch: Partial<AudienceTab>) => {
    onChange({
      tabs: tabs.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    });
  };
  const addTab = () =>
    onChange({
      tabs: [
        ...tabs,
        {
          value: `tab-${tabs.length}`,
          label: "Yeni sekme",
          features: [
            { icon: "Sparkles", title: "Özellik 1", desc: "..." },
            { icon: "ShieldCheck", title: "Özellik 2", desc: "..." },
            { icon: "BarChart3", title: "Özellik 3", desc: "..." },
          ],
        },
      ],
    });
  const removeTab = (i: number) =>
    onChange({ tabs: tabs.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Label className="text-[10px] uppercase tracking-wider">Eyebrow</Label>
          <Input
            value={block.eyebrow ?? ""}
            onChange={(e) => onChange({ eyebrow: e.target.value })}
            className="mt-1 h-9"
          />
        </div>
        <div className="md:col-span-2">
          <Label className="text-[10px] uppercase tracking-wider">Başlık</Label>
          <Input
            value={block.title ?? ""}
            onChange={(e) => onChange({ title: e.target.value })}
            className="mt-1 h-9"
          />
        </div>
        <div className="md:col-span-3">
          <Label className="text-[10px] uppercase tracking-wider">
            Alt yazı
          </Label>
          <Input
            value={block.subtitle ?? ""}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            className="mt-1 h-9"
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <Label>Sekmeler ({tabs.length})</Label>
          <Button type="button" size="sm" variant="outline" onClick={addTab}>
            <Plus size={13} /> Yeni sekme
          </Button>
        </div>
        {tabs.map((tab, ti) => {
          const features = tab.features ?? [];
          const updateF = (
            fi: number,
            patch: Partial<{ icon: string; title: string; desc: string }>,
          ) => {
            updateTab(ti, {
              features: features.map((f, idx) =>
                idx === fi ? { ...f, ...patch } : f,
              ),
            });
          };
          const addF = () =>
            updateTab(ti, {
              features: [
                ...features,
                { icon: "Sparkles", title: "Özellik", desc: "..." },
              ],
            });
          const removeF = (fi: number) =>
            updateTab(ti, {
              features: features.filter((_, idx) => idx !== fi),
            });
          return (
            <div key={ti} className="rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sekme {ti + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeTab(ti)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <Label className="text-[10px] uppercase tracking-wider">
                    Value (URL hash, ascii)
                  </Label>
                  <Input
                    value={tab.value ?? ""}
                    onChange={(e) =>
                      updateTab(ti, { value: e.target.value })
                    }
                    className="mt-1 h-9 font-mono text-sm"
                    placeholder="brand"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider">
                    Sekme metni
                  </Label>
                  <Input
                    value={tab.label ?? ""}
                    onChange={(e) =>
                      updateTab(ti, { label: e.target.value })
                    }
                    className="mt-1 h-9"
                    placeholder="Markalar"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">
                    Özellikler ({features.length})
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addF}
                  >
                    <Plus size={12} /> Ekle
                  </Button>
                </div>
                {features.map((f, fi) => (
                  <div
                    key={fi}
                    className="grid gap-2 rounded-md border bg-background p-3 md:grid-cols-[120px_1fr_1fr_auto]"
                  >
                    <select
                      value={f.icon ?? "Sparkles"}
                      onChange={(e) =>
                        updateF(fi, { icon: e.target.value })
                      }
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                    >
                      {ICON_OPTIONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={f.title ?? ""}
                      onChange={(e) => updateF(fi, { title: e.target.value })}
                      placeholder="Başlık"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={f.desc ?? ""}
                      onChange={(e) => updateF(fi, { desc: e.target.value })}
                      placeholder="Açıklama"
                      className="h-8 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeF(fi)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsEditor({
  block,
  onChange,
}: {
  block: StatsBlockType;
  onChange: (patch: Partial<StatsBlockType>) => void;
}) {
  const items = block.items ?? [];
  const updateItem = (i: number, patch: Partial<StatItem>) => {
    onChange({
      items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    });
  };
  const addItem = () =>
    onChange({ items: [...items, { value: "0", label: "Etiket" }] });
  const removeItem = (i: number) =>
    onChange({ items: items.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div>
        <Label>Section başlığı</Label>
        <Input
          value={block.heading ?? ""}
          onChange={(e) => onChange({ heading: e.target.value })}
          className="mt-1.5"
        />
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between">
          <Label>İstatistikler ({items.length})</Label>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus size={13} /> Yeni
          </Button>
        </div>
        {items.map((it, i) => (
          <div
            key={i}
            className="grid gap-2 rounded-md border bg-muted/20 p-3 md:grid-cols-[1fr_2fr_auto]"
          >
            <div>
              <Label className="text-[10px] uppercase tracking-wider">
                Değer (büyük metin)
              </Label>
              <Input
                value={it.value ?? ""}
                onChange={(e) => updateItem(i, { value: e.target.value })}
                className="mt-1 h-9 font-display font-bold"
                placeholder="12K+"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider">
                Etiket
              </Label>
              <Input
                value={it.label ?? ""}
                onChange={(e) => updateItem(i, { label: e.target.value })}
                className="mt-1 h-9"
                placeholder="Pazarlamacı"
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="mt-5 self-start rounded-md p-2 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
