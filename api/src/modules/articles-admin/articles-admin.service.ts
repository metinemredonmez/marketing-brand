import { Injectable, NotFoundException } from "@nestjs/common";
import { ArticleStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { RedisService } from "../../shared/redis/redis.service";
import { uniqueSlug } from "../../common/utils/slug";
import { CreateArticleDto } from "./dto/create-article.dto";

@Injectable()
export class ArticlesAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ─── List/Get ─────────────────────────────────────────────

  async list(params: {
    limit?: number;
    offset?: number;
    status?: ArticleStatus;
    categoryId?: string;
    authorId?: string;
    q?: string;
  }) {
    const limit = Math.min(params.limit ?? 30, 100);
    const offset = params.offset ?? 0;

    const where: Prisma.ArticleWhereInput = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.authorId) where.authorId = params.authorId;
    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: "insensitive" } },
        { slug: { contains: params.q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          isPremium: true,
          isSponsored: true,
          publishedAt: true,
          scheduledAt: true,
          updatedAt: true,
          viewCount: true,
          category: { select: { slug: true, name: true } },
          author: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  async getById(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
    });
    if (!article || article.deletedAt) {
      throw new NotFoundException("Makale bulunamadı");
    }
    return article;
  }

  // ─── Create ───────────────────────────────────────────────

  async create(dto: CreateArticleDto, authorId: string) {
    const slug = await uniqueSlug(
      dto.slug ?? dto.title,
      async (s) =>
        !!(await this.prisma.article.findUnique({ where: { slug: s } })),
    );

    const article = await this.prisma.article.create({
      data: {
        slug,
        title: dto.title,
        spot: dto.spot,
        body: dto.body,
        coverUrl: dto.coverUrl,
        coverAlt: dto.coverAlt,
        categoryId: dto.categoryId,
        authorId,
        readingTime: dto.readingTime,
        aiSummary: dto.aiSummary,
        aiWhyMatters: dto.aiWhyMatters,
        aiBrandTakeaways: dto.aiBrandTakeaways
          ? (dto.aiBrandTakeaways as Prisma.InputJsonValue)
          : undefined,
        aiAgencyTakeaways: dto.aiAgencyTakeaways
          ? (dto.aiAgencyTakeaways as Prisma.InputJsonValue)
          : undefined,
        aiTrAdaptation: dto.aiTrAdaptation,
        aiHumanRatio: dto.aiHumanRatio,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        canonicalUrl: dto.canonicalUrl,
        ogImageUrl: dto.ogImageUrl,
        isPremium: dto.isPremium ?? false,
        isSponsored: dto.isSponsored ?? false,
        sponsorLabel: dto.sponsorLabel,
        sourceUrl: dto.sourceUrl,
        sourceName: dto.sourceName,
        status: dto.status ?? ArticleStatus.draft,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        publishedAt:
          dto.status === ArticleStatus.published ? new Date() : undefined,
        ...(dto.tagIds && dto.tagIds.length > 0
          ? {
              tags: {
                create: dto.tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
    });

    await this.invalidateCache();
    return article;
  }

  // ─── Update ───────────────────────────────────────────────

  async update(id: string, dto: Partial<CreateArticleDto>) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException("Makale bulunamadı");
    }

    const data: Prisma.ArticleUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.spot !== undefined) data.spot = dto.spot;
    if (dto.body !== undefined) data.body = dto.body;
    if (dto.coverUrl !== undefined) data.coverUrl = dto.coverUrl;
    if (dto.coverAlt !== undefined) data.coverAlt = dto.coverAlt;
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }
    if (dto.readingTime !== undefined) data.readingTime = dto.readingTime;
    if (dto.aiSummary !== undefined) data.aiSummary = dto.aiSummary;
    if (dto.aiWhyMatters !== undefined) data.aiWhyMatters = dto.aiWhyMatters;
    if (dto.aiBrandTakeaways !== undefined) {
      data.aiBrandTakeaways = dto.aiBrandTakeaways as Prisma.InputJsonValue;
    }
    if (dto.aiAgencyTakeaways !== undefined) {
      data.aiAgencyTakeaways = dto.aiAgencyTakeaways as Prisma.InputJsonValue;
    }
    if (dto.aiTrAdaptation !== undefined) {
      data.aiTrAdaptation = dto.aiTrAdaptation;
    }
    if (dto.aiHumanRatio !== undefined) data.aiHumanRatio = dto.aiHumanRatio;
    if (dto.seoTitle !== undefined) data.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) {
      data.seoDescription = dto.seoDescription;
    }
    if (dto.canonicalUrl !== undefined) data.canonicalUrl = dto.canonicalUrl;
    if (dto.ogImageUrl !== undefined) data.ogImageUrl = dto.ogImageUrl;
    if (dto.isPremium !== undefined) data.isPremium = dto.isPremium;
    if (dto.isSponsored !== undefined) data.isSponsored = dto.isSponsored;
    if (dto.sponsorLabel !== undefined) data.sponsorLabel = dto.sponsorLabel;
    if (dto.sourceUrl !== undefined) data.sourceUrl = dto.sourceUrl;
    if (dto.sourceName !== undefined) data.sourceName = dto.sourceName;
    if (dto.scheduledAt !== undefined) {
      data.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    }

    const article = await this.prisma.article.update({
      where: { id },
      data,
    });

    // Tag güncellemesi (varsa)
    if (dto.tagIds) {
      await this.prisma.articleTag.deleteMany({ where: { articleId: id } });
      if (dto.tagIds.length > 0) {
        await this.prisma.articleTag.createMany({
          data: dto.tagIds.map((tagId) => ({ articleId: id, tagId })),
        });
      }
    }

    await this.invalidateCache(article.slug);
    return article;
  }

  // ─── Status transitions ───────────────────────────────────

  async publish(id: string) {
    const article = await this.prisma.article.update({
      where: { id },
      data: { status: "published", publishedAt: new Date() },
    });
    await this.invalidateCache(article.slug);
    return article;
  }

  async unpublish(id: string) {
    const article = await this.prisma.article.update({
      where: { id },
      data: { status: "draft" },
    });
    await this.invalidateCache(article.slug);
    return article;
  }

  async schedule(id: string, when: Date) {
    const article = await this.prisma.article.update({
      where: { id },
      data: { status: "scheduled", scheduledAt: when },
    });
    await this.invalidateCache(article.slug);
    return article;
  }

  async softDelete(id: string) {
    const article = await this.prisma.article.update({
      where: { id },
      data: { deletedAt: new Date(), status: "archived" },
    });
    await this.invalidateCache(article.slug);
    return { ok: true };
  }

  // ─── Cache invalidation ───────────────────────────────────

  private async invalidateCache(slug?: string) {
    try {
      // Liste cache'lerini sil
      const pattern = "articles:list:*";
      let cursor = "0";
      do {
        const result = await this.redis.client.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100,
        );
        cursor = result[0];
        const keys = result[1];
        if (keys.length > 0) {
          await this.redis.client.del(...keys);
        }
      } while (cursor !== "0");

      if (slug) {
        await this.redis.del(`articles:detail:${slug}`);
      }
    } catch {
      // best-effort
    }
  }
}
