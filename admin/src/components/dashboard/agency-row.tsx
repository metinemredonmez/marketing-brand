"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { setAgencyTier } from "@/app/actions/agencies";
import { toast } from "@/components/ui/toaster";

interface Agency {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  tier: string;
  ratingAvg: number;
  reviewCount: number;
  verificationLevel: string;
}

const TIERS = ["free", "basic", "premium", "featured", "elite"] as const;

export function AgencyRow({
  agency,
  tierLabel,
}: {
  agency: Agency;
  tierLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [currentTier, setCurrentTier] = useState(agency.tier);

  const changeTier = (newTier: string) => {
    startTransition(async () => {
      const res = await setAgencyTier(
        agency.id,
        newTier as "free" | "basic" | "premium" | "featured" | "elite",
        12,
      );
      if (res.ok) {
        setCurrentTier(newTier);
        toast.success(`${agency.name} → ${newTier}`);
      } else {
        toast.error(res.message ?? "Hata");
      }
    });
  };

  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3">
        <Link
          href={`/ajans/${agency.id}`}
          className="font-medium text-foreground hover:text-brand-500"
        >
          {agency.name}
        </Link>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{agency.city ?? "—"}</td>
      <td className="px-4 py-3">
        <select
          value={currentTier}
          onChange={(e) => changeTier(e.target.value)}
          disabled={isPending}
          className="h-8 rounded border bg-card px-2 text-xs font-medium"
        >
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="font-medium">
            {Number(agency.ratingAvg).toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            ({agency.reviewCount})
          </span>
        </span>
      </td>
      <td className="px-4 py-3">
        {agency.verificationLevel === "unverified" ? (
          <Badge variant="outline">—</Badge>
        ) : (
          <Badge variant="success">
            <CheckCircle2 size={10} className="mr-1" />
            {agency.verificationLevel.replace("_", " ")}
          </Badge>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/ajans/${agency.id}`}
          className="text-xs text-brand-500 hover:underline"
        >
          Düzenle
        </Link>
      </td>
    </tr>
  );
}
