import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  CreditCard,
  Bookmark,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { apiFetch, getCurrentUser } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

interface SubscriptionData {
  current: {
    id: string;
    tier: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  history: Array<{
    id: string;
    tier: string;
    status: string;
    startedAt: string | null;
  }>;
}

interface BookmarkItem {
  id: string;
  articleId: string | null;
  agencyId: string | null;
  jobId: string | null;
  reportId: string | null;
  createdAt: string;
  notes: string | null;
}

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/me");

  let subscription: SubscriptionData = { current: null, history: [] };
  let bookmarks: BookmarkItem[] = [];
  try {
    subscription = await apiFetch<SubscriptionData>("/subscriptions/me");
  } catch {}
  try {
    bookmarks = await apiFetch<BookmarkItem[]>("/bookmarks?limit=10");
  } catch {}

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold text-foreground">
          <User size={28} />
          Merhaba, {user.fullName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subscription kartı */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <CreditCard size={18} /> Premium üyelik
          </h2>

          {subscription.current ? (
            <div className="mt-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <Badge variant="success">
                  {subscription.current.tier.toUpperCase()}
                </Badge>
                <Badge>{subscription.current.status}</Badge>
              </div>
              {subscription.current.currentPeriodEnd && (
                <div className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">
                  {subscription.current.cancelAtPeriodEnd
                    ? "Dönem sonunda iptal: "
                    : "Yenilenecek: "}
                  {new Date(
                    subscription.current.currentPeriodEnd,
                  ).toLocaleDateString("tr-TR")}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/me/abonelik">Yönet</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border bg-gradient-to-br from-brand-50 to-white p-5 text-center">
              <AlertCircle size={32} className="mx-auto text-brand-500" />
              <h3 className="mt-2 font-bold text-foreground">
                Henüz premium üye değilsin
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Haftalık deep dive analiz + CMO Club Slack + Türkiye Pazarlama
                Endeksi.
              </p>
              <Button asChild variant="accent" className="mt-4">
                <Link href="/premium">Tarifeleri gör</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Newsletter durumu */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Mail size={18} /> Newsletter
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            "Pazarlama 5" günlük bültenine abone ol — her sabah 08:30.
          </p>
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link href="/#newsletter">Abone ol</Link>
          </Button>
        </div>

        {/* Bookmarks */}
        <div className="lg:col-span-3 rounded-xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Bookmark size={18} /> Kayıtlı içerikler
          </h2>
          {bookmarks.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Henüz kayıtlı içerik yok. Makaleyi okurken "yer imine ekle"
              butonunu kullan.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {bookmarks.map((b) => (
                <li key={b.id} className="flex items-center gap-2 text-foreground/80">
                  <Bookmark size={12} className="text-brand-500" />
                  {b.articleId && <span>Makale: {b.articleId.slice(0, 8)}</span>}
                  {b.agencyId && <span>Ajans: {b.agencyId.slice(0, 8)}</span>}
                  {b.jobId && <span>İş ilanı: {b.jobId.slice(0, 8)}</span>}
                  {b.reportId && <span>Rapor: {b.reportId.slice(0, 8)}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Hesap aksiyonlar */}
      <div className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">Hesap</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/me/export">Verilerimi indir (KVKK)</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/me/sil">Hesabımı sil</Link>
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Çıkış yap
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
