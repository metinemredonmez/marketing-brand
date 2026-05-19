import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import {
  CohortStatus,
  CourseFormat,
  CourseLevel,
  UserRole,
} from "@prisma/client";
import { CoursesService } from "./courses.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class CreateCourseDto {
  @IsString() @MaxLength(200) title!: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() @MaxLength(300) subtitle?: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(CourseFormat) format!: CourseFormat;
  @IsOptional() @IsEnum(CourseLevel) level?: CourseLevel;
  @IsOptional() @IsInt() @Min(1) durationWeeks?: number;
  @IsNumber() @Min(0) priceTry!: number;
  @IsOptional() @IsNumber() @Min(0) priceUsd?: number;
  @IsOptional() @IsNumber() @Min(0) earlyBirdPriceTry?: number;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
  @IsOptional() syllabus?: unknown;
  @IsOptional() @IsArray() outcomes?: string[];
  @IsOptional() @IsArray() prerequisites?: string[];
}

class CreateCohortDto {
  @IsInt() @Min(1) cohortNumber!: number;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
  @IsOptional() @IsString() zoomLink?: string;
}

class SetCohortStatusDto {
  @IsEnum(CohortStatus) status!: CohortStatus;
}

// ─── PUBLIC ───────────────────────────────────────────────

@ApiTags("courses (public)")
@Controller("courses")
export class CoursesPublicController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  list() {
    return this.courses.listActive();
  }

  @Get(":slug")
  getOne(@Param("slug") slug: string) {
    return this.courses.getBySlug(slug);
  }
}

// ─── ENROLLED USER ────────────────────────────────────────

@ApiTags("courses (user)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard)
@Controller("courses-me")
export class CoursesUserController {
  constructor(private readonly courses: CoursesService) {}

  @Get("enrollments")
  myEnrollments(@CurrentUser() user: CurrentUserPayload) {
    return this.courses.myEnrollments(user.id);
  }

  @Audit({
    action: "course.enroll",
    resource: "course_cohort",
    resourceIdFrom: "params.cohortId",
  })
  @Post("cohorts/:cohortId/enroll")
  enroll(
    @Param("cohortId") cohortId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.courses.enroll(cohortId, user.id);
  }
}

// ─── ADMIN ────────────────────────────────────────────────

@ApiTags("courses (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/courses")
export class CoursesAdminController {
  constructor(private readonly courses: CoursesService) {}

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.courses.create(dto);
  }

  @Post(":courseId/cohorts")
  createCohort(
    @Param("courseId") courseId: string,
    @Body() dto: CreateCohortDto,
  ) {
    return this.courses.createCohort(courseId, {
      cohortNumber: dto.cohortNumber,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      capacity: dto.capacity,
      zoomLink: dto.zoomLink,
    });
  }

  @Patch("cohorts/:cohortId/status")
  setCohortStatus(
    @Param("cohortId") cohortId: string,
    @Body() dto: SetCohortStatusDto,
  ) {
    return this.courses.setCohortStatus(cohortId, dto.status);
  }

  @Post("enrollments/:id/mark-paid")
  markPaid(@Param("id") id: string) {
    return this.courses.markPaid(id);
  }
}
