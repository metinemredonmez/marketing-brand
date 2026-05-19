import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { PageContentEditor } from "@/components/dashboard/page-content-editor";

interface PageDetail {
  id: string;
  slug: string;
  locale: string;
  title: string | null;
  blocks: Array<{ type: string; [k: string]: unknown }>;
  isPublished: boolean;
  updatedAt: string;
  updatedBy: { id: string; fullName: string; email: string } | null;
}

export default async function PageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let page: PageDetail;
  try {
    page = await apiFetch<PageDetail>(`/admin/page-contents/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/sayfalar"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Sayfalar
      </Link>

      <header className="mt-4 mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {page.title ?? page.slug}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <code className="font-mono text-xs">{page.slug}</code>
            <Badge variant="secondary" className="uppercase">
              {page.locale}
            </Badge>
            {page.isPublished ? (
              <Badge variant="success">Yayında</Badge>
            ) : (
              <Badge variant="secondary">Taslak</Badge>
            )}
          </div>
        </div>
      </header>

      <PageContentEditor page={page} />
    </div>
  );
}
