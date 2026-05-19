import { Injectable, NotFoundException } from "@nestjs/common";
import {
  EmploymentType,
  JobPlan,
  JobStatus,
  Prisma,
  SeniorityLevel,
} from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { uniqueSlug } from "../../common/utils/slug";

export interface CreateJobInput {
  title: string;
  slug?: string;
  description: string;
  companyName: string;
  employerBrandId?: string;
  category: string;
  seniority: SeniorityLevel;
  employmentType: EmploymentType;
  location?: string;
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  applyUrl?: string;
  applyEmail?: string;
  plan?: JobPlan;
}

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public list ──────────────────────────────────────────

  async list(params: {
    limit?: number;
    offset?: number;
    category?: string;
    seniority?: SeniorityLevel;
    isRemote?: boolean;
    q?: string;
  }) {
    const limit = Math.min(params.limit ?? 30, 100);
    const offset = params.offset ?? 0;

    const now = new Date();
    const where: Prisma.JobPostWhereInput = {
      status: "active",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    };
    if (params.category) where.category = params.category;
    if (params.seniority) where.seniority = params.seniority;
    if (params.isRemote !== undefined) where.isRemote = params.isRemote;
    if (params.q) {
      where.AND = [
        {
          OR: [
            { title: { contains: params.q, mode: "insensitive" } },
            { description: { contains: params.q, mode: "insensitive" } },
            { companyName: { contains: params.q, mode: "insensitive" } },
          ],
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.jobPost.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { plan: "desc" }, // featured/premium önce
          { publishedAt: "desc" },
        ],
      }),
      this.prisma.jobPost.count({ where }),
    ]);
    return { items, total, limit, offset };
  }

  async getBySlug(slug: string) {
    const job = await this.prisma.jobPost.findUnique({
      where: { slug },
      include: { employerBrand: true },
    });
    if (!job || job.status !== "active") {
      throw new NotFoundException("İş ilanı bulunamadı");
    }
    // view count async
    this.prisma.jobPost
      .update({ where: { id: job.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => undefined);
    return job;
  }

  // ─── Admin ────────────────────────────────────────────────

  async create(input: CreateJobInput) {
    const slug = await uniqueSlug(
      input.slug ?? `${input.title}-${input.companyName}`,
      async (s) =>
        !!(await this.prisma.jobPost.findUnique({ where: { slug: s } })),
    );

    // 30 gün varsayılan
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return this.prisma.jobPost.create({
      data: {
        slug,
        title: input.title,
        description: input.description,
        companyName: input.companyName,
        employerBrandId: input.employerBrandId,
        category: input.category,
        seniority: input.seniority,
        employmentType: input.employmentType,
        location: input.location,
        isRemote: input.isRemote ?? false,
        salaryMin: input.salaryMin,
        salaryMax: input.salaryMax,
        currency: input.currency ?? "TRY",
        applyUrl: input.applyUrl,
        applyEmail: input.applyEmail,
        plan: input.plan ?? "basic",
        publishedAt: new Date(),
        expiresAt,
        status: "active",
      },
    });
  }

  async update(id: string, input: Partial<CreateJobInput>) {
    return this.prisma.jobPost.update({ where: { id }, data: input });
  }

  async withdraw(id: string) {
    return this.prisma.jobPost.update({
      where: { id },
      data: { status: "withdrawn" },
    });
  }

  async markFilled(id: string) {
    return this.prisma.jobPost.update({
      where: { id },
      data: { status: "filled" },
    });
  }

  /** Apply click tracking */
  async trackApply(id: string) {
    await this.prisma.jobPost.update({
      where: { id },
      data: { applyCount: { increment: 1 } },
    });
    return { ok: true };
  }

  /** Admin list — tüm statuslar */
  async adminList(params: { status?: JobStatus; limit?: number; offset?: number }) {
    const limit = Math.min(params.limit ?? 30, 100);
    const offset = params.offset ?? 0;
    const where: Prisma.JobPostWhereInput = {};
    if (params.status) where.status = params.status;

    const [items, total] = await Promise.all([
      this.prisma.jobPost.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.jobPost.count({ where }),
    ]);
    return { items, total, limit, offset };
  }
}
