import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import {
  AdCampaignType,
  AdPlacement,
  BrandAccountRole,
  BrandAccountStatus,
  BrandCreativeStatus,
  BrandCreativeType,
  UserRole,
} from "@prisma/client";
import { BrandAccountsService } from "./accounts/brand-accounts.service";
import { BrandWalletService } from "./wallet/brand-wallet.service";
import { BrandCampaignsService } from "./campaigns/brand-campaigns.service";
import { BrandAiService } from "./ai/brand-ai.service";
import {
  type BrandGenerationType,
  BRAND_PROMPTS,
} from "./ai/brand-prompts";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

// ──────────────────────────── DTOs

class BrandSignupDto {
  @IsString() @MaxLength(200) companyName!: string;
  @IsString() @MaxLength(150) contactName!: string;
  @IsEmail() contactEmail!: string;
  @IsOptional() @IsString() contactPhone?: string;
  @IsString() @MinLength(8) password!: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() @MaxLength(80) industry?: string;
  @IsOptional() @IsString() companySize?: string;
}

class KycDto {
  @IsString() @MaxLength(20) taxNumber!: string;
  @IsString() @MaxLength(100) taxOffice!: string;
  @IsOptional() @IsString() website?: string;
}

class InviteUserDto {
  @IsEmail() email!: string;
  @IsEnum(BrandAccountRole) role!: BrandAccountRole;
}

class RechargeDto {
  @IsNumber() @Min(1000) @Max(500000) amountTry!: number;
}

class GenerateAdDto {
  @IsString() generationType!: BrandGenerationType;
  @IsObject() vars!: Record<string, string>;
  @IsOptional() @IsEnum(["openai", "anthropic"]) provider?:
    | "openai"
    | "anthropic";
}

class CreateCreativeDto {
  @IsEnum(BrandCreativeType) type!: BrandCreativeType;
  @IsString() @MaxLength(200) name!: string;
  @IsObject() content!: Record<string, unknown>;
  @IsOptional() @IsString() assetUrl?: string;
  @IsOptional() @IsString() clickUrl?: string;
  @IsOptional() @IsString() @MaxLength(300) altText?: string;
  @IsOptional() @IsString() aiGenerationId?: string;
}

class CreateBrandCampaignDto {
  @IsString() @MaxLength(200) name!: string;
  @IsEnum(["awareness", "traffic", "lead_gen", "brand_story"])
  goal!: "awareness" | "traffic" | "lead_gen" | "brand_story";
  @IsEnum(AdCampaignType) type!: AdCampaignType;
  @IsEnum(AdPlacement) placement!: AdPlacement;
  @IsString() creativeId!: string;
  @IsDateString() startAt!: string;
  @IsDateString() endAt!: string;
  @IsNumber() @Min(5000) budgetTry!: number;
  @IsOptional() @IsObject() targeting?: {
    categories?: string[];
    cities?: string[];
    audience?: string;
  };
}

// ──────────────────────────── PUBLIC — signup

@ApiTags("brand-portal (public)")
@Controller("brand")
export class BrandPublicController {
  constructor(private readonly accounts: BrandAccountsService) {}

  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Audit({
    action: "brand.signup",
    resource: "brand_account",
    resourceIdFrom: "result.brand.id",
  })
  @Post("signup")
  async signup(@Body() dto: BrandSignupDto) {
    return this.accounts.signup(dto);
  }
}

// ──────────────────────────── BRAND USER — kendi paneli

@ApiTags("brand-portal (brand)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.brand_user, UserRole.super_admin)
@Controller("brand")
export class BrandPortalController {
  constructor(
    private readonly accounts: BrandAccountsService,
    private readonly wallet: BrandWalletService,
    private readonly campaigns: BrandCampaignsService,
    private readonly ai: BrandAiService,
  ) {}

  /** Üyesi olduğum marka hesapları */
  @Get("accounts")
  myAccounts(@CurrentUser() user: CurrentUserPayload) {
    return this.accounts.listMyAccounts(user.id);
  }

  /** Bir marka hesabının detayı */
  @Get("accounts/:brandAccountId")
  myAccount(
    @CurrentUser() user: CurrentUserPayload,
    @Param("brandAccountId") brandAccountId: string,
  ) {
    return this.accounts.getMyAccount(user.id, brandAccountId);
  }

  /** KYC bilgilerini gönder */
  @Audit({
    action: "brand.kyc_submit",
    resource: "brand_account",
    resourceIdFrom: "params.brandAccountId",
  })
  @Post("accounts/:brandAccountId/kyc")
  submitKyc(
    @Param("brandAccountId") brandAccountId: string,
    @Body() dto: KycDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Sahiplik kontrolü
    return this.accounts
      .getMyAccount(user.id, brandAccountId)
      .then(() => this.accounts.submitKyc(brandAccountId, dto));
  }

  /** Ekip üyesi davet et */
  @Post("accounts/:brandAccountId/invite")
  invite(
    @Param("brandAccountId") brandAccountId: string,
    @Body() dto: InviteUserDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.accounts.inviteUser(
      brandAccountId,
      user.id,
      dto.email,
      dto.role,
    );
  }

  // ─── Wallet

  @Get("accounts/:brandAccountId/wallet")
  myWallet(
    @CurrentUser() user: CurrentUserPayload,
    @Param("brandAccountId") brandAccountId: string,
  ) {
    return this.accounts
      .getMyAccount(user.id, brandAccountId)
      .then(() => this.wallet.getWallet(brandAccountId));
  }

  @Audit({
    action: "brand.wallet_recharge",
    resource: "brand_wallet",
    resourceIdFrom: "params.brandAccountId",
  })
  @Post("accounts/:brandAccountId/wallet/recharge")
  recharge(
    @Param("brandAccountId") brandAccountId: string,
    @Body() dto: RechargeDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.accounts
      .getMyAccount(user.id, brandAccountId)
      .then(() =>
        this.wallet.createRechargeCheckout({
          brandAccountId,
          userEmail: user.email,
          amountTry: dto.amountTry,
        }),
      );
  }

  // ─── AI Studio (brand)

  @Get("ai/prompt-types")
  promptTypes() {
    return Object.keys(BRAND_PROMPTS).map((key) => ({
      type: key,
      // Bu sonradan daha güzel labels ile genişletilebilir
    }));
  }

  @Throttle({ ai: { limit: 30, ttl: 3_600_000 } })
  @Audit({
    action: "brand.ai_generate",
    resource: "ai_generation",
    resourceIdFrom: "result.generationId",
  })
  @Post("accounts/:brandAccountId/ai/generate")
  generate(
    @Param("brandAccountId") brandAccountId: string,
    @Body() dto: GenerateAdDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.accounts.getMyAccount(user.id, brandAccountId).then(() =>
      this.ai.generate({
        brandAccountId,
        generationType: dto.generationType,
        vars: dto.vars,
        provider: dto.provider,
        createdById: user.id,
      }),
    );
  }

  // ─── Creatives

  @Get("accounts/:brandAccountId/creatives")
  listCreatives(
    @CurrentUser() user: CurrentUserPayload,
    @Param("brandAccountId") brandAccountId: string,
    @Query("type") type?: BrandCreativeType,
    @Query("status") status?: BrandCreativeStatus,
  ) {
    return this.accounts
      .getMyAccount(user.id, brandAccountId)
      .then(() =>
        this.campaigns.listCreatives(brandAccountId, { type, status }),
      );
  }

  @Audit({
    action: "brand.creative_create",
    resource: "brand_creative",
    resourceIdFrom: "result.id",
  })
  @Post("accounts/:brandAccountId/creatives")
  createCreative(
    @Param("brandAccountId") brandAccountId: string,
    @Body() dto: CreateCreativeDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.accounts.getMyAccount(user.id, brandAccountId).then(() =>
      this.campaigns.createCreative({
        brandAccountId,
        ...dto,
      }),
    );
  }

  @Post("accounts/:brandAccountId/creatives/:id/ready")
  markReady(
    @Param("brandAccountId") brandAccountId: string,
    @Param("id") creativeId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.accounts
      .getMyAccount(user.id, brandAccountId)
      .then(() => this.campaigns.markCreativeReady(creativeId, brandAccountId));
  }

  // ─── Campaigns (self-serve)

  @Get("accounts/:brandAccountId/campaigns")
  listCampaigns(
    @CurrentUser() user: CurrentUserPayload,
    @Param("brandAccountId") brandAccountId: string,
  ) {
    return this.accounts
      .getMyAccount(user.id, brandAccountId)
      .then(() => this.campaigns.listCampaigns(brandAccountId));
  }

  @Get("accounts/:brandAccountId/campaigns/:id")
  getCampaign(
    @CurrentUser() user: CurrentUserPayload,
    @Param("brandAccountId") brandAccountId: string,
    @Param("id") campaignId: string,
  ) {
    return this.accounts
      .getMyAccount(user.id, brandAccountId)
      .then(() => this.campaigns.getCampaign(brandAccountId, campaignId));
  }

  @Audit({
    action: "brand.campaign_create",
    resource: "ad_campaign",
    resourceIdFrom: "result.id",
  })
  @Post("accounts/:brandAccountId/campaigns")
  createCampaign(
    @Param("brandAccountId") brandAccountId: string,
    @Body() dto: CreateBrandCampaignDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.accounts.getMyAccount(user.id, brandAccountId).then(() =>
      this.campaigns.createCampaign({
        brandAccountId,
        name: dto.name,
        goal: dto.goal,
        type: dto.type,
        placement: dto.placement,
        creativeId: dto.creativeId,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        budgetTry: dto.budgetTry,
        targeting: dto.targeting,
      }),
    );
  }

  @HttpCode(200)
  @Post("accounts/:brandAccountId/campaigns/:id/pause")
  pause(
    @CurrentUser() user: CurrentUserPayload,
    @Param("brandAccountId") brandAccountId: string,
    @Param("id") campaignId: string,
  ) {
    return this.accounts
      .getMyAccount(user.id, brandAccountId)
      .then(() => this.campaigns.pauseCampaign(brandAccountId, campaignId));
  }

  @HttpCode(200)
  @Post("accounts/:brandAccountId/campaigns/:id/resume")
  resume(
    @CurrentUser() user: CurrentUserPayload,
    @Param("brandAccountId") brandAccountId: string,
    @Param("id") campaignId: string,
  ) {
    return this.accounts
      .getMyAccount(user.id, brandAccountId)
      .then(() => this.campaigns.resumeCampaign(brandAccountId, campaignId));
  }
}

// ──────────────────────────── ADMIN — moderation

class RejectDto {
  @IsString() @MinLength(5) @MaxLength(1000) reason!: string;
}

class WalletAdjustDto {
  @IsNumber() amountTry!: number;
  @IsString() @MinLength(5) @MaxLength(250) reason!: string;
}

@ApiTags("brand-portal (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor, UserRole.sales)
@Controller("admin/brand-portal")
export class BrandAdminController {
  constructor(
    private readonly accounts: BrandAccountsService,
    private readonly campaigns: BrandCampaignsService,
    private readonly wallet: BrandWalletService,
  ) {}

  @Get("accounts")
  listAccounts(@Query("status") status?: BrandAccountStatus) {
    return this.accounts.adminList({ status });
  }

  @Post("accounts/:id/status")
  setAccountStatus(
    @Param("id") id: string,
    @Body() body: { status: BrandAccountStatus },
  ) {
    return this.accounts.adminSetStatus(id, body.status);
  }

  @Get("campaigns/queue")
  campaignQueue() {
    return this.campaigns.adminQueue();
  }

  @Audit({
    action: "brand_campaign.approve",
    resource: "ad_campaign",
    resourceIdFrom: "params.id",
  })
  @Post("campaigns/:id/approve")
  approveCampaign(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.campaigns.adminApprove(id, user.id);
  }

  @Audit({
    action: "brand_campaign.reject",
    resource: "ad_campaign",
    resourceIdFrom: "params.id",
  })
  @Post("campaigns/:id/reject")
  rejectCampaign(
    @Param("id") id: string,
    @Body() dto: RejectDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.campaigns.adminReject(id, user.id, dto.reason);
  }

  /** Admin manuel cüzdan düzeltmesi — bonus, refund veya hata geri alma */
  @Audit({
    action: "brand_wallet.adjust",
    resource: "brand_wallet",
    resourceIdFrom: "params.id",
  })
  @Post("accounts/:id/wallet/adjust")
  adjustWallet(
    @Param("id") brandAccountId: string,
    @Body() dto: WalletAdjustDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.wallet.adminAdjust({
      brandAccountId,
      amountTry: dto.amountTry,
      reason: dto.reason,
      adminUserId: user.id,
    });
  }
}
