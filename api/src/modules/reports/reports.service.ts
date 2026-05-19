import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import { uniqueSlug } from "../../common/utils/slug";

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // ─── Public ───────────────────────────────────────────────

  listPublished() {
    return this.prisma.report.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
    });
  }

  async getBySlug(slug: string) {
    const report = await this.prisma.report.findUnique({ where: { slug } });
    if (!report || !report.publishedAt) {
      throw new NotFoundException("Rapor bulunamadı");
    }
    return report;
  }

  /**
   * Premium download URL (signed). Kullanıcı ücretsiz raporu indirebilir
   * veya satın aldıysa / Pro+ üyeliği varsa premium raporu indirebilir.
   */
  async getDownloadUrl(
    slug: string,
    user?: { id: string; role: string },
  ): Promise<string> {
    const report = await this.getBySlug(slug);
    if (!report.fileKey) {
      throw new NotFoundException("Rapor dosyası mevcut değil");
    }

    // Erişim kontrolü
    if (report.isFree) {
      // Public
    } else if (report.includedInTier && user) {
      // Subscription tier kontrolü
      const sub = await this.prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: { in: ["active", "trialing"] },
          tier: report.includedInTier as
            | "founding_member"
            | "lite"
            | "pro"
            | "enterprise",
        },
      });
      if (!sub) {
        throw new ForbiddenException(
          `Bu rapor ${report.includedInTier} aboneliği gerektiriyor`,
        );
      }
    } else {
      throw new ForbiddenException("Bu rapora erişim yok (satın al)");
    }

    await this.prisma.report.update({
      where: { id: report.id },
      data: { downloadCount: { increment: 1 } },
    });

    return this.storage.presignedDownloadUrl(report.fileKey, 3600);
  }

  // ─── Admin ────────────────────────────────────────────────

  async create(input: {
    title: string;
    slug?: string;
    description?: string;
    coverUrl?: string;
    previewUrl?: string;
    fileKey?: string;
    pageCount?: number;
    priceTry?: number;
    isFree?: boolean;
    includedInTier?: string;
  }) {
    const slug = await uniqueSlug(
      input.slug ?? input.title,
      async (s) => !!(await this.prisma.report.findUnique({ where: { slug: s } })),
    );
    return this.prisma.report.create({
      data: {
        slug,
        title: input.title,
        description: input.description,
        coverUrl: input.coverUrl,
        previewUrl: input.previewUrl,
        fileKey: input.fileKey,
        pageCount: input.pageCount,
        priceTry: input.priceTry ?? 0,
        isFree: input.isFree ?? false,
        includedInTier: input.includedInTier,
      },
    });
  }

  publish(id: string) {
    return this.prisma.report.update({
      where: { id },
      data: { publishedAt: new Date() },
    });
  }
}
