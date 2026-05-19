import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import {
  SocialChannel,
  SocialPostFormat,
  SocialPostStatus,
  UserRole,
} from "@prisma/client";
import { SocialService } from "./social.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class CreateSocialPostDto {
  @IsOptional() @IsString() articleId?: string;
  @IsEnum(SocialChannel) channel!: SocialChannel;
  @IsEnum(SocialPostFormat) format!: SocialPostFormat;
  content!: unknown;
  @IsOptional() @IsArray() mediaUrls?: string[];
  @IsOptional() @IsDateString() scheduledAt?: string;
}

class ScheduleDto {
  @IsDateString() scheduledAt!: string;
}

@ApiTags("social (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor, UserRole.social_manager)
@Controller("admin/social")
export class SocialController {
  constructor(private readonly social: SocialService) {}

  @Get()
  list(
    @Query("channel") channel?: SocialChannel,
    @Query("status") status?: SocialPostStatus,
    @Query("articleId") articleId?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.social.list({
      channel,
      status,
      articleId,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.social.getById(id);
  }

  @Post()
  create(
    @Body() dto: CreateSocialPostDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.social.createDraft({
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      createdById: user.id,
    });
  }

  @Patch(":id/schedule")
  schedule(@Param("id") id: string, @Body() dto: ScheduleDto) {
    return this.social.schedule(id, new Date(dto.scheduledAt));
  }
}
