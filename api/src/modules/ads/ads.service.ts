import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AdCampaignStatus,
  AdCampaignType,
  AdPlacement,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";

@Injectable()
export class AdsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Advertiser ───────────────────────────────────────────

  createAdvertiser(input: {
    name: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    billingInfo?: unknown;
  }) {
    return this.prisma.advertiser.create({
      data: {
        name: input.name,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        billingInfo: input.billingInfo as Prisma.InputJsonValue,
      },
    });
  }

  listAdvertisers() {
    return this.prisma.advertiser.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { campaigns: true } } },
    });
  }

  // ─── Campaign ─────────────────────────────────────────────

  createCampaign(input: {
    advertiserId: string;
    name: string;
    type: AdCampaignType;
    startAt: Date;
    endAt: Date;
    budget: number;
    currency?: string;
    targeting?: unknown;
  }) {
    return this.prisma.adCampaign.create({
      data: {
        advertiserId: input.advertiserId,
        name: input.name,
        type: input.type,
        startAt: input.startAt,
        endAt: input.endAt,
        budget: input.budget,
        currency: input.currency ?? "TRY",
        targeting: input.targeting as Prisma.InputJsonValue,
      },
    });
  }

  setCampaignStatus(id: string, status: AdCampaignStatus) {
    return this.prisma.adCampaign.update({
      where: { id },
      data: { status },
    });
  }

  // ─── Slots ────────────────────────────────────────────────

  createSlot(input: {
    campaignId: string;
    placement: AdPlacement;
    creativeUrl: string;
    clickUrl: string;
    altText?: string;
    weight?: number;
    startAt: Date;
    endAt: Date;
  }) {
    return this.prisma.adSlot.create({
      data: {
        campaignId: input.campaignId,
        placement: input.placement,
        creativeUrl: input.creativeUrl,
        clickUrl: input.clickUrl,
        altText: input.altText,
        weight: input.weight ?? 1,
        startAt: input.startAt,
        endAt: input.endAt,
      },
    });
  }

  /**
   * Belirli bir placement için aktif slot seç (weighted random).
   * Frontend ad render component'i bu endpoint'i çağırır.
   */
  async pickSlot(placement: AdPlacement) {
    const now = new Date();
    const slots = await this.prisma.adSlot.findMany({
      where: {
        placement,
        status: "active",
        startAt: { lte: now },
        endAt: { gte: now },
        campaign: { status: "active" },
      },
      include: { campaign: { select: { id: true, advertiserId: true } } },
    });
    if (slots.length === 0) return null;

    // Weighted random
    const totalWeight = slots.reduce((sum, s) => sum + s.weight, 0);
    let pick = Math.random() * totalWeight;
    for (const s of slots) {
      pick -= s.weight;
      if (pick <= 0) {
        // Async impression count (best effort)
        this.prisma.adSlot
          .update({ where: { id: s.id }, data: { impressions: { increment: 1 } } })
          .catch(() => undefined);
        return {
          id: s.id,
          placement: s.placement,
          creativeUrl: s.creativeUrl,
          clickUrl: `/api/v1/ads/click/${s.id}`,
          altText: s.altText,
        };
      }
    }
    return null;
  }

  async trackClick(slotId: string): Promise<string> {
    const slot = await this.prisma.adSlot.findUnique({ where: { id: slotId } });
    if (!slot) throw new NotFoundException("Slot bulunamadı");
    this.prisma.adSlot
      .update({ where: { id: slotId }, data: { clicks: { increment: 1 } } })
      .catch(() => undefined);
    return slot.clickUrl;
  }
}
