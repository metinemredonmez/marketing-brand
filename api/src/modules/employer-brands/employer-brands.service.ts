import { Injectable, NotFoundException } from "@nestjs/common";
import { EmployerBrandPlan } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { uniqueSlug } from "../../common/utils/slug";

@Injectable()
export class EmployerBrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.employerBrand.findMany({
      where: { isActive: true },
      orderBy: { plan: "desc" },
      include: {
        _count: { select: { jobs: { where: { status: "active" } } } },
      },
    });
  }

  async getBySlug(slug: string) {
    const brand = await this.prisma.employerBrand.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: { status: "active" },
          orderBy: { publishedAt: "desc" },
        },
      },
    });
    if (!brand || !brand.isActive) {
      throw new NotFoundException("Employer brand bulunamadı");
    }
    return brand;
  }

  async create(input: {
    companyName: string;
    slug?: string;
    tagline?: string;
    about?: string;
    plan?: EmployerBrandPlan;
  }) {
    const slug = await uniqueSlug(
      input.slug ?? input.companyName,
      async (s) =>
        !!(await this.prisma.employerBrand.findUnique({ where: { slug: s } })),
    );
    return this.prisma.employerBrand.create({
      data: {
        slug,
        companyName: input.companyName,
        tagline: input.tagline,
        about: input.about,
        plan: input.plan ?? "starter",
      },
    });
  }

  async update(id: string, input: Record<string, unknown>) {
    return this.prisma.employerBrand.update({ where: { id }, data: input });
  }

  async setPlan(
    id: string,
    plan: EmployerBrandPlan,
    durationMonths = 12,
  ) {
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + durationMonths);
    return this.prisma.employerBrand.update({
      where: { id },
      data: { plan, planStartsAt: startsAt, planEndsAt: endsAt },
    });
  }
}
