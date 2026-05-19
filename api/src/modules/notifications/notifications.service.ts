import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { EmailService } from "../../shared/mail/email.service";
import { NotificationsGateway } from "./notifications.gateway";

/**
 * MarkaRadar domain'i için notification tipleri.
 * Yeni tip ekleyince frontend tarafı da güncellenmeli.
 */
export type NotificationType =
  | "new_comment"
  | "new_inquiry"            // /reklam-ver formundan gelen leadler
  | "new_subscription"        // yeni MarkaRadar+ üye
  | "subscription_canceled"
  | "subscription_payment_failed"
  | "new_agency_review"       // doğrulanmamış review moderasyona düştü
  | "ai_generation_complete"  // AI Studio job tamamlandı
  | "newsletter_sent"
  | "system";

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Prisma.InputJsonValue;
  /** Belirli bir kullanıcıya yönelik (boşsa tüm admin'lere broadcast) */
  userId?: string;
  /** Ek olarak email ile de bildir */
  email?: { to: string; subject: string; html: string; replyTo?: string };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link,
        userId: input.userId,
        metadata: input.metadata ?? Prisma.JsonNull,
      },
    });

    // WebSocket ile gerçek-zamanlı push
    this.gateway.emitNotification(notification);

    // Mail (opsiyonel, fire-and-forget)
    if (input.email) {
      this.email
        .send({
          to: input.email.to,
          subject: input.email.subject,
          html: input.email.html,
          replyTo: input.email.replyTo,
        })
        .catch((err) =>
          this.logger.warn(`Notification mail başarısız: ${err.message}`),
        );
    }

    return notification;
  }

  async list(opts: {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
    userId?: string;
  } = {}) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 30;
    const where: Prisma.NotificationWhereInput = {};
    if (opts.unreadOnly) where.read = false;
    if (opts.userId !== undefined) {
      // Kullanıcıya özel + broadcast (userId null) olanları getir
      where.OR = [{ userId: opts.userId }, { userId: null }];
    }

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async unreadCount(userId?: string): Promise<number> {
    const where: Prisma.NotificationWhereInput = { read: false };
    if (userId !== undefined) {
      where.OR = [{ userId }, { userId: null }];
    }
    return this.prisma.notification.count({ where });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllRead(userId?: string) {
    const where: Prisma.NotificationWhereInput = { read: false };
    if (userId !== undefined) {
      where.OR = [{ userId }, { userId: null }];
    }
    await this.prisma.notification.updateMany({
      where,
      data: { read: true, readAt: new Date() },
    });
    return { ok: true };
  }
}
