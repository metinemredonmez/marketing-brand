import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { ArticleStatus } from "@prisma/client";

export class CreateArticleDto {
  @IsString() @MaxLength(200) title!: string;

  @IsOptional() @IsString() @MaxLength(200) slug?: string;
  @IsOptional() @IsString() @MaxLength(320) spot?: string;
  @IsString() body!: string;

  @IsOptional() @IsString() coverUrl?: string;
  @IsOptional() @IsString() @MaxLength(200) coverAlt?: string;

  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsArray() tagIds?: string[];

  @IsOptional() @IsInt() @Min(1) readingTime?: number;

  // AI alanları (AI Studio çıktısı düzenlenebilir)
  @IsOptional() @IsString() aiSummary?: string;
  @IsOptional() @IsString() aiWhyMatters?: string;
  @IsOptional() @IsArray() aiBrandTakeaways?: string[];
  @IsOptional() @IsArray() aiAgencyTakeaways?: string[];
  @IsOptional() @IsString() aiTrAdaptation?: string;
  @IsOptional() @IsInt() @Min(0) aiHumanRatio?: number;

  // SEO
  @IsOptional() @IsString() @MaxLength(160) seoTitle?: string;
  @IsOptional() @IsString() @MaxLength(320) seoDescription?: string;
  @IsOptional() @IsString() canonicalUrl?: string;
  @IsOptional() @IsString() ogImageUrl?: string;

  // Premium / sponsorluk
  @IsOptional() @IsBoolean() isPremium?: boolean;
  @IsOptional() @IsBoolean() isSponsored?: boolean;
  @IsOptional() @IsString() @MaxLength(100) sponsorLabel?: string;

  // Kaynak
  @IsOptional() @IsString() sourceUrl?: string;
  @IsOptional() @IsString() @MaxLength(120) sourceName?: string;

  // Yayın
  @ApiPropertyOptional({ enum: ArticleStatus, default: "draft" })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional() @IsDateString() scheduledAt?: string;
}
