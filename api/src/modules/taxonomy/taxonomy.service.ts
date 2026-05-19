import { Injectable, NotFoundException } from "@nestjs/common";
import { TagType } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { uniqueSlug } from "../../common/utils/slug";

@Injectable()
export class TaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Categories ───────────────────────────────────────────

  listCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
      include: { _count: { select: { articles: true, children: true } } },
    });
  }

  async createCategory(input: {
    name: string;
    slug?: string;
    description?: string;
    parentId?: string;
    seoTitle?: string;
    seoDescription?: string;
    orderIndex?: number;
  }) {
    const slug = await uniqueSlug(
      input.slug ?? input.name,
      async (s) =>
        !!(await this.prisma.category.findUnique({ where: { slug: s } })),
    );
    return this.prisma.category.create({
      data: {
        slug,
        name: input.name,
        description: input.description,
        parentId: input.parentId,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        orderIndex: input.orderIndex ?? 0,
      },
    });
  }

  async updateCategory(id: string, input: Partial<{
    name: string;
    description: string;
    parentId: string | null;
    seoTitle: string;
    seoDescription: string;
    orderIndex: number;
    isActive: boolean;
  }>) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Kategori bulunamadı");
    return this.prisma.category.update({ where: { id }, data: input });
  }

  async deleteCategory(id: string) {
    // Sadece deactivate — articles ilişkili kalsın
    await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
    return { ok: true };
  }

  // ─── Tags ─────────────────────────────────────────────────

  listTags(type?: TagType) {
    return this.prisma.tag.findMany({
      where: type ? { type } : undefined,
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    });
  }

  async createTag(input: { name: string; slug?: string; type?: TagType }) {
    const slug = await uniqueSlug(
      input.slug ?? input.name,
      async (s) =>
        !!(await this.prisma.tag.findUnique({ where: { slug: s } })),
    );
    return this.prisma.tag.create({
      data: { slug, name: input.name, type: input.type ?? "topic" },
    });
  }

  async deleteTag(id: string) {
    await this.prisma.tag.delete({ where: { id } });
    return { ok: true };
  }
}
