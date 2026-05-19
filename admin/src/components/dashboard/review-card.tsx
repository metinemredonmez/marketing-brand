"use client";

import { useState, useTransition } from "react";
import { Check, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { approveReview, rejectReview } from "@/app/actions/reviews";

interface Review {
  id: string;
  reviewerName: string;
  reviewerRole: string | null;
  reviewerCompany: string | null;
  reviewerLinkedin: string | null;
  reviewerEmail: string;
  ratingOverall: number;
  title: string;
  content: string;
  pros: string | null;
  cons: string | null;
  similarityScore: number | null;
  verificationStatus: string;
  createdAt: string;
  agency: { id: string; name: string; slug: string };
}

export function ReviewCard({ review }: { review: Review }) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  const handleApprove = (upgrade: boolean) => {
    startTransition(async () => {
      const res = await approveReview(review.id, upgrade);
      if (res.ok) setRemoved(true);
    });
  };

  const handleReject = () => {
    if (rejectNotes.trim().length < 5) return;
    startTransition(async () => {
      const res = await rejectReview(review.id, rejectNotes);
      if (res.ok) setRemoved(true);
    });
  };

  const isSuspicious =
    review.similarityScore && Number(review.similarityScore) > 0.6;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground">{review.title}</h3>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < review.ratingOverall
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }
                />
              ))}
            </div>
          </div>
          <div className="mt-1 text-sm">
            <span className="font-medium text-foreground">
              {review.reviewerName}
            </span>
            {review.reviewerRole && (
              <span className="text-muted-foreground">
                {" "}
                · {review.reviewerRole}
              </span>
            )}
            {review.reviewerCompany && (
              <span className="text-muted-foreground">
                {" "}
                @ {review.reviewerCompany}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{review.reviewerEmail}</span>
            {review.reviewerLinkedin && (
              <a
                href={review.reviewerLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:underline"
              >
                LinkedIn ↗
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline">{review.agency.name}</Badge>
          <Badge
            variant={
              review.verificationStatus === "email_verified"
                ? "success"
                : "warning"
            }
          >
            {review.verificationStatus}
          </Badge>
          {isSuspicious && (
            <Badge variant="destructive">
              ⚠ Benzerlik {Number(review.similarityScore).toFixed(2)}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-md bg-muted p-3 text-sm text-foreground">
        {review.content}
      </div>

      {(review.pros || review.cons) && (
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
          {review.pros && (
            <div className="rounded-md bg-emerald-50 p-3 dark:bg-emerald-950/40">
              <div className="font-medium text-emerald-900 dark:text-emerald-200">👍 Beğenilenler</div>
              <div className="mt-1 text-emerald-800 dark:text-emerald-300">{review.pros}</div>
            </div>
          )}
          {review.cons && (
            <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-950/40">
              <div className="font-medium text-amber-900 dark:text-amber-200">⚠ Geliştirme</div>
              <div className="mt-1 text-amber-800 dark:text-amber-300">{review.cons}</div>
            </div>
          )}
        </div>
      )}

      {showReject ? (
        <div className="mt-4 space-y-2 rounded-md bg-red-50 p-3 dark:bg-red-950/40">
          <Textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="Reddetme sebebini yaz (reviewer'a iletilir)..."
            rows={2}
            className="bg-card"
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={isPending || rejectNotes.length < 5}
            >
              <X size={14} /> Reddetmeyi onayla
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReject(false)}
              disabled={isPending}
            >
              İptal
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-2 border-t pt-3">
          <Button
            size="sm"
            onClick={() => handleApprove(false)}
            disabled={isPending}
          >
            <Check size={14} /> Onayla & yayınla
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleApprove(true)}
            disabled={isPending}
          >
            <Check size={14} /> Onayla + tam doğrulandı
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowReject(true)}
            disabled={isPending}
          >
            <X size={14} /> Reddet
          </Button>
        </div>
      )}
    </div>
  );
}
