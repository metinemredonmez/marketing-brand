import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { uniqueSlug } from "../../common/utils/slug";

@Injectable()
export class ResearchPanelService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Member yönetimi ──────────────────────────────────────

  async joinPanel(
    userId: string,
    input: {
      roleType: string;
      companySize?: string;
      industry?: string;
      honorariumMethod?: string;
    },
  ) {
    const existing = await this.prisma.researchPanelMember.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException("Zaten panel üyesisiniz");
    }
    return this.prisma.researchPanelMember.create({
      data: {
        userId,
        roleType: input.roleType,
        companySize: input.companySize,
        industry: input.industry,
        honorariumMethod: input.honorariumMethod ?? "premium_credit",
      },
    });
  }

  async leavePanel(userId: string) {
    await this.prisma.researchPanelMember.update({
      where: { userId },
      data: { isActive: false },
    });
    return { ok: true };
  }

  listMembers(params: { roleType?: string; isActive?: boolean }) {
    return this.prisma.researchPanelMember.findMany({
      where: {
        ...(params.roleType ? { roleType: params.roleType } : {}),
        ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
      },
      orderBy: { joinedAt: "desc" },
    });
  }

  // ─── Survey yönetimi ──────────────────────────────────────

  async createSurvey(input: {
    title: string;
    slug?: string;
    questions: unknown;
    targetSegments?: string[];
  }) {
    const slug = await uniqueSlug(
      input.slug ?? input.title,
      async (s) =>
        !!(await this.prisma.researchSurvey.findUnique({ where: { slug: s } })),
    );
    return this.prisma.researchSurvey.create({
      data: {
        slug,
        title: input.title,
        questions: input.questions as Prisma.InputJsonValue,
        targetSegments: input.targetSegments ?? [],
      },
    });
  }

  async fieldSurvey(id: string) {
    return this.prisma.researchSurvey.update({
      where: { id },
      data: { fieldedAt: new Date() },
    });
  }

  async closeSurvey(id: string) {
    return this.prisma.researchSurvey.update({
      where: { id },
      data: { closedAt: new Date() },
    });
  }

  listSurveys() {
    return this.prisma.researchSurvey.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getSurvey(slug: string) {
    const s = await this.prisma.researchSurvey.findUnique({ where: { slug } });
    if (!s) throw new NotFoundException("Anket bulunamadı");
    return s;
  }

  // ─── Response submission ──────────────────────────────────

  async submitResponse(surveyId: string, userId: string, answers: unknown) {
    const survey = await this.prisma.researchSurvey.findUnique({
      where: { id: surveyId },
    });
    if (!survey) throw new NotFoundException("Anket bulunamadı");
    if (!survey.fieldedAt || (survey.closedAt && survey.closedAt < new Date())) {
      throw new BadRequestException("Anket aktif değil");
    }

    const member = await this.prisma.researchPanelMember.findUnique({
      where: { userId },
    });
    if (!member || !member.isActive) {
      throw new BadRequestException(
        "Panel üyesi değilsin — önce panele katıl",
      );
    }

    return this.prisma.$transaction([
      this.prisma.researchResponse.upsert({
        where: { surveyId_userId: { surveyId, userId } },
        update: { answers: answers as Prisma.InputJsonValue },
        create: {
          surveyId,
          userId,
          answers: answers as Prisma.InputJsonValue,
        },
      }),
      this.prisma.researchSurvey.update({
        where: { id: surveyId },
        data: { responseCount: { increment: 1 } },
      }),
    ]);
  }

  // ─── Aylık endeks raporu (basit aggregate) ────────────────

  async monthlyIndexSummary() {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const [activeMembers, surveysThisMonth, responsesThisMonth] =
      await Promise.all([
        this.prisma.researchPanelMember.count({ where: { isActive: true } }),
        this.prisma.researchSurvey.count({
          where: { fieldedAt: { gte: start } },
        }),
        this.prisma.researchResponse.count({
          where: { submittedAt: { gte: start } },
        }),
      ]);
    return {
      month: start.toISOString().slice(0, 7),
      activeMembers,
      surveysThisMonth,
      responsesThisMonth,
    };
  }
}
