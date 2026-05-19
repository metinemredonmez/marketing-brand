import { Injectable, NotFoundException } from "@nestjs/common";
import { AgencyTier, Prisma } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { uniqueSlug } from "../../common/utils/slug";
import { CreateAgencyDto } from "./dto/create-agency.dto";

@Injectable()
export class AgenciesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public list ──────────────────────────────────────────

  async list(params: {
    limit?: number;
    offset?: number;
    tier?: AgencyTier;
    city?: string;
    service?: string;
    q?: string;
  }) {
    const limit = Math.min(params.limit ?? 24, 100);
    const offset = params.offset ?? 0;

    const where: Prisma.AgencyWhereInput = { isActive: true };
    if (params.tier) where.tier = params.tier;
    if (params.city) where.city = params.city;
    if (params.service) where.services = { has: params.service };
    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: "insensitive" } },
        { description: { contains: params.q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.agency.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          // Featured/elite önce
          { tier: "desc" },
          { ratingAvg: "desc" },
          { reviewCount: "desc" },
        ],
      }),
      this.prisma.agency.count({ where }),
    ]);
    return { items, total, limit, offset };
  }

  async getBySlug(slug: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { slug },
    });
    if (!agency || !agency.isActive) {
      throw new NotFoundException("Ajans bulunamadı");
    }
    return agency;
  }

  async getById(id: string) {
    const agency = await this.prisma.agency.findUnique({ where: { id } });
    if (!agency) throw new NotFoundException("Ajans bulunamadı");
    return agency;
  }

  /** Yıllık "Top 50 Türkiye Ajansları" — review tabanlı ranking */
  async topRanking(limit = 50) {
    return this.prisma.agency.findMany({
      where: {
        isActive: true,
        reviewCount: { gte: 3 }, // minimum 3 review
      },
      take: limit,
      orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
    });
  }

  // ─── Admin CRUD ───────────────────────────────────────────

  async create(dto: CreateAgencyDto) {
    const slug = await uniqueSlug(
      dto.slug ?? dto.name,
      async (s) => !!(await this.prisma.agency.findUnique({ where: { slug: s } })),
    );
    return this.prisma.agency.create({
      data: {
        slug,
        name: dto.name,
        tagline: dto.tagline,
        description: dto.description,
        logoUrl: dto.logoUrl,
        coverUrl: dto.coverUrl,
        foundedYear: dto.foundedYear,
        teamSizeRange: dto.teamSizeRange,
        city: dto.city,
        country: dto.country ?? "TR",
        website: dto.website,
        email: dto.email,
        phone: dto.phone,
        linkedinUrl: dto.linkedinUrl,
        instagramUrl: dto.instagramUrl,
        services: dto.services ?? [],
        industries: dto.industries ?? [],
        clientReferences: dto.clientReferences ?? [],
        tier: dto.tier ?? "free",
      },
    });
  }

  async update(id: string, dto: Partial<CreateAgencyDto>) {
    const exists = await this.prisma.agency.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Ajans bulunamadı");
    return this.prisma.agency.update({ where: { id }, data: dto });
  }

  async setTier(id: string, tier: AgencyTier, durationMonths = 12) {
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + durationMonths);
    return this.prisma.agency.update({
      where: { id },
      data: { tier, tierStartsAt: startsAt, tierEndsAt: endsAt },
    });
  }

  async deactivate(id: string) {
    await this.prisma.agency.update({
      where: { id },
      data: { isActive: false },
    });
    return { ok: true };
  }

  /** Review eklendiğinde / silindiğinde cached rating recalculate */
  async refreshAggregates(agencyId: string) {
    const result = await this.prisma.agencyReview.aggregate({
      where: {
        agencyId,
        publicationStatus: "published",
      },
      _avg: { ratingOverall: true },
      _count: true,
    });
    await this.prisma.agency.update({
      where: { id: agencyId },
      data: {
        ratingAvg: result._avg.ratingOverall
          ? Number(result._avg.ratingOverall.toFixed(2))
          : 0,
        reviewCount: result._count,
      },
    });
  }
}
