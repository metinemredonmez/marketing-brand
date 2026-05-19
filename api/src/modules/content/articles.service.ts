import { Injectable, NotFoundException } from "@nestjs/common";
import { ArticleStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { RedisService } from "../../shared/redis/redis.service";
import { createHash } from "crypto";

const LIST_CACHE_TTL = 60;
const DETAIL_CACHE_TTL = 300;

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async list(params: {
    limit?: number;
    offset?: number;
    category?: string;
    status?: ArticleStatus;
  }) {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;

    const cacheKey = `articles:list:${createHash("md5")
      .update(JSON.stringify({ limit, offset, ...params }))
      .digest("hex")}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const where: Prisma.ArticleWhereInput = {
      status: params.status ?? ArticleStatus.published,
      deletedAt: null,
    };
    if (params.category) where.category = { slug: params.category };

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          spot: true,
          coverUrl: true,
          publishedAt: true,
          readingTime: true,
          isPremium: true,
          isSponsored: true,
          sponsorLabel: true,
          category: { select: { slug: true, name: true } },
          author: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    const result = { items, total, limit, offset };
    await this.redis.set(cacheKey, result, LIST_CACHE_TTL);
    return result;
  }

  async getBySlug(slug: string) {
    const cacheKey = `articles:detail:${slug}`;
    const cached = await this.redis.get<{ id: string }>(cacheKey);
    if (cached) {
      // View count'u cache hit'inde de say (Redis counter, batch sync için)
      this.bumpViewCounter(cached.id).catch(() => undefined);
      return cached;
    }

    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            linkedinUrl: true,
            bio: true,
          },
        },
        tags: { include: { tag: true } },
      },
    });

    if (!article || article.deletedAt) {
      throw new NotFoundException("Makale bulunamadı");
    }

    await this.redis.set(cacheKey, article, DETAIL_CACHE_TTL);
    this.bumpViewCounter(article.id).catch(() => undefined);
    return article;
  }

  /**
   * Redis'te view counter — batch ile DB'ye sync edilir (faz 2'de cron).
   * Şu an basit: in-memory counter, threshold'da flush yapacağız.
   */
  private async bumpViewCounter(articleId: string): Promise<void> {
    await this.redis.client.hincrby("articles:views:pending", articleId, 1);
  }
}
