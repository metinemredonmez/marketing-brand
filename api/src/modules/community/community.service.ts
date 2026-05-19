import {
  BadRequestException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../shared/prisma/prisma.service";

/**
 * CMO Club Slack entegrasyonu — stub.
 *
 * Faz 2'de @slack/web-api ile gerçek invite gönderir:
 *   - conversations.invite (kanala ekle)
 *   - admin.users.invite (workspace'e ekle, paid plan gerekli)
 *
 * Şu an: sadece DB kaydı, manuel invite kurucu tarafından.
 */
@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Pro+ aboneye otomatik CMO Club üyeliği ekle */
  async addToCommunity(userId: string, community: string) {
    // Subscription kontrolü — Pro+ olmalı
    const sub = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ["active", "trialing"] },
        tier: { in: ["pro", "enterprise", "founding_member"] },
      },
    });
    if (!sub) {
      throw new BadRequestException(
        "Topluluk erişimi için Pro veya üstü abonelik gerekli",
      );
    }

    return this.prisma.communityMember.upsert({
      where: { userId_community: { userId, community } },
      update: { isActive: true },
      create: {
        userId,
        community,
        badges: ["founding"], // ilk üyelere founding badge
      },
    });
  }

  removeFromCommunity(userId: string, community: string) {
    return this.prisma.communityMember.update({
      where: { userId_community: { userId, community } },
      data: { isActive: false },
    });
  }

  listMembers(community: string) {
    return this.prisma.communityMember.findMany({
      where: { community, isActive: true },
      orderBy: { joinedAt: "asc" },
    });
  }

  async myMemberships(userId: string) {
    return this.prisma.communityMember.findMany({
      where: { userId, isActive: true },
    });
  }
}
