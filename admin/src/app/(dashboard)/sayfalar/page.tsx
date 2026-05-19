import Link from "next/link";
import { FileText, Plus, Globe2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PageRow {
  id: string;
  slug: string;
  locale: string;
  title: string | null;
  isPublished: boolean;
  updatedAt: string;
  updatedBy: { id: string; fullName: string } | null;
}

export default async function SayfalarPage() {
  let pages: PageRow[] = [];
  try {
    pages = await apiFetch<PageRow[]>("/admin/page-contents");
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <FileText size={24} /> Sayfalar (CMS)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Marketing sayfalarının block-tabanlı içerikleri. Web tarafı
            yayınlandığı an günceller (60s cache).
          </p>
        </div>
        <Button asChild>
          <Link href="/sayfalar/yeni">
            <Plus size={15} /> Yeni sayfa
          </Link>
        </Button>
      </header>

      {pages.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <FileText size={48} className="mx-auto text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            Henüz CMS sayfası yok.
          </p>
          <Button asChild className="mt-4">
            <Link href="/sayfalar/yeni">
              <Plus size={15} /> İlk sayfayı oluştur
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Başlık</th>
                <th className="px-4 py-3 font-semibold">Dil</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold">Güncelleme</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{p.slug}</td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {p.title ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="uppercase">
                      <Globe2 className="mr-1 h-3 w-3" />
                      {p.locale}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {p.isPublished ? (
                      <Badge variant="success">Yayında</Badge>
                    ) : (
                      <Badge variant="secondary">Taslak</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(p.updatedAt).toLocaleString("tr-TR")}
                    {p.updatedBy ? (
                      <span className="ml-1">· {p.updatedBy.fullName}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/sayfalar/${p.id}`}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      Düzenle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
