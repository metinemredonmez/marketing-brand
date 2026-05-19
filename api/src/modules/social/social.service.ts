import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  SocialChannel,
  SocialPostFormat,
  SocialPostStatus,
} from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Draft post oluştur (AI Studio çıktısından beslenir).
   * Yayınlama BullMQ worker'da yapılır (faz 5'te).
   */
  async createDraft(input: {
    articleId?: string;
    channel: SocialChannel;
    format: SocialPostFormat;
    content: unknown;
    mediaUrls?: string[];
    scheduledAt?: Date;
    createdById?: string;
  }) {
    return this.prisma.socialPost.create({
      data: {
        articleId: input.articleId,
        channel: input.channel,
        format: input.format,
        content: input.content as Prisma.InputJsonValue,
        mediaUrls: input.mediaUrls ?? [],
        scheduledAt: input.scheduledAt,
        status: input.scheduledAt ? "scheduled" : "draft",
        createdById: input.createdById,
      },
    });
  }

  async schedule(id: string, when: Date) {
    return this.prisma.socialPost.update({
      where: { id },
      data: { scheduledAt: when, status: "scheduled" },
    });
  }

  async markPublished(id: string, externalId?: string) {
    return this.prisma.socialPost.update({
      where: { id },
      data: { status: "published", publishedAt: new Date(), externalId },
    });
  }

  async markFailed(id: string, errorMessage: string) {
    return this.prisma.socialPost.update({
      where: { id },
      data: { status: "failed", errorMessage },
    });
  }

  list(params: {
    channel?: SocialChannel;
    status?: SocialPostStatus;
    articleId?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(params.limit ?? 30, 100);
    const offset = params.offset ?? 0;
    return this.prisma.socialPost.findMany({
      where: {
        ...(params.channel ? { channel: params.channel } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.articleId ? { articleId: params.articleId } : {}),
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string) {
    const post = await this.prisma.socialPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException("Post bulunamadı");
    return post;
  }

  /** Article + 8 format AI output'undan toplu draft oluştur */
  async createDraftsFromAiOutput(input: {
    articleId: string;
    linkedinPost?: unknown;
    instagramCarousel?: unknown;
    reelsScript?: unknown;
    createdById?: string;
  }) {
    const drafts = [];
    if (input.linkedinPost) {
      drafts.push(
        await this.createDraft({
          articleId: input.articleId,
          channel: "linkedin",
          format: "text_post",
          content: input.linkedinPost,
          createdById: input.createdById,
        }),
      );
    }
    if (input.instagramCarousel) {
      drafts.push(
        await this.createDraft({
          articleId: input.articleId,
          channel: "instagram",
          format: "carousel",
          content: input.instagramCarousel,
          createdById: input.createdById,
        }),
      );
    }
    if (input.reelsScript) {
      drafts.push(
        await this.createDraft({
          articleId: input.articleId,
          channel: "instagram",
          format: "reels",
          content: input.reelsScript,
          createdById: input.createdById,
        }),
      );
    }
    return drafts;
  }
}
