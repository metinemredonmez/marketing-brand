"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCohort } from "@/app/actions/courses";
import { toast } from "@/components/ui/toaster";
import { useTranslations } from "@/lib/i18n/client";

export default function NewCohortPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useTranslations();
  const { id } = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    cohortNumber: "1",
    startDate: "",
    endDate: "",
    capacity: "30",
    zoomLink: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createCohort(id, {
        cohortNumber: Number(form.cohortNumber),
        startDate: form.startDate,
        endDate: form.endDate,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        zoomLink: form.zoomLink || undefined,
      });
      if (res.ok) {
        toast.success("Kohort açıldı");
        router.push("/akademi");
      } else {
        toast.error(res.message ?? "Hata");
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Calendar size={24} /> {t("forms.newCohort.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("forms.newCohort.subtitle")} · Course ID: <code>{id}</code>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <div>
            <Label>Kohort numarası *</Label>
            <Input
              type="number"
              min={1}
              value={form.cohortNumber}
              onChange={(e) =>
                setForm({ ...form, cohortNumber: e.target.value })
              }
              required
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Başlangıç tarihi *</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Bitiş tarihi *</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value })
                }
                required
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
            />
          </div>

          <div>
            <Label>Zoom linki</Label>
            <Input
              type="url"
              value={form.zoomLink}
              onChange={(e) => setForm({ ...form, zoomLink: e.target.value })}
              className="mt-1.5"
              placeholder="https://zoom.us/j/..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            <Save size={16} />
            {isPending ? "Açılıyor..." : "Kohortu aç"}
          </Button>
        </div>
      </form>
    </div>
  );
}
