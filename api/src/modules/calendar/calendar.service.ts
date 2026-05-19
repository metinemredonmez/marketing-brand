import { Injectable, NotFoundException } from "@nestjs/common";
import {
  Prisma,
  CalendarEventType,
  CalendarEventStatus,
} from "@prisma/client";
import { PrismaService } from "../../shared/prisma/prisma.service";

export interface CreateEventInput {
  type: CalendarEventType;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt?: Date;
  allDay?: boolean;
  color?: string;
  location?: string;
  /** Çevrimiçi etkinlik linki (Zoom, Meet, Twitter Space, vb) */
  meetingUrl?: string;
  /** Davetli e-postaları (ekip + dışarıdan kişiler) */
  attendees?: string[];
  /** Yayın planı için makale referansı */
  articleId?: string;
  /** Ajans toplantısı için ajans referansı (faz 2'de agencies tablosu gelince) */
  agencyId?: string;
  /** Etkinlik takvimi (zirve, ödül töreni — faz 2'de events tablosu gelince) */
  eventRefId?: string;
  /** Kurs kohort oturumu (faz 2'de courses tablosu gelince) */
  courseCohortId?: string;
  /** Hatırlatma süresi (dakika) — örn 30 = etkinlikten 30dk önce */
  remindBefore?: number;
  /** Tekrarlanma (basit cron-ish): 'daily' | 'weekly' | 'monthly' */
  recurrence?: string;
  notes?: string;
  createdById?: string;
}

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateEventInput) {
    return this.prisma.calendarEvent.create({
      data: {
        type: input.type,
        title: input.title,
        description: input.description,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        allDay: input.allDay ?? false,
        color: input.color,
        location: input.location,
        meetingUrl: input.meetingUrl,
        attendees: input.attendees ?? [],
        articleId: input.articleId || null,
        agencyId: input.agencyId || null,
        eventRefId: input.eventRefId || null,
        courseCohortId: input.courseCohortId || null,
        remindBefore: input.remindBefore,
        recurrence: input.recurrence,
        notes: input.notes,
        createdById: input.createdById,
      },
      include: {
        article: { select: { slug: true, title: true } },
      },
    });
  }

  async list(opts: {
    fromDate?: Date;
    toDate?: Date;
    type?: CalendarEventType;
    status?: CalendarEventStatus;
    articleId?: string;
    agencyId?: string;
    createdById?: string;
  } = {}) {
    const where: Prisma.CalendarEventWhereInput = {};
    if (opts.fromDate || opts.toDate) {
      const range: { gte?: Date; lte?: Date } = {};
      if (opts.fromDate) range.gte = opts.fromDate;
      if (opts.toDate) range.lte = opts.toDate;
      where.startsAt = range;
    }
    if (opts.type) where.type = opts.type;
    if (opts.status) where.status = opts.status;
    if (opts.articleId) where.articleId = opts.articleId;
    if (opts.agencyId) where.agencyId = opts.agencyId;
    if (opts.createdById) where.createdById = opts.createdById;

    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { startsAt: "asc" },
      include: {
        article: { select: { slug: true, title: true } },
      },
    });
  }

  async findById(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        article: { select: { slug: true, title: true } },
      },
    });
    if (!event) throw new NotFoundException("Etkinlik bulunamadı");
    return event;
  }

  async update(
    id: string,
    dto: Partial<CreateEventInput> & { status?: CalendarEventStatus },
  ) {
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(dto)) {
      if (v !== undefined) data[k] = v;
    }
    return this.prisma.calendarEvent.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { ok: true };
  }

  /**
   * Makale yayın planı otomatik takvim event'i oluşturur.
   * articles.scheduledAt → CalendarEvent type=EDITORIAL
   */
  async syncEditorialEventsForArticle(
    articleId: string,
    scheduledAt: Date | null,
    title: string,
  ) {
    // Önceki editoryal event'i sil
    await this.prisma.calendarEvent.deleteMany({
      where: { articleId, type: "EDITORIAL" },
    });

    if (!scheduledAt) return { created: false };

    await this.prisma.calendarEvent.create({
      data: {
        type: "EDITORIAL",
        title: `Yayın: ${title}`,
        startsAt: scheduledAt,
        allDay: false,
        color: "#1e40af",
        articleId,
      },
    });
    return { created: true };
  }

  /** iCalendar (.ics) feed üretimi — kullanıcı Google Calendar'a abone olabilir */
  async generateIcsFeed(opts: {
    type?: CalendarEventType;
    createdById?: string;
  } = {}): Promise<string> {
    const events = await this.list({
      type: opts.type,
      createdById: opts.createdById,
    });

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MarkaRadar//Calendar//TR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:MarkaRadar Takvim",
      "X-WR-TIMEZONE:Europe/Istanbul",
    ];

    for (const ev of events) {
      const uid = `${ev.id}@markaradar.com`;
      const dtStart = this.toIcsDate(ev.startsAt);
      const dtEnd = ev.endsAt
        ? this.toIcsDate(ev.endsAt)
        : this.toIcsDate(
            new Date(ev.startsAt.getTime() + 60 * 60 * 1000),
          );

      lines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${this.toIcsDate(new Date())}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${this.escapeIcs(ev.title)}`,
        ev.description ? `DESCRIPTION:${this.escapeIcs(ev.description)}` : "",
        ev.location ? `LOCATION:${this.escapeIcs(ev.location)}` : "",
        ev.meetingUrl ? `URL:${ev.meetingUrl}` : "",
        `STATUS:${this.statusToIcs(ev.status)}`,
        "END:VEVENT",
      );
    }

    lines.push("END:VCALENDAR");
    return lines.filter(Boolean).join("\r\n");
  }

  private toIcsDate(d: Date): string {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  private escapeIcs(s: string): string {
    return s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }

  private statusToIcs(s: CalendarEventStatus): string {
    return s === "CANCELLED"
      ? "CANCELLED"
      : s === "DONE"
        ? "CONFIRMED"
        : "TENTATIVE";
  }
}
