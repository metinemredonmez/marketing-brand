import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, ReviewPublicationStatus } from "@prisma/client";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { EmailService } from "../../shared/mail/email.service";
import { AgenciesService } from "../agencies/agencies.service";
import { SubmitReviewDto } from "./dto/submit-review.dto";

// Generic e-posta domain'leri — reddedilir (şirket maili zorunlu)
const GENERIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "live.com",
  "mail.ru",
  "yandex.com",
  "protonmail.com",
  "pm.me",
]);

@Injectable()
export class AgencyReviewsService {
  private readonly logger = new Logger(AgencyReviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: EmailService,
    private readonly config: ConfigService,
    private readonly agencies: AgenciesService,
  ) {}

  // ─── Public list (yayınlanmış review'lar) ─────────────────

  async listForAgency(agencyId: string, params: { limit?: number; offset?: number }) {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;

    const where: Prisma.AgencyReviewWhereInput = {
      agencyId,
      publicationStatus: "published",
    };

    const [items, total] = await Promise.all([
      this.prisma.agencyReview.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reviewerName: true,
          reviewerRole: true,
          reviewerCompany: true,
          ratingOverall: true,
          ratingQuality: true,
          ratingCommunication: true,
          ratingTimeline: true,
          ratingValue: true,
          title: true,
          content: true,
          pros: true,
          cons: true,
          wouldWorkAgain: true,
          verificationStatus: true,
          agencyResponse: true,
          agencyResponseAt: true,
          createdAt: true,
        },
      }),
      this.prisma.agencyReview.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  // ─── Submit ───────────────────────────────────────────────

  async submit(
    agencyId: string,
    dto: SubmitReviewDto,
    ctx: { ipAddress?: string; userAgent?: string },
  ) {
    // 1. Agency var mı?
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });
    if (!agency) throw new NotFoundException("Ajans bulunamadı");

    // 2. Generic e-posta domain'i mı? (gmail vs.)
    const domain = dto.reviewerEmail.split("@")[1]?.toLowerCase();
    if (!domain || GENERIC_EMAIL_DOMAINS.has(domain)) {
      throw new BadRequestException(
        "Lütfen şirket e-postanızı kullanın (gmail/hotmail/yahoo kabul edilmiyor).",
      );
    }

    // 3. Aynı reviewer aynı ajansa son 6 ayda review yazmış mı?
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const existing = await this.prisma.agencyReview.findFirst({
      where: {
        agencyId,
        reviewerEmail: dto.reviewerEmail,
        createdAt: { gte: sixMonthsAgo },
      },
    });
    if (existing) {
      throw new BadRequestException(
        "Bu ajans için son 6 ayda bir review'unuz var.",
      );
    }

    // 4. IP rate limit — son 30 günde aynı IP'den 3+ review = anomali
    if (ctx.ipAddress) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const ipReviewCount = await this.prisma.agencyReview.count({
        where: { ipAddress: ctx.ipAddress, createdAt: { gte: thirtyDaysAgo } },
      });
      if (ipReviewCount >= 5) {
        this.logger.warn(
          `IP rate limit: ${ctx.ipAddress} = ${ipReviewCount} review/30 gün`,
        );
        throw new BadRequestException(
          "Çok sık review gönderdiniz. Lütfen daha sonra tekrar deneyin.",
        );
      }
    }

    // 5. Doğrulama token'ı üret + hash'le
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    // 6. Anti-fraud — basit similarity check (faz 2'de LLM ile)
    const similarityScore = await this.computeSimilarity(
      dto.content,
      agencyId,
    );

    const review = await this.prisma.agencyReview.create({
      data: {
        agencyId,
        reviewerName: dto.reviewerName,
        reviewerRole: dto.reviewerRole,
        reviewerEmail: dto.reviewerEmail,
        reviewerCompany: dto.reviewerCompany,
        reviewerLinkedin: dto.reviewerLinkedin,
        projectType: dto.projectType,
        projectBudgetRange: dto.projectBudgetRange,
        projectDurationMonths: dto.projectDurationMonths,
        ratingOverall: dto.ratingOverall,
        ratingQuality: dto.ratingQuality,
        ratingCommunication: dto.ratingCommunication,
        ratingTimeline: dto.ratingTimeline,
        ratingValue: dto.ratingValue,
        title: dto.title,
        content: dto.content,
        pros: dto.pros,
        cons: dto.cons,
        wouldWorkAgain: dto.wouldWorkAgain,
        npsScore: dto.npsScore,
        verificationStatus: "email_pending",
        verificationToken: tokenHash,
        publicationStatus: "submitted",
        ipAddress: ctx.ipAddress?.slice(0, 45),
        userAgent: ctx.userAgent?.slice(0, 500),
        similarityScore,
      },
    });

    // 7. Doğrulama maili gönder
    const apiUrl =
      this.config.get<string>("APP_URL") ?? "http://localhost:4000";
    const verifyLink = `${apiUrl}/api/v1/agencies/reviews/verify?token=${rawToken}`;
    this.mail
      .send({
        to: dto.reviewerEmail,
        subject: `MarkaRadar — "${agency.name}" review'unuzu doğrulayın`,
        html: this.verifyEmailHtml(dto.reviewerName, agency.name, verifyLink),
      })
      .catch((err) =>
        this.logger.warn(`Verification mail gönderilemedi: ${err.message}`),
      );

    return {
      id: review.id,
      status: "submitted",
      message:
        "Review'unuz alındı. İş e-postanıza gelen linke tıklayarak doğrulayın. 72 saat içinde moderasyon sonucu hakkında bilgi vereceğiz.",
    };
  }

  // ─── Reviewer email verification ──────────────────────────

  async verifyToken(rawToken: string) {
    const hash = createHash("sha256").update(rawToken).digest("hex");
    const review = await this.prisma.agencyReview.findFirst({
      where: { verificationToken: hash, verificationStatus: "email_pending" },
    });
    if (!review) {
      throw new BadRequestException("Geçersiz veya kullanılmış token");
    }

    await this.prisma.agencyReview.update({
      where: { id: review.id },
      data: {
        verificationStatus: "email_verified",
        verifiedAt: new Date(),
        verificationToken: null,
      },
    });

    return {
      ok: true,
      message:
        "E-posta doğrulandı. Review'unuz şimdi moderasyon kuyruğunda. 72 saat içinde yayınlanacak.",
    };
  }

  // ─── Right to reply (ajans yanıtı) ────────────────────────

  async addAgencyResponse(reviewId: string, response: string) {
    const review = await this.prisma.agencyReview.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException("Review bulunamadı");
    if (review.agencyResponse) {
      throw new BadRequestException(
        "Bu review'a zaten yanıt verilmiş (yanıt edit edilemez).",
      );
    }
    const fourteenDaysAfterPublish = new Date(review.createdAt);
    fourteenDaysAfterPublish.setDate(fourteenDaysAfterPublish.getDate() + 14);
    if (new Date() > fourteenDaysAfterPublish) {
      throw new BadRequestException(
        "Yanıt süresi doldu (14 gün limit).",
      );
    }

    return this.prisma.agencyReview.update({
      where: { id: reviewId },
      data: {
        agencyResponse: response,
        agencyResponseAt: new Date(),
      },
    });
  }

  // ─── Admin moderation ─────────────────────────────────────

  async moderationQueue() {
    return this.prisma.agencyReview.findMany({
      where: {
        publicationStatus: "submitted",
        verificationStatus: { in: ["email_verified", "linkedin_verified"] },
      },
      orderBy: { createdAt: "asc" },
      include: { agency: { select: { id: true, name: true, slug: true } } },
    });
  }

  async approve(
    reviewId: string,
    moderatorId: string,
    upgradeVerification = false,
  ) {
    const review = await this.prisma.agencyReview.update({
      where: { id: reviewId },
      data: {
        publicationStatus: "published",
        moderatedById: moderatorId,
        ...(upgradeVerification
          ? { verificationStatus: "fully_verified" }
          : {}),
      },
    });
    await this.agencies.refreshAggregates(review.agencyId);
    return review;
  }

  async reject(reviewId: string, moderatorId: string, notes: string) {
    return this.prisma.agencyReview.update({
      where: { id: reviewId },
      data: {
        publicationStatus: "hidden_by_admin",
        verificationStatus: "rejected",
        moderatedById: moderatorId,
        moderationNotes: notes,
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────

  /**
   * Basit content similarity check.
   * Aynı ajans için son 90 günde benzer review var mı?
   * Faz 2'de LLM embedding ile gerçek similarity.
   */
  private async computeSimilarity(
    content: string,
    agencyId: string,
  ): Promise<number> {
    const recentReviews = await this.prisma.agencyReview.findMany({
      where: {
        agencyId,
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      select: { content: true },
      take: 100,
    });

    const normalize = (s: string) =>
      s.toLowerCase().replace(/[^a-zçğıöşü0-9 ]/g, "").trim();
    const norm = normalize(content);
    let maxScore = 0;
    for (const r of recentReviews) {
      const other = normalize(r.content);
      if (!other) continue;
      // Çok basit: token Jaccard
      const aTokens = new Set(norm.split(/\s+/));
      const bTokens = new Set(other.split(/\s+/));
      const intersection = [...aTokens].filter((t) => bTokens.has(t)).length;
      const union = new Set([...aTokens, ...bTokens]).size || 1;
      const score = intersection / union;
      if (score > maxScore) maxScore = score;
    }
    return Number(maxScore.toFixed(3));
  }

  private verifyEmailHtml(
    name: string,
    agencyName: string,
    link: string,
  ): string {
    return `<!doctype html>
<html><body style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
  <h1 style="color: #0a1f4a; font-size: 22px;">Review'unuzu doğrulayın</h1>
  <p>Selam ${name},</p>
  <p><strong>${agencyName}</strong> hakkında yazdığınız review'u aldık.</p>
  <p>Devam etmek için aşağıdaki butona tıklayın — bu işlem e-posta adresinizi doğrular, sonrası MarkaRadar editör ekibi inceler.</p>
  <p style="margin: 24px 0;">
    <a href="${link}" style="background: #1e40af; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">E-postamı doğrula</a>
  </p>
  <p style="font-size: 13px; color: #64748b;">Veya: <a href="${link}" style="color:#1e40af;">${link}</a></p>
  <p style="font-size: 13px; color: #64748b;">Bu link 7 gün geçerlidir. Siz talep etmediyseniz dikkate almayın.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
  <p style="font-size: 12px; color: #94a3b8;">MarkaRadar AjansRadar · Doğrulanmış review sistemi</p>
</body></html>`;
  }
}
