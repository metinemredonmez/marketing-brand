import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(articleId: string, params: { limit?: number; offset?: number }) {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;

    const where: Prisma.CommentWhereInput = {
      articleId,
      status: "approved",
      parentId: null, // top-level
    };

    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          replies: {
            where: { status: "approved" },
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);
    return { items, total, limit, offset };
  }

  async create(input: {
    articleId: string;
    userId: string;
    content: string;
    parentId?: string;
  }) {
    const article = await this.prisma.article.findUnique({
      where: { id: input.articleId },
    });
    if (!article || article.deletedAt) {
      throw new NotFoundException("Makale bulunamadı");
    }
    if (input.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) throw new NotFoundException("Üst yorum bulunamadı");
    }
    if (input.content.trim().length < 5) {
      throw new BadRequestException("Yorum çok kısa");
    }

    return this.prisma.comment.create({
      data: {
        articleId: input.articleId,
        userId: input.userId,
        content: input.content.slice(0, 2000),
        parentId: input.parentId,
        // Auto-approve faz 1 (faz 2'de spam filter ile pending)
        status: CommentStatus.approved,
      },
    });
  }

  upvote(id: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
    });
  }

  report(id: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { reportedCount: { increment: 1 } },
    });
  }

  // ─── Admin ────────────────────────────────────────────────

  moderationQueue() {
    return this.prisma.comment.findMany({
      where: { OR: [{ status: "pending" }, { reportedCount: { gt: 2 } }] },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  setStatus(id: string, status: CommentStatus) {
    return this.prisma.comment.update({ where: { id }, data: { status } });
  }
}
