import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { UserRole } from "@prisma/client";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class CreateReportDto {
  @IsString() @MaxLength(200) title!: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() coverUrl?: string;
  @IsOptional() @IsString() previewUrl?: string;
  @IsOptional() @IsString() fileKey?: string;
  @IsOptional() @IsInt() @Min(1) pageCount?: number;
  @IsOptional() @IsNumber() @Min(0) priceTry?: number;
  @IsOptional() @IsBoolean() isFree?: boolean;
  @IsOptional() @IsString() includedInTier?: string;
}

@ApiTags("reports (public)")
@Controller("reports")
export class ReportsPublicController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  list() {
    return this.reports.listPublished();
  }

  @Get(":slug")
  getOne(@Param("slug") slug: string) {
    return this.reports.getBySlug(slug);
  }

  /** Logged-in optional: free raporlar herkese, premium subscription gerektiren raporlar guard ile */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth("mr_access")
  @Get(":slug/download")
  download(
    @Param("slug") slug: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reports
      .getDownloadUrl(slug, user)
      .then((url) => ({ downloadUrl: url, expiresInSec: 3600 }));
  }
}

@ApiTags("reports (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/reports")
export class ReportsAdminController {
  constructor(private readonly reports: ReportsService) {}

  @Audit({
    action: "report.create",
    resource: "report",
    resourceIdFrom: "result.id",
  })
  @Post()
  create(@Body() dto: CreateReportDto) {
    return this.reports.create(dto);
  }

  @Audit({
    action: "report.publish",
    resource: "report",
    resourceIdFrom: "params.id",
  })
  @Post(":id/publish")
  publish(@Param("id") id: string) {
    return this.reports.publish(id);
  }
}
