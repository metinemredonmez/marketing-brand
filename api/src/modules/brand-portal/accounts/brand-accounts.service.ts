import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BrandAccountRole,
  BrandAccountStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../../shared/prisma/prisma.service";
import { uniqueSlug } from "../../../common/utils/slug";

export interface BrandSignupInput {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  password: string;
  website?: string;
  industry?: string;
  companySize?: string;
}

@Injectable()
export class BrandAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Yeni marka hesabı + owner user oluştur (signup flow) */
  async signup(input: BrandSignupInput) {
    const email = input.contactEmail.toLowerCase();

    // Email collision kontrolü
    const [existingUser, existingBrand] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.brandAccount.findUnique({
        where: { contactEmail: email },
      }),
    ]);
    if (existingUser) {
      throw new ConflictException("Bu e-posta zaten kayıtlı");
    }
    if (existingBrand) {
      throw new ConflictException("Bu firma e-postası zaten kayıtlı");
    }

    const slug = await uniqueSlug(
      input.companyName,
      async (s) =>
        !!(await this.prisma.brandAccount.findUnique({ where: { slug: s } })),
    );
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Tek transaction'da user + brand account + owner + wallet + advertiser
    // NOT: `user` çıktısından `passwordHash` (ve diğer hassas alanlar)
    // istemciye dönmesin diye `select` ile sınırlandırılıyor.
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          fullName: input.contactName,
          passwordHash,
          role: "brand_user",
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
      });

      const brand = await tx.brandAccount.create({
        data: {
          slug,
          companyName: input.companyName,
          contactName: input.contactName,
          contactEmail: email,
          contactPhone: input.contactPhone,
          website: input.website,
          industry: input.industry,
          companySize: input.companySize,
          status: BrandAccountStatus.pending_kyc,
        },
      });

      await tx.brandAccountUser.create({
        data: {
          brandAccountId: brand.id,
          userId: user.id,
          role: BrandAccountRole.owner,
          acceptedAt: new Date(),
        },
      });

      await tx.brandWallet.create({
        data: { brandAccountId: brand.id },
      });

      // Advertiser kaydı (mevcut ad sistem için bridge)
      await tx.advertiser.create({
        data: {
          name: input.companyName,
          contactName: input.contactName,
          contactEmail: email,
          contactPhone: input.contactPhone,
          brandAccountId: brand.id,
        },
      });

      return { user, brand };
    });

    return result;
  }

  /** Kullanıcının üyesi olduğu brand account'ları getir */
  async listMyAccounts(userId: string) {
    return this.prisma.brandAccountUser.findMany({
      where: { userId, acceptedAt: { not: null } },
      include: {
        brandAccount: {
          include: { wallet: true },
        },
      },
    });
  }

  /** Spesifik brand account detay (üye olunmalı) */
  async getMyAccount(userId: string, brandAccountId: string) {
    const link = await this.prisma.brandAccountUser.findUnique({
      where: {
        brandAccountId_userId: { brandAccountId, userId },
      },
      include: {
        brandAccount: {
          include: { wallet: true, _count: { select: { creatives: true } } },
        },
      },
    });
    if (!link) throw new NotFoundException("Bu firmaya erişimin yok");
    return { ...link.brandAccount, role: link.role };
  }

  /** KYC bilgilerini tamamla */
  async submitKyc(
    brandAccountId: string,
    input: { taxNumber: string; taxOffice: string; website?: string },
  ) {
    if (!/^\d{10,11}$/.test(input.taxNumber)) {
      throw new BadRequestException(
        "Vergi numarası 10 veya 11 haneli olmalı",
      );
    }
    return this.prisma.brandAccount.update({
      where: { id: brandAccountId },
      data: {
        taxNumber: input.taxNumber,
        taxOffice: input.taxOffice,
        website: input.website,
        status: BrandAccountStatus.active,
      },
    });
  }

  /** Admin: KYC onayı bekleyen / aktif firma listesi */
  adminList(params: { status?: BrandAccountStatus }) {
    return this.prisma.brandAccount.findMany({
      where: params.status ? { status: params.status } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        wallet: true,
        _count: { select: { users: true, creatives: true } },
      },
    });
  }

  async adminSetStatus(id: string, status: BrandAccountStatus) {
    return this.prisma.brandAccount.update({
      where: { id },
      data: { status },
    });
  }

  // ─── Multi-user davet ─────────────────────────────────────

  async inviteUser(
    brandAccountId: string,
    invitedByUserId: string,
    invitedEmail: string,
    role: BrandAccountRole,
  ) {
    // Davet edenin yetkisini kontrol et
    const inviterLink = await this.prisma.brandAccountUser.findUnique({
      where: {
        brandAccountId_userId: { brandAccountId, userId: invitedByUserId },
      },
    });
    if (
      !inviterLink ||
      (inviterLink.role !== "owner" && inviterLink.role !== "manager")
    ) {
      throw new BadRequestException("Davet için yetki yok");
    }

    const invitedUser = await this.prisma.user.findUnique({
      where: { email: invitedEmail.toLowerCase() },
    });
    if (!invitedUser) {
      throw new BadRequestException(
        "Davet edilen kişi MarkaRadar'a önce kayıt olmalı",
      );
    }

    return this.prisma.brandAccountUser.upsert({
      where: {
        brandAccountId_userId: {
          brandAccountId,
          userId: invitedUser.id,
        },
      },
      update: { role },
      create: {
        brandAccountId,
        userId: invitedUser.id,
        role,
      },
    });
  }
}
