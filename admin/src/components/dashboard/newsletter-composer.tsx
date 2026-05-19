"use client";

import { useState, useTransition } from "react";
import { Sparkles, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { composeDailyDigest, sendIssue } from "@/app/actions/newsletter";

interface Stats {
  confirmedCount: number;
}

export function NewsletterComposer({ stats }: { stats: Stats }) {
  const [isPending, startTransition] = useTransition();
  const [issueResult, setIssueResult] = useState<{
    issueId?: string;
    subject?: string;
    enqueued?: number;
    error?: string;
  } | null>(null);

  const handleCompose = () => {
    setIssueResult(null);
    startTransition(async () => {
      const res = await composeDailyDigest();
      if (!res.ok) {
        setIssueResult({ error: res.message });
        return;
      }
      const data = res.data as { issueId: string; subject: string };
      setIssueResult({ issueId: data.issueId, subject: data.subject });
    });
  };

  const handleSend = (id: string) => {
    startTransition(async () => {
      const res = await sendIssue(id);
      if (!res.ok) {
        setIssueResult((prev) => ({ ...(prev ?? {}), error: res.message }));
        return;
      }
      const data = res.data as { enqueued: number };
      setIssueResult((prev) => ({ ...(prev ?? {}), enqueued: data.enqueued }));
    });
  };

  return (
    <div className="space-y-6">
      {/* Abone istatistikleri */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Onaylı abone</span>
            <Mail size={18} className="text-brand-500" />
          </div>
          <div className="mt-3 text-3xl font-bold text-foreground">
            {stats.confirmedCount.toLocaleString("tr-TR")}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="text-sm text-muted-foreground">Hedef (12. ay)</div>
          <div className="mt-3 text-3xl font-bold text-muted-foreground">15.000</div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="text-sm text-muted-foreground">Open rate hedef</div>
          <div className="mt-3 text-3xl font-bold text-emerald-600">
            %38-45
          </div>
        </div>
      </div>

      {/* AI compose */}
      <div className="rounded-xl border bg-gradient-to-br from-brand-50 to-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Badge variant="accent" className="mb-2">
              <Sparkles size={12} className="mr-1" /> AI Compose
            </Badge>
            <h3 className="text-xl font-bold text-foreground">
              Günlük "Pazarlama 5" otomatik üret
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Son 24 saatte yayınlanan en yüksek viewCount'lı 5-10 makale
              alınır, AI ile günlük digest formatına dönüştürülür. Draft olarak
              kaydedilir — incele, sonra "Gönder" de.
            </p>
          </div>
          <Button onClick={handleCompose} disabled={isPending} size="lg">
            <Sparkles size={16} />
            {isPending ? "Üretiliyor..." : "AI ile üret"}
          </Button>
        </div>

        {issueResult?.error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
            {issueResult.error}
          </div>
        )}

        {issueResult?.issueId && (
          <div className="mt-4 rounded-md bg-emerald-50 p-4 dark:bg-emerald-950/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                  Draft hazır
                </div>
                <div className="mt-1 font-bold text-emerald-900 dark:text-emerald-200">
                  {issueResult.subject}
                </div>
                <div className="text-xs text-emerald-700">
                  ID: <code>{issueResult.issueId}</code>
                </div>
              </div>
              <Button
                variant="accent"
                size="lg"
                onClick={() => handleSend(issueResult.issueId!)}
                disabled={isPending || !!issueResult.enqueued}
              >
                <Send size={16} />
                {issueResult.enqueued
                  ? `${issueResult.enqueued} kuyrukta`
                  : isPending
                    ? "Gönderiliyor..."
                    : "Şimdi gönder"}
              </Button>
            </div>
            {issueResult.enqueued !== undefined && (
              <div className="mt-3 rounded-md bg-card p-3 text-sm text-emerald-900 dark:text-emerald-200">
                ✓ {issueResult.enqueued} aboneye gönderim BullMQ mail-delivery
                queue'sına eklendi. Worker process tarafından sıralı olarak
                gönderiliyor.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manuel compose CTA */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-bold text-foreground">Manuel compose</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sıfırdan kendi içeriğinle bir issue oluşturmak için (faz 2: WYSIWYG
          composer).
        </p>
      </div>
    </div>
  );
}
