import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Redirect,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import {
  AdCampaignStatus,
  AdCampaignType,
  AdPlacement,
  UserRole,
} from "@prisma/client";
import { AdsService } from "./ads.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

class CreateAdvertiserDto {
  @IsString() @MaxLength(200) name!: string;
  @IsOptional() @IsString() @MaxLength(150) contactName?: string;
  @IsOptional() @IsEmail() contactEmail?: string;
  @IsOptional() @IsString() @MaxLength(50) contactPhone?: string;
  @IsOptional() billingInfo?: unknown;
}

class CreateCampaignDto {
  @IsString() advertiserId!: string;
  @IsString() @MaxLength(200) name!: string;
  @IsEnum(AdCampaignType) type!: AdCampaignType;
  @IsDateString() startAt!: string;
  @IsDateString() endAt!: string;
  @IsNumber() @Min(0) budget!: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() targeting?: unknown;
}

class CreateSlotDto {
  @IsString() campaignId!: string;
  @IsEnum(AdPlacement) placement!: AdPlacement;
  @IsString() creativeUrl!: string;
  @IsString() clickUrl!: string;
  @IsOptional() @IsString() altText?: string;
  @IsOptional() @IsInt() @Min(1) weight?: number;
  @IsDateString() startAt!: string;
  @IsDateString() endAt!: string;
}

// ─── PUBLIC — slot serve + click ──────────────────────────

@ApiTags("ads (public)")
@Controller("ads")
export class AdsPublicController {
  constructor(private readonly ads: AdsService) {}

  @Get("slot/:placement")
  pickSlot(@Param("placement") placement: AdPlacement) {
    return this.ads.pickSlot(placement);
  }

  @Get("click/:slotId")
  @Redirect()
  async click(@Param("slotId") slotId: string) {
    const url = await this.ads.trackClick(slotId);
    return { url, statusCode: 302 };
  }
}

// ─── ADMIN ────────────────────────────────────────────────

@ApiTags("ads (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.sales)
@Controller("admin/ads")
export class AdsAdminController {
  constructor(private readonly ads: AdsService) {}

  @Get("advertisers")
  listAdvertisers() {
    return this.ads.listAdvertisers();
  }

  @Post("advertisers")
  createAdvertiser(@Body() dto: CreateAdvertiserDto) {
    return this.ads.createAdvertiser(dto);
  }

  @Post("campaigns")
  createCampaign(@Body() dto: CreateCampaignDto) {
    return this.ads.createCampaign({
      ...dto,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
    });
  }

  @Patch("campaigns/:id/status")
  setCampaignStatus(
    @Param("id") id: string,
    @Body() body: { status: AdCampaignStatus },
  ) {
    return this.ads.setCampaignStatus(id, body.status);
  }

  @Post("slots")
  createSlot(@Body() dto: CreateSlotDto) {
    return this.ads.createSlot({
      ...dto,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
    });
  }
}
