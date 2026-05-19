import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import {
  EmploymentType,
  JobPlan,
  JobStatus,
  SeniorityLevel,
  UserRole,
} from "@prisma/client";
import { JobsService } from "./jobs.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";

class CreateJobDto {
  @IsString() @MaxLength(200) title!: string;
  @IsOptional() @IsString() @MaxLength(200) slug?: string;
  @IsString() @MinLength(50) description!: string;
  @IsString() @MaxLength(150) companyName!: string;
  @IsOptional() @IsString() employerBrandId?: string;
  @IsString() @MaxLength(80) category!: string;
  @IsEnum(SeniorityLevel) seniority!: SeniorityLevel;
  @IsEnum(EmploymentType) employmentType!: EmploymentType;
  @IsOptional() @IsString() @MaxLength(100) location?: string;
  @IsOptional() @IsBoolean() isRemote?: boolean;
  @IsOptional() @IsNumber() @Min(0) salaryMin?: number;
  @IsOptional() @IsNumber() @Min(0) salaryMax?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() applyUrl?: string;
  @IsOptional() @IsEmail() applyEmail?: string;
  @IsOptional() @IsEnum(JobPlan) plan?: JobPlan;
}

@ApiTags("jobs (public)")
@Controller("jobs")
export class JobsPublicController {
  constructor(private readonly jobs: JobsService) {}

  @Get()
  list(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("category") category?: string,
    @Query("seniority") seniority?: SeniorityLevel,
    @Query("isRemote") isRemote?: string,
    @Query("q") q?: string,
  ) {
    return this.jobs.list({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      category,
      seniority,
      isRemote:
        isRemote === "true" ? true : isRemote === "false" ? false : undefined,
      q,
    });
  }

  @Get(":slug")
  getOne(@Param("slug") slug: string) {
    return this.jobs.getBySlug(slug);
  }

  @HttpCode(200)
  @Post(":id/apply-click")
  trackApply(@Param("id") id: string) {
    return this.jobs.trackApply(id);
  }
}

@ApiTags("jobs (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor, UserRole.sales)
@Controller("admin/jobs")
export class JobsAdminController {
  constructor(private readonly jobs: JobsService) {}

  @Get()
  list(
    @Query("status") status?: JobStatus,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.jobs.adminList({
      status,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Audit({
    action: "job.create",
    resource: "job",
    resourceIdFrom: "result.id",
  })
  @Post()
  create(@Body() dto: CreateJobDto) {
    return this.jobs.create(dto);
  }

  @Audit({
    action: "job.update",
    resource: "job",
    resourceIdFrom: "params.id",
  })
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: Partial<CreateJobDto>) {
    return this.jobs.update(id, dto);
  }

  @Audit({
    action: "job.withdraw",
    resource: "job",
    resourceIdFrom: "params.id",
  })
  @Delete(":id")
  withdraw(@Param("id") id: string) {
    return this.jobs.withdraw(id);
  }

  @Post(":id/mark-filled")
  markFilled(@Param("id") id: string) {
    return this.jobs.markFilled(id);
  }
}
