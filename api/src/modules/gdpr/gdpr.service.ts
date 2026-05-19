import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service";

/**
 * KVKK / GDPR — kullanıcı verisi export + silme
 * Madde 11 (KVKK): Kullanıcılar verilerinin silinmesini, anonim hale getirilmesini
 * veya bir kopyasını talep edebilir.
 */
@Injectable()
export class GdprService {
  constructor(private readonly prisma: PrismaService) {}

  /** Tüm verisini topla ve JSON olarak döndür */
  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        articles: {
          select: { id: true, slug: true, title: true, createdAt: true },
        },
        notifications: true,
        calendarEventsOwned: true,
        subscriptions: true,
      },
    });
    if (!user) throw new NotFoundException("Kullanıcı bulunamadı");

    // Hassas alanları çıkar
    const { passwordHash, ...safeUser } = user;
    void passwordHash;

    const [refreshTokens, courseEnrollments, panelMember, researchResponses] =
      await Promise.all([
        this.prisma.refreshToken.findMany({
          where: { userId },
          select: { id: true, userAgent: true, ipAddress: true, createdAt: true },
        }),
        this.prisma.courseEnrollment.findMany({ where: { userId } }),
        this.prisma.researchPanelMember.findUnique({ where: { userId } }),
        this.prisma.researchResponse.findMany({ where: { userId } }),
      ]);

    return {
      generatedAt: new Date().toISOString(),
      user: safeUser,
      refreshTokens,
      courseEnrollments,
      panelMember,
      researchResponses,
    };
  }

  /**
   * Right to be forgotten: kullanıcıyı anonimleştir.
   * 30 günlük "geri alma" penceresi için sadece deactivate; sonra cron ile gerçek anonymize.
   */
  async requestDeletion(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Kullanıcı bulunamadı");

    // 1. Aktif refresh token'lar revoke
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // 2. Aktif aboneler iptal flag
    await this.prisma.subscription.updateMany({
      where: { userId, status: { in: ["active", "trialing", "past_due"] } },
      data: { cancelAtPeriodEnd: true, canceledAt: new Date() },
    });

    // 3. User deactivate
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // 4. Audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        actorEmail: user.email,
        action: "user.deletion_requested",
        resource: "user",
        resourceId: userId,
      },
    });

    return {
      ok: true,
      message:
        "Hesabınız pasifleştirildi. 30 gün içinde tekrar giriş yapmazsanız tüm verileriniz anonim hale getirilir.",
    };
  }

  /**
   * Gerçek anonymize — 30 gün sonra cron tarafından çağrılır.
   * Kullanıcının kişiliğini siler ama referansları (article authorId vb) korunur.
   */
  async anonymize(userId: string) {
    const anonId = `deleted-${userId.slice(0, 8)}`;
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `${anonId}@deleted.markaradar.local`,
        fullName: "Silinmiş Kullanıcı",
        avatarUrl: null,
        bio: null,
        linkedinUrl: null,
        twitterUrl: null,
        passwordHash: "DELETED",
        isActive: false,
      },
    });
    return { ok: true };
  }
}
