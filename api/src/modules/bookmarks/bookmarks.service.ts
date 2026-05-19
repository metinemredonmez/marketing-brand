import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";

export interface BookmarkInput {
  articleId?: string;
  agencyId?: string;
  jobId?: string;
  reportId?: string;
  notes?: string;
}

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, input: BookmarkInput) {
    const fields = [
      input.articleId && { articleId: input.articleId },
      input.agencyId && { agencyId: input.agencyId },
      input.jobId && { jobId: input.jobId },
      input.reportId && { reportId: input.reportId },
    ].filter(Boolean);

    if (fields.length !== 1) {
      throw new BadRequestException(
        "Tek bir kaynak gerekli (articleId / agencyId / jobId / reportId)",
      );
    }
    const where: Prisma.BookmarkWhereInput = { userId, ...fields[0] };
    const existing = await this.prisma.bookmark.findFirst({ where });
    if (existing) {
      await this.prisma.bookmark.delete({ where: { id: existing.id } });
      return { ok: true, bookmarked: false };
    }
    await this.prisma.bookmark.create({
      data: { userId, notes: input.notes, ...fields[0] },
    });
    return { ok: true, bookmarked: true };
  }

  list(userId: string, params: { limit?: number; offset?: number }) {
    const limit = Math.min(params.limit ?? 30, 100);
    const offset = params.offset ?? 0;
    return this.prisma.bookmark.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }
}
