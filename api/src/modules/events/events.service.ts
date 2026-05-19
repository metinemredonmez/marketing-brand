import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  EventStatus,
  EventType,
  Prisma,
  SubmissionStatus,
} from "@prisma/client";
import { randomBytes } from "crypto";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { uniqueSlug } from "../../common/utils/slug";

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Events ───────────────────────────────────────────────

  listPublic(params: { type?: EventType }) {
    return this.prisma.event.findMany({
      where: {
        status: { in: ["announced", "registration_open", "sold_out"] },
        ...(params.type ? { type: params.type } : {}),
      },
      orderBy: { startsAt: "asc" },
    });
  }

  async getBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
    });
    if (!event) throw new NotFoundException("Etkinlik bulunamadı");
    return event;
  }

  async createEvent(input: {
    type: EventType;
    title: string;
    slug?: string;
    description?: string;
    startsAt: Date;
    endsAt?: Date;
    venue?: string;
    city?: string;
    capacity?: number;
    ticketTiers?: unknown;
    sponsorTiers?: unknown;
  }) {
    const slug = await uniqueSlug(
      input.slug ?? input.title,
      async (s) => !!(await this.prisma.event.findUnique({ where: { slug: s } })),
    );
    return this.prisma.event.create({
      data: {
        slug,
        type: input.type,
        title: input.title,
        description: input.description,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        venue: input.venue,
        city: input.city,
        capacity: input.capacity,
        ticketTiers: input.ticketTiers as Prisma.InputJsonValue,
        sponsorTiers: input.sponsorTiers as Prisma.InputJsonValue,
      },
    });
  }

  setEventStatus(id: string, status: EventStatus) {
    return this.prisma.event.update({ where: { id }, data: { status } });
  }

  // ─── Tickets ──────────────────────────────────────────────

  async buyTicket(input: {
    eventId: string;
    attendeeName: string;
    attendeeEmail: string;
    tierName: string;
    pricePaidTry: number;
    userId?: string;
  }) {
    const event = await this.prisma.event.findUnique({
      where: { id: input.eventId },
    });
    if (!event) throw new NotFoundException("Etkinlik bulunamadı");
    if (event.capacity && event.registeredCount >= event.capacity) {
      throw new BadRequestException("Etkinlik doldu");
    }

    const qrCode = randomBytes(16).toString("hex");

    return this.prisma.$transaction([
      this.prisma.eventTicket.create({
        data: {
          eventId: input.eventId,
          userId: input.userId,
          attendeeName: input.attendeeName,
          attendeeEmail: input.attendeeEmail,
          tierName: input.tierName,
          pricePaidTry: input.pricePaidTry,
          qrCode,
        },
      }),
      this.prisma.event.update({
        where: { id: input.eventId },
        data: {
          registeredCount: { increment: 1 },
          ...(event.capacity && event.registeredCount + 1 >= event.capacity
            ? { status: "sold_out" }
            : {}),
        },
      }),
    ]);
  }

  async checkInTicket(qrCode: string) {
    const ticket = await this.prisma.eventTicket.findUnique({
      where: { qrCode },
    });
    if (!ticket) throw new NotFoundException("Bilet bulunamadı");
    if (ticket.checkedInAt) {
      return { ticket, alreadyCheckedIn: true };
    }
    const updated = await this.prisma.eventTicket.update({
      where: { id: ticket.id },
      data: { checkedInAt: new Date() },
    });
    return { ticket: updated, alreadyCheckedIn: false };
  }

  // ─── Award Submissions ────────────────────────────────────

  submitToAward(input: {
    eventId: string;
    category: string;
    submitterId: string;
    agencyId?: string;
    brandName?: string;
    campaignTitle: string;
    description: string;
    caseStudyUrl?: string;
    videoUrl?: string;
    teamMembers?: unknown;
    feePaidTry?: number;
  }) {
    return this.prisma.awardSubmission.create({
      data: {
        eventId: input.eventId,
        category: input.category,
        submitterId: input.submitterId,
        agencyId: input.agencyId,
        brandName: input.brandName,
        campaignTitle: input.campaignTitle,
        description: input.description,
        caseStudyUrl: input.caseStudyUrl,
        videoUrl: input.videoUrl,
        teamMembers: input.teamMembers as Prisma.InputJsonValue,
        feePaidTry: input.feePaidTry ?? 0,
      },
    });
  }

  setSubmissionStatus(
    id: string,
    status: SubmissionStatus,
    juryScores?: unknown,
  ) {
    return this.prisma.awardSubmission.update({
      where: { id },
      data: {
        status,
        ...(juryScores !== undefined
          ? { juryScores: juryScores as Prisma.InputJsonValue }
          : {}),
      },
    });
  }

  listSubmissions(eventId: string, status?: SubmissionStatus) {
    return this.prisma.awardSubmission.findMany({
      where: { eventId, ...(status ? { status } : {}) },
      orderBy: { createdAt: "asc" },
    });
  }
}
