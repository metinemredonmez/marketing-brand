import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CohortStatus,
  CourseFormat,
  CourseLevel,
  EnrollmentStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { uniqueSlug } from "../../common/utils/slug";

export interface CreateCourseInput {
  title: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  format: CourseFormat;
  level?: CourseLevel;
  durationWeeks?: number;
  priceTry: number;
  priceUsd?: number;
  earlyBirdPriceTry?: number;
  capacity?: number;
  syllabus?: unknown;
  outcomes?: string[];
  prerequisites?: string[];
}

export interface CreateCohortInput {
  cohortNumber: number;
  startDate: Date;
  endDate: Date;
  capacity?: number;
  zoomLink?: string;
}

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public ───────────────────────────────────────────────

  listActive() {
    return this.prisma.course.findMany({
      where: { isActive: true },
      include: {
        cohorts: {
          where: { status: { in: ["open", "in_progress"] } },
          orderBy: { startDate: "asc" },
          take: 3,
        },
      },
    });
  }

  async getBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        cohorts: { orderBy: { startDate: "asc" } },
      },
    });
    if (!course || !course.isActive) {
      throw new NotFoundException("Kurs bulunamadı");
    }
    return course;
  }

  // ─── Enrollment ───────────────────────────────────────────

  async enroll(cohortId: string, userId: string) {
    const cohort = await this.prisma.courseCohort.findUnique({
      where: { id: cohortId },
    });
    if (!cohort) throw new NotFoundException("Kohort bulunamadı");
    if (cohort.status !== "open") {
      throw new BadRequestException("Bu kohort başvurulara açık değil");
    }
    if (cohort.capacity && cohort.enrolledCount >= cohort.capacity) {
      throw new BadRequestException("Kohort doldu");
    }

    const existing = await this.prisma.courseEnrollment.findUnique({
      where: { cohortId_userId: { cohortId, userId } },
    });
    if (existing) {
      throw new BadRequestException("Zaten kayıtlısınız");
    }

    const course = await this.prisma.course.findFirst({
      where: { cohorts: { some: { id: cohortId } } },
    });
    if (!course) throw new NotFoundException("Kurs bulunamadı");

    // Early bird?
    const useEarlyBird =
      course.earlyBirdPriceTry !== null && course.earlyBirdPriceTry !== undefined;
    const price = useEarlyBird
      ? Number(course.earlyBirdPriceTry)
      : Number(course.priceTry);

    return this.prisma.$transaction([
      this.prisma.courseEnrollment.create({
        data: {
          cohortId,
          userId,
          amountPaidTry: price,
          status: EnrollmentStatus.pending,
        },
      }),
      // capacity dolarsa cohort'u "full" yap
      this.prisma.courseCohort.update({
        where: { id: cohortId },
        data: {
          enrolledCount: { increment: 1 },
          ...(cohort.capacity && cohort.enrolledCount + 1 >= cohort.capacity
            ? { status: CohortStatus.full }
            : {}),
        },
      }),
    ]);
  }

  async markPaid(enrollmentId: string) {
    return this.prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: { status: "paid" },
    });
  }

  myEnrollments(userId: string) {
    return this.prisma.courseEnrollment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { cohort: { include: { course: true } } },
    });
  }

  // ─── Admin ────────────────────────────────────────────────

  async create(dto: CreateCourseInput) {
    const slug = await uniqueSlug(
      dto.slug ?? dto.title,
      async (s) => !!(await this.prisma.course.findUnique({ where: { slug: s } })),
    );
    return this.prisma.course.create({
      data: {
        slug,
        title: dto.title,
        subtitle: dto.subtitle,
        description: dto.description,
        format: dto.format,
        level: dto.level ?? "intermediate",
        durationWeeks: dto.durationWeeks,
        priceTry: dto.priceTry,
        priceUsd: dto.priceUsd ?? 0,
        earlyBirdPriceTry: dto.earlyBirdPriceTry,
        capacity: dto.capacity,
        syllabus: dto.syllabus as Prisma.InputJsonValue,
        outcomes: dto.outcomes ?? [],
        prerequisites: dto.prerequisites ?? [],
      },
    });
  }

  createCohort(courseId: string, dto: CreateCohortInput) {
    return this.prisma.courseCohort.create({
      data: {
        courseId,
        cohortNumber: dto.cohortNumber,
        startDate: dto.startDate,
        endDate: dto.endDate,
        capacity: dto.capacity,
        zoomLink: dto.zoomLink,
      },
    });
  }

  setCohortStatus(cohortId: string, status: CohortStatus) {
    return this.prisma.courseCohort.update({
      where: { id: cohortId },
      data: { status },
    });
  }
}
