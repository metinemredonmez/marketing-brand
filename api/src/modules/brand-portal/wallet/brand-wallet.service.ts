import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WalletTransactionType } from "@prisma/client";
import { PrismaService } from "../../../shared/prisma/prisma.service";
import { StripeProvider } from "../../subscriptions/providers/stripe.provider";

@Injectable()
export class BrandWalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeProvider,
    private readonly config: ConfigService,
  ) {}

  /** Cüzdan + son işlemler */
  async getWallet(brandAccountId: string) {
    const wallet = await this.prisma.brandWallet.findUnique({
      where: { brandAccountId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });
    if (!wallet) throw new NotFoundException("Cüzdan bulunamadı");
    return wallet;
  }

  /** Bakiye yükleme Stripe Checkout başlat */
  async createRechargeCheckout(input: {
    brandAccountId: string;
    userEmail: string;
    amountTry: number;
  }) {
    if (input.amountTry < 1000) {
      throw new BadRequestException("Minimum yükleme: 1.000 TL");
    }
    if (input.amountTry > 500_000) {
      throw new BadRequestException(
        "Maksimum yükleme: 500.000 TL (büyük tutarlar için iletişim)",
      );
    }
    if (!this.stripe.isConfigured()) {
      throw new BadRequestException("Ödeme servisi yapılandırılmamış");
    }

    const webUrl =
      this.config.get<string>("WEB_URL") ?? "http://localhost:3003";

    // Stripe checkout session (TRY tek seferlik)
    const session = await this.stripe.client.checkout.sessions.create({
      mode: "payment",
      customer_email: input.userEmail,
      line_items: [
        {
          price_data: {
            currency: "try",
            product_data: {
              name: `MarkaRadar Brand Studio — Bakiye yükleme`,
              description: `${input.amountTry.toLocaleString("tr-TR")} TL cüzdan bakiyesi`,
            },
            unit_amount: input.amountTry * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${webUrl}/marka-paneli/cuzdan?recharge=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${webUrl}/marka-paneli/cuzdan?recharge=canceled`,
      metadata: {
        type: "brand_wallet_recharge",
        brandAccountId: input.brandAccountId,
        amountTry: String(input.amountTry),
      },
    });

    if (!session.url) {
      throw new BadRequestException("Checkout URL oluşturulamadı");
    }

    return { checkoutUrl: session.url, sessionId: session.id };
  }

  /** Stripe webhook: bakiye recharge başarılı */
  async handleRechargeCompleted(obj: Record<string, unknown>) {
    const metadata = (obj.metadata as Record<string, string>) ?? {};
    if (metadata.type !== "brand_wallet_recharge") return;
    const brandAccountId = metadata.brandAccountId;
    const amountTry = Number(metadata.amountTry);
    if (!brandAccountId || !amountTry) return;

    const stripePaymentId = obj.payment_intent as string | undefined;

    await this.creditWallet({
      brandAccountId,
      amountTry,
      description: `Stripe yükleme — ${amountTry.toLocaleString("tr-TR")} TL`,
      type: "recharge",
      stripePaymentId,
    });
  }

  /** Manual credit (admin bonus, vs) */
  async creditWallet(input: {
    brandAccountId: string;
    amountTry: number;
    description: string;
    type: WalletTransactionType;
    stripePaymentId?: string;
    campaignId?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.brandWallet.findUnique({
        where: { brandAccountId: input.brandAccountId },
      });
      if (!wallet) throw new NotFoundException("Cüzdan yok");

      const balanceBefore = Number(wallet.balanceTry);
      const balanceAfter = balanceBefore + input.amountTry;

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: input.type,
          amountTry: input.amountTry,
          balanceBefore,
          balanceAfter,
          description: input.description.slice(0, 300),
          campaignId: input.campaignId,
          stripePaymentId: input.stripePaymentId,
        },
      });

      await tx.brandWallet.update({
        where: { id: wallet.id },
        data: {
          balanceTry: balanceAfter,
          totalRechargedTry:
            input.type === "recharge"
              ? Number(wallet.totalRechargedTry) + input.amountTry
              : wallet.totalRechargedTry,
        },
      });

      return transaction;
    });
  }

  /**
   * Admin manuel düzeltme — pozitif değer kredi (bonus, refund, deneme),
   * negatif değer ise hata düzeltme (örn. yanlış approve sonrası geri çekim).
   */
  async adminAdjust(input: {
    brandAccountId: string;
    amountTry: number;
    reason: string;
    adminUserId: string;
  }) {
    if (input.amountTry === 0) {
      throw new BadRequestException("Tutar 0 olamaz");
    }
    if (input.reason.trim().length < 5) {
      throw new BadRequestException("Gerekçe en az 5 karakter olmalı");
    }
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.brandWallet.findUnique({
        where: { brandAccountId: input.brandAccountId },
      });
      if (!wallet) throw new NotFoundException("Cüzdan yok");

      const balanceBefore = Number(wallet.balanceTry);
      const balanceAfter = balanceBefore + input.amountTry;
      if (balanceAfter < 0) {
        throw new BadRequestException(
          `Bakiye negatife düşemez (mevcut: ${balanceBefore} TL)`,
        );
      }

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "adjustment",
          amountTry: input.amountTry,
          balanceBefore,
          balanceAfter,
          description: `Admin düzeltme (${input.adminUserId.slice(0, 8)}): ${input.reason.slice(0, 240)}`,
        },
      });

      await tx.brandWallet.update({
        where: { id: wallet.id },
        data: { balanceTry: balanceAfter },
      });

      return transaction;
    });
  }

  /** Campaign spend — bakiyeden düş */
  async debitWallet(input: {
    brandAccountId: string;
    amountTry: number;
    description: string;
    campaignId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.brandWallet.findUnique({
        where: { brandAccountId: input.brandAccountId },
      });
      if (!wallet) throw new NotFoundException("Cüzdan yok");

      const balanceBefore = Number(wallet.balanceTry);
      if (balanceBefore < input.amountTry) {
        throw new BadRequestException(
          `Yetersiz bakiye (mevcut: ${balanceBefore.toLocaleString("tr-TR")} TL, gereken: ${input.amountTry.toLocaleString("tr-TR")} TL)`,
        );
      }
      const balanceAfter = balanceBefore - input.amountTry;

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "spend",
          amountTry: -input.amountTry,
          balanceBefore,
          balanceAfter,
          description: input.description.slice(0, 300),
          campaignId: input.campaignId,
        },
      });

      await tx.brandWallet.update({
        where: { id: wallet.id },
        data: {
          balanceTry: balanceAfter,
          totalSpentTry: Number(wallet.totalSpentTry) + input.amountTry,
        },
      });

      return transaction;
    });
  }
}
