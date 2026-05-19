"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCourse } from "@/app/actions/courses";
import { toast } from "@/components/ui/toaster";
import { useTranslations } from "@/lib/i18n/client";

export default function NewCoursePage() {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    format: "online_cohort",
    level: "intermediate",
    durationWeeks: "8",
    priceTry: "9900",
    earlyBirdPriceTry: "",
    capacity: "30",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createCourse({
        title: form.title,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        format: form.format,
        level: form.level,
        durationWeeks: form.durationWeeks ? Number(form.durationWeeks) : undefined,
        priceTry: Number(form.priceTry),
        earlyBirdPriceTry: form.earlyBirdPriceTry
          ? Number(form.earlyBirdPriceTry)
          : undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
      });
      if (res.ok) {
        toast.success("Kurs oluşturuldu");
        router.push("/akademi");
      } else {
        toast.error(res.message ?? "Hata");
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <GraduationCap size={24} /> {t("forms.newCourse.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("forms.newCourse.subtitle")}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <div>
            <Label>Kurs adı *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="mt-1.5"
              placeholder="AI Marketing Mini MBA"
            />
          </div>
          <div>
            <Label>Alt başlık</Label>
            <Input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="mt-1.5"
              placeholder="8 hafta · Cohort tabanlı · 30 kişilik"
            />
          </div>
          <div>
            <Label>Açıklama</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Format</Label>
              <select
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-md border bg-card px-3 text-sm"
              >
                <option value="online_cohort">Online Kohort</option>
                <option value="self_paced">Self-paced</option>
                <option value="in_person">Yüz Yüze</option>
              </select>
            </div>
            <div>
              <Label>Seviye</Label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-md border bg-card px-3 text-sm"
              >
                <option value="beginner">Başlangıç</option>
                <option value="intermediate">Orta</option>
                <option value="advanced">İleri</option>
              </select>
            </div>
            <div>
              <Label>Süre (hafta)</Label>
              <Input
                type="number"
                value={form.durationWeeks}
                onChange={(e) =>
                  setForm({ ...form, durationWeeks: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Fiyat (TL) *</Label>
              <Input
                type="number"
                value={form.priceTry}
                onChange={(e) =>
                  setForm({ ...form, priceTry: e.target.value })
                }
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Early bird (TL)</Label>
              <Input
                type="number"
                value={form.earlyBirdPriceTry}
                onChange={(e) =>
                  setForm({ ...form, earlyBirdPriceTry: e.target.value })
                }
                className="mt-1.5"
                placeholder="7900"
              />
            </div>
            <div>
              <Label>Kapasite</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            <Save size={16} />
            {isPending ? "Kaydediliyor..." : "Kursu oluştur"}
          </Button>
        </div>
      </form>
    </div>
  );
}
