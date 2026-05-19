"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEvent } from "@/app/actions/events";
import { toast } from "@/components/ui/toaster";
import { useTranslations } from "@/lib/i18n/client";

export default function NewEventPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    type: "summit",
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
    venue: "",
    city: "İstanbul",
    capacity: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createEvent({
        type: form.type,
        title: form.title,
        description: form.description || undefined,
        startsAt: form.startsAt,
        endsAt: form.endsAt || undefined,
        venue: form.venue || undefined,
        city: form.city || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
      });
      if (res.ok) {
        toast.success("Etkinlik oluşturuldu");
        router.push("/etkinlikler");
      } else {
        toast.error(res.message ?? "Hata");
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Trophy size={24} /> {t("forms.newEvent.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("forms.newEvent.subtitle")}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <div>
            <Label>Etkinlik tipi *</Label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1.5 h-10 w-full rounded-md border bg-card px-3 text-sm"
            >
              <option value="summit">Zirve (yıllık flagship)</option>
              <option value="awards">Ödül Töreni</option>
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="meetup">Buluşma</option>
            </select>
          </div>

          <div>
            <Label>Etkinlik adı *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="mt-1.5"
              placeholder="Türkiye AI Marketing Ödülleri 2026"
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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Başlangıç *</Label>
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) =>
                  setForm({ ...form, startsAt: e.target.value })
                }
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Bitiş</Label>
              <Input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label>Mekan</Label>
              <Input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className="mt-1.5"
                placeholder="Volkswagen Arena, İstanbul"
              />
            </div>
            <div>
              <Label>Şehir</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>Kapasite</Label>
            <Input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="mt-1.5"
              placeholder="500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            <Save size={16} />
            {isPending ? "Oluşturuluyor..." : "Etkinlik oluştur"}
          </Button>
        </div>
      </form>
    </div>
  );
}
