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
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { EmployerBrandPlan, UserRole } from "@prisma/client";
import { EmployerBrandsService } from "./employer-brands.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";

class CreateEmployerDto {
  @IsString() @MaxLength(150) companyName!: string;
  @IsOptional() @IsString() @MaxLength(150) slug?: string;
  @IsOptional() @IsString() @MaxLength(300) tagline?: string;
  @IsOptional() @IsString() about?: string;
  @IsOptional() @IsEnum(EmployerBrandPlan) plan?: EmployerBrandPlan;
}

class SetPlanDto {
  @IsEnum(EmployerBrandPlan) plan!: EmployerBrandPlan;
  @IsInt() @Min(1) durationMonths!: number;
}

@ApiTags("employer-brands (public)")
@Controller("employer-brands")
export class EmployerBrandsPublicController {
  constructor(private readonly brands: EmployerBrandsService) {}

  @Get()
  list() {
    return this.brands.list();
  }

  @Get(":slug")
  getOne(@Param("slug") slug: string) {
    return this.brands.getBySlug(slug);
  }
}

@ApiTags("employer-brands (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.sales)
@Controller("admin/employer-brands")
export class EmployerBrandsAdminController {
  constructor(private readonly brands: EmployerBrandsService) {}

  @Audit({
    action: "employer_brand.create",
    resource: "employer_brand",
    resourceIdFrom: "result.id",
  })
  @Post()
  create(@Body() dto: CreateEmployerDto) {
    return this.brands.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
    return this.brands.update(id, dto);
  }

  @Audit({
    action: "employer_brand.set_plan",
    resource: "employer_brand",
    resourceIdFrom: "params.id",
  })
  @Post(":id/plan")
  setPlan(@Param("id") id: string, @Body() dto: SetPlanDto) {
    return this.brands.setPlan(id, dto.plan, dto.durationMonths);
  }
}
