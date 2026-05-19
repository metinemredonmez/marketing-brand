import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service";

export interface BlockBase {
  type: string;
  [k: string]: unknown;
}

@Injectable()
export class PageContentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public read — sayfa render'ı için */
  async get(slug: string, locale = "tr") {
    const page = await this.prisma.pageContent.findUnique({
      where: { slug_locale: { slug, locale } },
      select: {
        slug: true,
        locale: true,
        title: true,
        blocks: true,
        isPublished: true,
        updatedAt: true,
      },
    });
    if (!page || !page.isPublished) return null;
    return page;
  }

  /** Admin list — taslaklar dahil */
  async adminList() {
    return this.prisma.pageContent.findMany({
      orderBy: [{ slug: "asc" }, { locale: "asc" }],
      select: {
        id: true,
        slug: true,
        locale: true,
        title: true,
        isPublished: true,
        updatedAt: true,
        updatedBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async adminGet(id: string) {
    const page = await this.prisma.pageContent.findUnique({
      where: { id },
      include: {
        updatedBy: { select: { id: true, fullName: true, email: true } },
      },
    });
    if (!page) throw new NotFoundException("page_not_found");
    return page;
  }

  /** Admin create */
  async adminCreate(
    actorId: string,
    data: {
      slug: string;
      locale: string;
      title?: string | null;
      blocks: BlockBase[];
      isPublished?: boolean;
    },
  ) {
    return this.prisma.pageContent.create({
      data: {
        slug: data.slug,
        locale: data.locale,
        title: data.title ?? null,
        blocks: data.blocks as unknown as object,
        isPublished: data.isPublished ?? true,
        updatedById: actorId,
      },
    });
  }

  async adminUpdate(
    id: string,
    actorId: string,
    data: {
      title?: string | null;
      blocks?: BlockBase[];
      isPublished?: boolean;
    },
  ) {
    const existing = await this.prisma.pageContent.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException("page_not_found");
    return this.prisma.pageContent.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.blocks !== undefined
          ? { blocks: data.blocks as unknown as object }
          : {}),
        ...(data.isPublished !== undefined
          ? { isPublished: data.isPublished }
          : {}),
        updatedById: actorId,
      },
    });
  }

  async adminDelete(id: string) {
    const existing = await this.prisma.pageContent.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException("page_not_found");
    await this.prisma.pageContent.delete({ where: { id } });
    return { ok: true };
  }
}
