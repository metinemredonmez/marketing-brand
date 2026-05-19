import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";

export interface AuditLogQuery {
  action?: string;
  resource?: string;
  resourceId?: string;
  actorId?: string;
  actorEmail?: string;
  successOnly?: boolean;
  failedOnly?: boolean;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: AuditLogQuery) {
    const limit = Math.min(q.limit ?? 50, 200);
    const offset = q.offset ?? 0;

    const where: Prisma.AuditLogWhereInput = {};
    if (q.action) where.action = q.action;
    if (q.resource) where.resource = q.resource;
    if (q.resourceId) where.resourceId = q.resourceId;
    if (q.actorId) where.actorId = q.actorId;
    if (q.actorEmail) {
      where.actorEmail = { contains: q.actorEmail, mode: "insensitive" };
    }
    if (q.successOnly) where.success = true;
    if (q.failedOnly) where.success = false;
    if (q.fromDate || q.toDate) {
      where.createdAt = {};
      if (q.fromDate) where.createdAt.gte = q.fromDate;
      if (q.toDate) where.createdAt.lte = q.toDate;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  /** Bir kaynağın tüm tarihçesi (resource + resourceId) */
  history(resource: string, resourceId: string) {
    return this.prisma.auditLog.findMany({
      where: { resource, resourceId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  /** Aksiyon türlerini distinct olarak getir (filter dropdown için) */
  async distinctActions() {
    const rows = await this.prisma.auditLog.groupBy({
      by: ["action"],
      orderBy: { action: "asc" },
    });
    return rows.map((r) => r.action);
  }

  async distinctResources() {
    const rows = await this.prisma.auditLog.groupBy({
      by: ["resource"],
      orderBy: { resource: "asc" },
    });
    return rows.map((r) => r.resource);
  }
}
