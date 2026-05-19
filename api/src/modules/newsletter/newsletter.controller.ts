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
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { UserRole } from "@prisma/client";
import { NewsletterService } from "./newsletter.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";

class SubscribeDto {
  @IsEmail() email!: string;
  @IsOptional() @IsString() @MaxLength(150) fullName?: string;
  @IsOptional() @IsArray() segments?: string[];
  @IsOptional() @IsString() source?: string;
}

class ScheduleIssueDto {
  @IsDateString() scheduledAt!: string;
}

// ─── PUBLIC ───────────────────────────────────────────────

@ApiTags("newsletter (public)")
@Controller("newsletter")
export class NewsletterPublicController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("subscribe")
  @HttpCode(200)
  subscribe(@Body() dto: SubscribeDto, @Req() req: Request) {
    return this.newsletter.subscribe({
      email: dto.email,
      fullName: dto.fullName,
      segments: dto.segments,
      source: dto.source,
      ipAddress:
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress,
    });
  }

  @Get("confirm")
  @HttpCode(200)
  confirm(@Query("token") token: string) {
    if (!token) throw new BadRequestException("Token gerekli");
    return this.newsletter.confirm(token);
  }

  @Get("unsubscribe")
  @HttpCode(200)
  unsubscribe(@Query("email") email: string) {
    if (!email) throw new BadRequestException("E-posta gerekli");
    return this.newsletter.unsubscribe(email);
  }

  @Get("stats")
  async stats() {
    return { confirmedCount: await this.newsletter.countConfirmed() };
  }
}

// ─── ADMIN ────────────────────────────────────────────────

@ApiTags("newsletter (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/newsletter")
export class NewsletterAdminController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Audit({
    action: "newsletter.compose_daily",
    resource: "newsletter_issue",
    resourceIdFrom: "result.issueId",
  })
  @Post("compose-daily")
  composeDaily() {
    return this.newsletter.composeDailyDigest();
  }

  @Audit({
    action: "newsletter.send",
    resource: "newsletter_issue",
    resourceIdFrom: "params.id",
  })
  @Post("issues/:id/send")
  send(@Param("id") id: string) {
    return this.newsletter.sendIssue(id);
  }

  @Post("issues/:id/schedule")
  schedule(@Param("id") id: string, @Body() dto: ScheduleIssueDto) {
    return this.newsletter.scheduleIssue(id, new Date(dto.scheduledAt));
  }
}
