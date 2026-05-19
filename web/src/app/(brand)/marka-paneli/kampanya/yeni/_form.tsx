"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import {
  AlertCircle,
  Megaphone,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  createCampaignAction,
  markCreativeReadyAction,
  type BrandFormState,
} from "@/app/actions/brand";
import type { BrandCreative } from "@/lib/api/brand";
import { useTranslations } from "@/lib/i18n/client";

const PLACEMENTS = [
  { v: "homepage_top", labelKey: "placementOpt.homepageTop" },
  { v: "category_top", labelKey: "placementOpt.categoryTop" },
  { v: "sidebar_sticky", labelKey: "placementOpt.sidebar" },
  { v: "article_inline", labelKey: "placementOpt.articleInline" },
  { v: "mobile_sticky", labelKey: "placementOpt.mobileSticky" },
  { v: "newsletter_top", labelKey: "placementOpt.newsletter" },
];

const TYPES = [
  { v: "banner", labelKey: "typeOpt.banner" },
  { v: "sponsored_content", labelKey: "typeOpt.sponsored" },
  { v: "newsletter", labelKey: "typeOpt.newsletter" },
  { v: "native", labelKey: "typeOpt.native" },
];

const GOALS = [
  { v: "awareness", labelKey: "goalOpt.awareness" },
  { v: "traffic", labelKey: "goalOpt.traffic" },
  { v: "lead_gen", labelKey: "goalOpt.leadGen" },
  { v: "brand_story", labelKey: "goalOpt.brandStory" },
];

export function NewCampaignForm({
  brandAccountId,
  readyCreatives,
  draftCreatives,
  balance,
}: {
  brandAccountId: string;
  readyCreatives: BrandCreative[];
  draftCreatives: BrandCreative[];
  balance: number;
}) {
  const [state, action, pending] = useActionState<
    BrandFormState | null,
    FormData
  >(createCampaignAction.bind(null, brandAccountId), null);
  const { t, locale } = useTranslations();
  const fmt = locale === "en" ? "en-US" : "tr-TR";

  const [selectedCreativeId, setSelectedCreativeId] = useState<string>(
    readyCreatives[0]?.id ?? "",
  );
  const [budget, setBudget] = useState(10000);
  const [readyIds, setReadyIds] = useState<Set<string>>(
    new Set(readyCreatives.map((c) => c.id)),
  );
  const [markingId, startMark] = useTransition();

  const today = new Date().toISOString().slice(0, 10);
  const oneMonth = new Date();
  oneMonth.setDate(oneMonth.getDate() + 30);

  const allCreatives = [
    ...readyCreatives,
    ...draftCreatives.filter((d) => !readyIds.has(d.id)),
  ];

  function onMarkReady(id: string) {
    startMark(async () => {
      const r = await markCreativeReadyAction(brandAccountId, id);
      if (r.ok) {
        setReadyIds(new Set([...readyIds, id]));
        setSelectedCreativeId(id);
      }
    });
  }

  return (
    <form action={action} className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            {t("brandPortal.campaigns.builder.step1")}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">
                {t("brandPortal.campaigns.builder.name")}
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder={t("brandPortal.campaigns.builder.namePlaceholder")}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="goal">
                {t("brandPortal.campaigns.builder.goal")}
              </Label>
              <select
                id="goal"
                name="goal"
                required
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {GOALS.map((g) => (
                  <option key={g.v} value={g.v}>
                    {t(`brandPortal.campaigns.builder.${g.labelKey}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="type">
                {t("brandPortal.campaigns.builder.type")}
              </Label>
              <select
                id="type"
                name="type"
                required
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {TYPES.map((ty) => (
                  <option key={ty.v} value={ty.v}>
                    {t(`brandPortal.campaigns.builder.${ty.labelKey}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="placement">
                {t("brandPortal.campaigns.builder.placement")}
              </Label>
              <select
                id="placement"
                name="placement"
                required
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p.v} value={p.v}>
                    {t(`brandPortal.campaigns.builder.${p.labelKey}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            {t("brandPortal.campaigns.builder.step2")}
          </h3>
          {allCreatives.length === 0 ? (
            <div className="mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {t("brandPortal.campaigns.builder.noCreativesYet")}{" "}
              <Link href="/marka-paneli/ai" className="font-medium underline">
                {t("brandPortal.campaigns.builder.generateFromAi")}
              </Link>
              .
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {allCreatives.map((c) => {
                const isReady = readyIds.has(c.id);
                const isSelected = selectedCreativeId === c.id;
                return (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                      isSelected
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="creativeId"
                      value={c.id}
                      required
                      disabled={!isReady}
                      checked={isSelected}
                      onChange={() => setSelectedCreativeId(c.id)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {c.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c.type} ·{" "}
                        {new Date(c.createdAt).toLocaleDateString(fmt)}
                      </div>
                    </div>
                    {isReady ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />{" "}
                        {t("brandPortal.campaigns.builder.creativeReady")}
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={markingId}
                        onClick={() => onMarkReady(c.id)}
                      >
                        {markingId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          t("brandPortal.campaigns.builder.creativeApprove")
                        )}
                      </Button>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            {t("brandPortal.campaigns.builder.step3")}
          </h3>
          <div className="mt-4 grid gap-4">
            <div>
              <Label htmlFor="audience">
                {t("brandPortal.campaigns.builder.audience")}
              </Label>
              <Input
                id="audience"
                name="audience"
                placeholder={t(
                  "brandPortal.campaigns.builder.audiencePlaceholder",
                )}
                className="mt-1.5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="categories">
                  {t("brandPortal.campaigns.builder.categories")}
                </Label>
                <Input
                  id="categories"
                  name="categories"
                  placeholder={t(
                    "brandPortal.campaigns.builder.categoriesPlaceholder",
                  )}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="cities">
                  {t("brandPortal.campaigns.builder.cities")}
                </Label>
                <Input
                  id="cities"
                  name="cities"
                  placeholder={t(
                    "brandPortal.campaigns.builder.citiesPlaceholder",
                  )}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <aside className="space-y-5">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            {t("brandPortal.campaigns.builder.step4")}
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="budgetTry">
                {t("brandPortal.campaigns.builder.budget")}
              </Label>
              <Input
                id="budgetTry"
                name="budgetTry"
                type="number"
                required
                min={5000}
                max={500000}
                step={1000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="mt-1.5 font-mono"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t("brandPortal.campaigns.builder.budgetHint")}
              </p>
            </div>
            <div>
              <Label htmlFor="startAt">
                {t("brandPortal.campaigns.builder.startAt")}
              </Label>
              <Input
                id="startAt"
                name="startAt"
                type="date"
                required
                defaultValue={today}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="endAt">
                {t("brandPortal.campaigns.builder.endAt")}
              </Label>
              <Input
                id="endAt"
                name="endAt"
                type="date"
                required
                defaultValue={oneMonth.toISOString().slice(0, 10)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="mt-5 rounded-md bg-muted p-3 text-xs text-foreground/80">
            {t("brandPortal.campaigns.builder.balanceLabel")}
            <span className="font-mono font-semibold">
              {balance.toLocaleString(fmt)} ₺
            </span>
            {budget > balance && (
              <div className="mt-2 flex items-start gap-1.5 text-amber-800 dark:text-amber-300">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {t("brandPortal.campaigns.builder.balanceInsufficient")}
                  <Link
                    href="/marka-paneli/cuzdan"
                    className="font-medium underline"
                  >
                    {t("brandPortal.campaigns.builder.topUp")}
                  </Link>
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            {t("brandPortal.campaigns.builder.nextStep")}
          </h3>
          <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <li>{t("brandPortal.campaigns.builder.flow1")}</li>
            <li>{t("brandPortal.campaigns.builder.flow2")}</li>
            <li>{t("brandPortal.campaigns.builder.flow3")}</li>
            <li>{t("brandPortal.campaigns.builder.flow4")}</li>
          </ol>
        </Card>

        {state?.message && !state.ok && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
            {state.message}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending || allCreatives.length === 0}
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("brandPortal.campaigns.builder.submitting")}
            </>
          ) : (
            <>
              <Megaphone className="mr-2 h-4 w-4" />{" "}
              {t("brandPortal.campaigns.builder.submit")}
            </>
          )}
        </Button>
      </aside>
    </form>
  );
}
