"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAgency } from "@/app/actions/agencies";
import { toast } from "@/components/ui/toaster";

export function AgencyForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    city: "",
    website: "",
    email: "",
    linkedinUrl: "",
    servicesText: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createAgency({
        name: form.name,
        tagline: form.tagline || undefined,
        description: form.description || undefined,
        city: form.city || undefined,
        website: form.website || undefined,
        email: form.email || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        services: form.servicesText
          ? form.servicesText.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      });
      if (res.ok) {
        toast.success(`${form.name} eklendi`);
        router.push("/ajans");
      } else {
        toast.error(res.message ?? "Hata");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <Label htmlFor="name">Ajans adı *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={150}
            className="mt-1.5"
            placeholder="ABC Yaratıcı"
          />
        </div>

        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            maxLength={300}
            className="mt-1.5"
            placeholder="Yaratıcı kampanya + performans hibrit ajans"
          />
        </div>

        <div>
          <Label htmlFor="desc">Açıklama</Label>
          <Textarea
            id="desc"
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
            <Label htmlFor="city">Şehir</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="mt-1.5"
              placeholder="İstanbul"
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="mt-1.5"
              placeholder="https://"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              type="url"
              value={form.linkedinUrl}
              onChange={(e) =>
                setForm({ ...form, linkedinUrl: e.target.value })
              }
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="services">Servisler (virgülle ayır)</Label>
          <Input
            id="services"
            value={form.servicesText}
            onChange={(e) =>
              setForm({ ...form, servicesText: e.target.value })
            }
            className="mt-1.5"
            placeholder="Sosyal medya, Performance, Influencer, Marka"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          <Save size={16} />
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
