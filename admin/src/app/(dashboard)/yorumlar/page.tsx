import { MessageSquare, Check, X, Flag } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/lib/i18n/server";

interface Comment {
  id: string;
  content: string;
  status: string;
  upvotes: number;
  reportedCount: number;
  createdAt: string;
  articleId: string;
  userId: string;
}

export default async function CommentsModerationPage() {
  let comments: Comment[] = [];
  try {
    comments = await apiFetch<Comment[]>("/admin/comments/queue");
  } catch {}
  const t = await getTranslations();
  const locale = t.locale === "en" ? "en-US" : "tr-TR";

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <MessageSquare size={24} /> {t("comments.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("comments.subtitle", { count: comments.length })}
        </p>
      </header>

      {comments.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-emerald-300" />
          <p className="mt-4 text-muted-foreground">{t("comments.empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 text-sm text-foreground">
                  {c.content}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={
                      c.status === "pending" ? "warning" : "destructive"
                    }
                  >
                    {c.status}
                  </Badge>
                  {c.reportedCount > 0 && (
                    <Badge variant="destructive">
                      <Flag size={10} className="mr-1" /> {c.reportedCount}{" "}
                      {t("comments.reportsLabel")}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>
                  👍 {c.upvotes} · Article:{" "}
                  <code>{c.articleId.slice(0, 8)}</code>
                </span>
                <span>{new Date(c.createdAt).toLocaleString(locale)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40">
                  <Check size={12} /> {t("comments.approve")}
                </button>
                <button className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-950/40">
                  <X size={12} /> {t("comments.rejectSpam")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
