"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createJob } from "@/app/actions/jobs";
import { toast } from "@/components/ui/toaster";
import { useTranslations } from "@/lib/i18n/client";

export default function NewJobPage() {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: "",
    description: "",
    companyName: "",
    category: "social_media",
    seniority: "mid",
    employmentType: "full_time",
    location: "İstanbul",
    isRemote: false,
    salaryMin: "",
    salaryMax: "",
    applyUrl: "",
    applyEmail: "",
    plan: "basic",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createJob({
        title: form.title,
        description: form.description,
        companyName: form.companyName,
        category: form.category,
        seniority: form.seniority,
        employmentType: form.employmentType,
        location: form.location || undefined,
        isRemote: form.isRemote,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        applyUrl: form.applyUrl || undefined,
        applyEmail: form.applyEmail || undefined,
        plan: form.plan,
      });
      if (res.ok) {
        toast.success("İlan oluşturuldu");
        router.push("/is-ilanlari");
      } else {
        toast.error(res.message ?? "Hata");
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Briefcase size={24} /> {t("forms.newJob.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("forms.newJob.subtitle")}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Pozisyon başlığı *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="mt-1.5"
                placeholder="Senior Sosyal Medya Uzmanı"
              />
            </div>
            <div>
              <Label>Şirket adı *</Label>
              <Input
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
                required
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>İş tanımı *</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={6}
              required
              minLength={50}
              className="mt-1.5"
              placeholder="Sorumluluklar, beklenen deneyim, kullanılan araçlar..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Kategori</Label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="mt-1.5 h-10 w-full rounded-md border bg-card px-3 text-sm"
              >
                <option value="social_media">Sosyal Medya</option>
                <option value="performance">Performance</option>
                <option value="brand">Marka</option>
                <option value="copywriter">Copywriter</option>
                <option value="art_director">Art Director</option>
                <option value="data">Data / Analytics</option>
                <option value="content">İçerik</option>
                <option value="influencer">Influencer</option>
              </select>
            </div>
            <div>
              <Label>Seviye</Label>
              <select
                value={form.seniority}
                onChange={(e) =>
                  setForm({ ...form, seniority: e.target.value })
                }
                className="mt-1.5 h-10 w-full rounded-md border bg-card px-3 text-sm"
              >
                <option value="intern">Stajyer</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="director">Director</option>
              </select>
            </div>
            <div>
              <Label>İş tipi</Label>
              <select
                value={form.employmentType}
                onChange={(e) =>
                  setForm({ ...form, employmentType: e.target.value })
                }
                className="mt-1.5 h-10 w-full rounded-md border bg-card px-3 text-sm"
              >
                <option value="full_time">Tam zamanlı</option>
                <option value="part_time">Yarı zamanlı</option>
                <option value="freelance">Freelance</option>
                <option value="contract">Sözleşmeli</option>
                <option value="internship">Staj</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Lokasyon</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className="mt-1.5"
                placeholder="İstanbul"
              />
            </div>
            <div>
              <Label>Maaş aralığı min (TL)</Label>
              <Input
                type="number"
                value={form.salaryMin}
                onChange={(e) =>
                  setForm({ ...form, salaryMin: e.target.value })
                }
                className="mt-1.5"
                placeholder="50000"
              />
            </div>
            <div>
              <Label>Maaş max (TL)</Label>
              <Input
                type="number"
                value={form.salaryMax}
                onChange={(e) =>
                  setForm({ ...form, salaryMax: e.target.value })
                }
                className="mt-1.5"
                placeholder="80000"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isRemote}
              onChange={(e) =>
                setForm({ ...form, isRemote: e.target.checked })
              }
              className="size-4"
            />
            Uzaktan çalışma
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Başvuru URL'i</Label>
              <Input
                type="url"
                value={form.applyUrl}
                onChange={(e) =>
                  setForm({ ...form, applyUrl: e.target.value })
                }
                className="mt-1.5"
                placeholder="https://"
              />
            </div>
            <div>
              <Label>Veya başvuru e-postası</Label>
              <Input
                type="email"
                value={form.applyEmail}
                onChange={(e) =>
                  setForm({ ...form, applyEmail: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>İlan paketi</Label>
            <select
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
              className="mt-1.5 h-10 w-full rounded-md border bg-card px-3 text-sm"
            >
              <option value="basic">Basic — 1.490 TL · sadece site</option>
              <option value="featured">
                Featured — 3.490 TL · site + LinkedIn post
              </option>
              <option value="premium_distribution">
                Premium — 6.990 TL · site + LinkedIn + IG + WhatsApp + newsletter
              </option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            <Save size={16} />
            {isPending ? "Kaydediliyor..." : "Yayınla"}
          </Button>
        </div>
      </form>
    </div>
  );
}
