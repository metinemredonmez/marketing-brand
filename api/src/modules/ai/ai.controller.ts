import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { AiService } from "./ai.service";
import { GenerationType } from "./prompts";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";

const ALLOWED_TYPES: GenerationType[] = [
  "title",
  "spot",
  "body",
  "ai_summary",
  "linkedin_post",
  "instagram_carousel",
  "reels_script",
  "seo_meta",
  "cover_image_prompt",
];

class GenerateDto {
  @IsString()
  @IsEnum(ALLOWED_TYPES, {
    message: `generationType şunlardan biri olmalı: ${ALLOWED_TYPES.join(", ")}`,
  })
  generationType!: GenerationType;

  @IsString()
  @MaxLength(50_000)
  sourceText!: string;

  @IsOptional() @IsString() articleId?: string;

  @IsOptional()
  @IsEnum(["openai", "anthropic"])
  provider?: "openai" | "anthropic";

  @IsOptional() @IsString() model?: string;
}

class GenerateAllDto {
  @IsString()
  @MaxLength(50_000)
  sourceText!: string;

  @IsOptional() @IsString() articleId?: string;

  @IsOptional()
  @IsEnum(["openai", "anthropic"])
  provider?: "openai" | "anthropic";
}

@ApiTags("ai-studio")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.super_admin,
  UserRole.editor,
  UserRole.writer,
  UserRole.social_manager,
)
@Controller("admin/ai")
export class AiController {
  constructor(private readonly ai: AiService) {}

  /** Tek bir generation tipi (örn: sadece başlık) */
  @Throttle({ ai: { limit: 30, ttl: 3_600_000 } })
  @Post("generate")
  generate(
    @Body() dto: GenerateDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const vars: Record<string, string> = { source_text: dto.sourceText };
    // ai_summary, linkedin, IG, reels için article_body bekleniyor
    if (
      [
        "ai_summary",
        "linkedin_post",
        "instagram_carousel",
        "reels_script",
      ].includes(dto.generationType)
    ) {
      vars.article_body = dto.sourceText;
    }

    return this.ai.generate({
      generationType: dto.generationType,
      vars,
      articleId: dto.articleId,
      provider: dto.provider,
      model: dto.model,
      createdById: user.id,
    });
  }

  /** Bir kaynaktan 8 format birden — toplu üretim */
  @Throttle({ ai: { limit: 10, ttl: 3_600_000 } })
  @Post("generate-all")
  generateAll(
    @Body() dto: GenerateAllDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ai.generateAll({
      sourceText: dto.sourceText,
      articleId: dto.articleId,
      provider: dto.provider,
      createdById: user.id,
    });
  }

  /** Aylık kullanım + bütçe durumu */
  @Get("usage")
  usage() {
    return this.ai.monthlyUsage();
  }
}
