import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AdCampaignStatus,
  AdCampaignType,
  AdPlacement,
  BrandCreativeStatus,
  BrandCreativeType,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../../shared/prisma/prisma.service";
import { BrandWalletService } from "../wallet/brand-wallet.service";

export interface CreateCreativeInput {
  brandAccountId: string;
  type: BrandCreativeType;
  name: string;
  content: unknown;
  assetUrl?: string;
  clickUrl?: string;
  altText?: string;
  aiGenerationId?: string;
}

export interface CreateCampaignInput {
  brandAccountId: string;
  name: string;
  goal: "awareness" | "traffic" | "lead_gen" | "brand_story";
  type: AdCampaignType;
  placement: AdPlacement;
  creativeId: string;
  startAt: Date;
  endAt: Date;
  budgetTry: number;
  targeting?: {
    categories?: string[];
    cities?: string[];
    audience?: string;
  };
}

@Injectable()
export class BrandCampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: BrandWalletService,
  ) {}

  // ─── Creatives ────────────────────────────────────────────

  async createCreative(input: CreateCreativeInput) {
    return this.prisma.brandCreative.create({
      data: {
        brandAccountId: input.brandAccountId,
        type: input.type,
        name: input.name,
        content: input.content as Prisma.InputJsonValue,
        assetUrl: input.assetUrl,
        clickUrl: input.clickUrl,
        altText: input.altText,
        aiGenerationId: input.aiGenerationId,
        status: BrandCreativeStatus.draft,
      },
    });
  }

  async markCreativeReady(creativeId: string, brandAccountId: string) {
    const c = await this.assertOwnCreative(creativeId, brandAccountId);
    return this.prisma.brandCreative.update({
      where: { id: c.id },
      data: { status: BrandCreativeStatus.ready },
    });
  }

  async listCreatives(
    brandAccountId: string,
    params: { type?: BrandCreativeType; status?: BrandCreativeStatus } = {},
  ) {
    return this.prisma.brandCreative.findMany({
      where: {
        brandAccountId,
        ...(params.type ? { type: params.type } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  private async assertOwnCreative(creativeId: string, brandAccountId: string) {
    const creative = await this.prisma.brandCreative.findUnique({
      where: { id: creativeId },
    });
    if (!creative) throw new NotFoundException("Creative bulunamadı");
    if (creative.brandAccountId !== brandAccountId) {
      throw new ForbiddenException("Bu creative'in sahibi değilsin");
    }
    return creative;
  }

  // ─── Campaigns (self-serve) ───────────────────────────────

  async createCampaign(input: CreateCampaignInput) {
    if (input.budgetTry < 5000) {
      throw new BadRequestException("Minimum kampanya bütçesi: 5.000 TL");
    }
    if (input.budgetTry > 1_000_000) {
      throw new BadRequestException(
        "Bu bütçe için doğrudan satış ekibi ile iletişime geç",
      );
    }
    if (input.endAt <= input.startAt) {
      throw new BadRequestException("Bitiş tarihi başlangıçtan sonra olmalı");
    }

    // Brand account aktif mi?
    const brand = await this.prisma.brandAccount.findUnique({
      where: { id: input.brandAccountId },
      include: { advertiser: true },
    });
    if (!brand) throw new NotFoundException("Marka hesabı bulunamadı");
    if (brand.status !== "active") {
      throw new BadRequestException(
        "Kampanya oluşturmak için önce KYC bilgilerini tamamla",
      );
    }
    if (!brand.advertiser) {
      throw new BadRequestException(
        "Sistem hatası: advertiser bağlantısı yok",
      );
    }

    // Cüzdan bakiyesi yeter mi?
    const wallet = await this.prisma.brandWallet.findUnique({
      where: { brandAccountId: input.brandAccountId },
    });
    if (!wallet || Number(wallet.balanceTry) < input.budgetTry) {
      throw new BadRequestException(
        "Yetersiz bakiye. Önce cüzdanına yükleme yap.",
      );
    }

    // Creative kontrolü
    await this.assertOwnCreative(input.creativeId, input.brandAccountId);

    // Campaign + creative bağlantısı (transaction)
    const campaign = await this.prisma.$transaction(async (tx) => {
      const campaign = await tx.adCampaign.create({
        data: {
          advertiserId: brand.advertiser!.id,
          name: input.name,
          type: input.type,
          source: "self_serve",
          goal: input.goal,
          startAt: input.startAt,
          endAt: input.endAt,
          budget: input.budgetTry,
          currency: "TRY",
          targeting: {
            ...(input.targeting ?? {}),
            placement: input.placement,
          } as Prisma.InputJsonValue,
          status: AdCampaignStatus.pending_approval,
          submittedAt: new Date(),
        },
      });

      // Creative'i campaign'e bağla
      await tx.brandCreative.update({
        where: { id: input.creativeId },
        data: {
          campaignId: campaign.id,
          status: BrandCreativeStatus.in_campaign,
        },
      });

      return campaign;
    });

    return campaign;
  }

  async listCampaigns(brandAccountId: string) {
    const brand = await this.prisma.brandAccount.findUnique({
      where: { id: brandAccountId },
      select: { advertiser: { select: { id: true } } },
    });
    if (!brand?.advertiser) return [];

    return this.prisma.adCampaign.findMany({
      where: {
        advertiserId: brand.advertiser.id,
        source: "self_serve",
      },
      orderBy: { createdAt: "desc" },
      include: {
        brandCreatives: { take: 1 },
      },
    });
  }

  async getCampaign(brandAccountId: string, campaignId: string) {
    const brand = await this.prisma.brandAccount.findUnique({
      where: { id: brandAccountId },
      include: { advertiser: true },
    });
    if (!brand?.advertiser) throw new NotFoundException();

    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
      include: { brandCreatives: true, slots: true },
    });
    if (!campaign || campaign.advertiserId !== brand.advertiser.id) {
      throw new NotFoundException("Kampanya bulunamadı");
    }
    return campaign;
  }

  async pauseCampaign(brandAccountId: string, campaignId: string) {
    const campaign = await this.getCampaign(brandAccountId, campaignId);
    if (campaign.status !== "active") {
      throw new BadRequestException("Sadece aktif kampanyalar duraklatılabilir");
    }
    return this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: { status: "paused" },
    });
  }

  async resumeCampaign(brandAccountId: string, campaignId: string) {
    const campaign = await this.getCampaign(brandAccountId, campaignId);
    if (campaign.status !== "paused") {
      throw new BadRequestException("Sadece duraklatılmış kampanyalar devam ettirilebilir");
    }
    return this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: { status: "active" },
    });
  }

  // ─── Admin moderation ─────────────────────────────────────

  async adminQueue() {
    return this.prisma.adCampaign.findMany({
      where: {
        source: "self_serve",
        status: "pending_approval",
      },
      orderBy: { submittedAt: "asc" },
      include: {
        advertiser: {
          include: { brandAccount: true },
        },
        brandCreatives: true,
      },
    });
  }

  async adminApprove(campaignId: string, adminUserId: string) {
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
      include: { advertiser: { include: { brandAccount: true } } },
    });
    if (!campaign) throw new NotFoundException();
    if (campaign.status !== "pending_approval") {
      throw new BadRequestException("Bu kampanya onay sırasında değil");
    }

    const brandAccountId = campaign.advertiser.brandAccountId;
    if (!brandAccountId) {
      throw new BadRequestException("Self-serve kampanyada brand account yok");
    }

    // Bakiyeden bütçeyi düş (kampanya onaylanır + bakiye rezerv edilir)
    await this.wallet.debitWallet({
      brandAccountId,
      amountTry: Number(campaign.budget),
      description: `Kampanya bütçe rezerv: ${campaign.name}`,
      campaignId: campaign.id,
    });

    // Status update + slot auto-create (placement targeting'den)
    const updated = await this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: {
        status:
          campaign.startAt > new Date()
            ? AdCampaignStatus.scheduled
            : AdCampaignStatus.active,
        approvedById: adminUserId,
        approvedAt: new Date(),
      },
    });

    // Creative'i slot olarak hazırla (basit: placement targeting'den)
    const targeting = campaign.targeting as { placement?: AdPlacement } | null;
    const placement: AdPlacement = targeting?.placement ?? "homepage_top";

    const creative = await this.prisma.brandCreative.findFirst({
      where: { campaignId: campaign.id },
    });
    if (creative && creative.assetUrl && creative.clickUrl) {
      await this.prisma.adSlot.create({
        data: {
          campaignId: campaign.id,
          placement,
          creativeUrl: creative.assetUrl,
          clickUrl: creative.clickUrl,
          altText: creative.altText,
          startAt: campaign.startAt,
          endAt: campaign.endAt,
        },
      });
    }

    return updated;
  }

  async adminReject(
    campaignId: string,
    adminUserId: string,
    reason: string,
  ) {
    return this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: {
        status: AdCampaignStatus.rejected,
        approvedById: adminUserId,
        rejectedReason: reason.slice(0, 1000),
      },
    });
  }
}
