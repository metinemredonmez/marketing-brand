import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service";

/**
 * Birleşik arama — articles + agencies + jobs + courses.
 * Postgres FTS ileride (tsvector + GIN index ile), şu an ILIKE.
 */
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async global(q: string, limit = 5) {
    if (!q || q.trim().length < 2) {
      return { articles: [], agencies: [], jobs: [], courses: [] };
    }
    const term = q.trim();

    const [articles, agencies, jobs, courses] = await Promise.all([
      this.prisma.article.findMany({
        where: {
          status: "published",
          deletedAt: null,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { spot: { contains: term, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          spot: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: "desc" },
      }),
      this.prisma.agency.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          tier: true,
          ratingAvg: true,
        },
        orderBy: { ratingAvg: "desc" },
      }),
      this.prisma.jobPost.findMany({
        where: {
          status: "active",
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { companyName: { contains: term, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          companyName: true,
          location: true,
          isRemote: true,
        },
        orderBy: { publishedAt: "desc" },
      }),
      this.prisma.course.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: { id: true, slug: true, title: true, subtitle: true },
      }),
    ]);

    return { articles, agencies, jobs, courses };
  }
}
