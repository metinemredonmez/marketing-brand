"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  submitAgencyReview,
  type ReviewSubmitState,
} from "@/app/actions/review-submit";

export function ReviewSubmitForm({
  agencyId,
  agencyName,
}: {
  agencyId: string;
  agencyName: string;
}) {
  const submit = submitAgencyReview.bind(null, agencyId);
  const [state, formAction, isPending] = useActionState<
    ReviewSubmitState | null,
    FormData
  >(submit, null);

  if (state?.ok) {
    return (
      <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-6 dark:bg-emerald-950/40">
        <div className="text-lg font-bold text-emerald-900 dark:text-emerald-200">✓ Review alındı</div>
        <p className="mt-2 text-emerald-800 dark:text-emerald-300">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Reviewer */}
      <fieldset className="rounded-lg border bg-card p-5">
        <legend className="px-2 text-sm font-bold text-foreground">
          1. Sen kimsin?
        </legend>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="reviewerName">Ad soyad *</Label>
            <Input
              id="reviewerName"
              name="reviewerName"
              required
              maxLength={150}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="reviewerRole">Rolün *</Label>
            <Input
              id="reviewerRole"
              name="reviewerRole"
              required
              maxLength={100}
              className="mt-1"
              placeholder="Marketing Director"
            />
          </div>
          <div>
            <Label htmlFor="reviewerEmail">Şirket e-postan *</Label>
            <Input
              id="reviewerEmail"
              name="reviewerEmail"
              type="email"
              required
              className="mt-1"
              placeholder="ad@sirket.com.tr"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              gmail/yahoo/hotmail kabul edilmez
            </p>
          </div>
          <div>
            <Label htmlFor="reviewerCompany">Şirket adı *</Label>
            <Input
              id="reviewerCompany"
              name="reviewerCompany"
              required
              maxLength={150}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="reviewerLinkedin">LinkedIn URL *</Label>
            <Input
              id="reviewerLinkedin"
              name="reviewerLinkedin"
              type="url"
              required
              className="mt-1"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>
      </fieldset>

      {/* Proje */}
      <fieldset className="rounded-lg border bg-card p-5">
        <legend className="px-2 text-sm font-bold text-foreground">
          2. Proje detayları
        </legend>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="projectType">Proje tipi</Label>
            <select
              id="projectType"
              name="projectType"
              className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
            >
              <option value="">Seç...</option>
              <option value="social_media">Sosyal Medya</option>
              <option value="performance">Performance</option>
              <option value="brand">Marka</option>
              <option value="content">İçerik</option>
              <option value="pr">PR</option>
              <option value="influencer">Influencer</option>
              <option value="full_service">Full service</option>
            </select>
          </div>
          <div>
            <Label htmlFor="projectBudgetRange">Bütçe aralığı</Label>
            <select
              id="projectBudgetRange"
              name="projectBudgetRange"
              className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
            >
              <option value="">Seç...</option>
              <option value="<50K">{`< 50.000 TL`}</option>
              <option value="50-200K">50K - 200K TL</option>
              <option value="200K-1M">200K - 1M TL</option>
              <option value="1M+">1M+ TL</option>
              <option value="hidden">Bilgi vermek istemiyorum</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* Puanlama */}
      <fieldset className="rounded-lg border bg-card p-5">
        <legend className="px-2 text-sm font-bold text-foreground">
          3. Puanlama (1-5 yıldız)
        </legend>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <StarRating name="ratingOverall" label="Genel memnuniyet *" required />
          <StarRating name="ratingQuality" label="Yaratıcı/iş kalitesi *" required />
          <StarRating name="ratingCommunication" label="İletişim *" required />
          <StarRating name="ratingTimeline" label="Süre/zamanlama *" required />
          <StarRating name="ratingValue" label="Fiyat/değer *" required />
        </div>
      </fieldset>

      {/* İçerik */}
      <fieldset className="rounded-lg border bg-card p-5">
        <legend className="px-2 text-sm font-bold text-foreground">
          4. Deneyimini anlat
        </legend>
        <div className="mt-3 space-y-4">
          <div>
            <Label htmlFor="title">Başlık (max 100 karakter) *</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={100}
              className="mt-1"
              placeholder="Performance kampanyada %200 ROAS"
            />
          </div>
          <div>
            <Label htmlFor="content">Detaylı yorum (min 200 kelime) *</Label>
            <Textarea
              id="content"
              name="content"
              required
              rows={8}
              minLength={200}
              maxLength={5000}
              className="mt-1"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="pros">Beğendiklerin</Label>
              <Textarea
                id="pros"
                name="pros"
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cons">Geliştirilmesi gerekenler</Label>
              <Textarea
                id="cons"
                name="cons"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="wouldWorkAgain">Tekrar çalışır mıydın?</Label>
            <select
              id="wouldWorkAgain"
              name="wouldWorkAgain"
              className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm md:w-64"
            >
              <option value="yes">Evet</option>
              <option value="maybe">Belki</option>
              <option value="no">Hayır</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* KVKK */}
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 size-4"
        />
        <span>
          <strong>{agencyName}</strong> hakkında yazdığım review'un gerçek
          deneyimimi yansıttığını taahhüt ediyorum.{" "}
          <a href="/kvkk" className="text-brand-500 underline">
            KVKK aydınlatma metnini
          </a>{" "}
          okudum ve verilerimin işlenmesini kabul ediyorum.
        </span>
      </label>

      {state && !state.ok && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
          {state.message}
        </div>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Gönderiliyor..." : "Review gönder"}
      </Button>
    </form>
  );
}

function StarRating({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  const [value, setValue] = useState<number>(0);
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n)}
            className="rounded p-1 hover:bg-muted"
            aria-label={`${n} yıldız`}
          >
            <Star
              size={22}
              className={
                n <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300"
              }
            />
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} required={required} />
    </div>
  );
}
