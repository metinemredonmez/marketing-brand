import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request } from "express";
import { IsString, MaxLength, MinLength } from "class-validator";
import { UserRole } from "@prisma/client";
import { AgencyReviewsService } from "./agency-reviews.service";
import { SubmitReviewDto } from "./dto/submit-review.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class AgencyResponseDto {
  @IsString() @MinLength(20) @MaxLength(2000) response!: string;
}

class RejectDto {
  @IsString() @MaxLength(1000) notes!: string;
}

// ─── PUBLIC — submit + verify + list ─────────────────────

@ApiTags("agency-reviews (public)")
@Controller("agencies")
export class AgencyReviewsPublicController {
  constructor(private readonly reviews: AgencyReviewsService) {}

  @Get(":agencyId/reviews")
  list(
    @Param("agencyId") agencyId: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.reviews.listForAgency(agencyId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post(":agencyId/reviews")
  submit(
    @Param("agencyId") agencyId: string,
    @Body() dto: SubmitReviewDto,
    @Req() req: Request,
  ) {
    if (dto.consent === false) {
      throw new BadRequestException("KVKK onayı gerekli");
    }
    return this.reviews.submit(agencyId, dto, {
      ipAddress:
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"] as string | undefined,
    });
  }

  @Get("reviews/verify")
  @HttpCode(200)
  verify(@Query("token") token: string) {
    if (!token) throw new BadRequestException("Token gerekli");
    return this.reviews.verifyToken(token);
  }

  @Post("reviews/:id/agency-response")
  @HttpCode(200)
  // Not: Production'da ajansa "magic link" ile yetki verilmeli; faz 2'de.
  // Şimdilik open endpoint, sadece tek seferlik response kabul ediyor.
  addResponse(
    @Param("id") id: string,
    @Body() dto: AgencyResponseDto,
  ) {
    return this.reviews.addAgencyResponse(id, dto.response);
  }
}

// ─── ADMIN — moderation ──────────────────────────────────

@ApiTags("agency-reviews (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/agency-reviews")
export class AgencyReviewsAdminController {
  constructor(private readonly reviews: AgencyReviewsService) {}

  @Get("queue")
  queue() {
    return this.reviews.moderationQueue();
  }

  @Audit({
    action: "review.approve",
    resource: "agency_review",
    resourceIdFrom: "params.id",
  })
  @Post(":id/approve")
  approve(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query("upgrade") upgrade?: string,
  ) {
    return this.reviews.approve(id, user.id, upgrade === "true");
  }

  @Audit({
    action: "review.reject",
    resource: "agency_review",
    resourceIdFrom: "params.id",
  })
  @Post(":id/reject")
  reject(
    @Param("id") id: string,
    @Body() dto: RejectDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reviews.reject(id, user.id, dto.notes);
  }
}
