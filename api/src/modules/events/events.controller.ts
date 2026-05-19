import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import {
  EventStatus,
  EventType,
  SubmissionStatus,
  UserRole,
} from "@prisma/client";
import { EventsService } from "./events.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class CreateEventDto {
  @IsEnum(EventType) type!: EventType;
  @IsString() @MaxLength(200) title!: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsDateString() startsAt!: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsString() @MaxLength(200) venue?: string;
  @IsOptional() @IsString() @MaxLength(80) city?: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
  @IsOptional() ticketTiers?: unknown;
  @IsOptional() sponsorTiers?: unknown;
}

class BuyTicketDto {
  @IsString() @MaxLength(150) attendeeName!: string;
  @IsEmail() attendeeEmail!: string;
  @IsString() @MaxLength(80) tierName!: string;
  @IsNumber() @Min(0) pricePaidTry!: number;
}

class SubmitAwardDto {
  @IsString() @MaxLength(100) category!: string;
  @IsOptional() @IsString() agencyId?: string;
  @IsOptional() @IsString() @MaxLength(150) brandName?: string;
  @IsString() @MaxLength(200) campaignTitle!: string;
  @IsString() description!: string;
  @IsOptional() @IsString() caseStudyUrl?: string;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() teamMembers?: unknown;
  @IsOptional() @IsNumber() @Min(0) feePaidTry?: number;
}

class SetSubmissionStatusDto {
  @IsEnum(SubmissionStatus) status!: SubmissionStatus;
  @IsOptional() juryScores?: unknown;
}

// ─── PUBLIC ───────────────────────────────────────────────

@ApiTags("events (public)")
@Controller("events")
export class EventsPublicController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list(@Query("type") type?: EventType) {
    return this.events.listPublic({ type });
  }

  @Get(":slug")
  getOne(@Param("slug") slug: string) {
    return this.events.getBySlug(slug);
  }

  @Post(":eventId/tickets")
  buy(@Param("eventId") eventId: string, @Body() dto: BuyTicketDto) {
    return this.events.buyTicket({
      eventId,
      attendeeName: dto.attendeeName,
      attendeeEmail: dto.attendeeEmail,
      tierName: dto.tierName,
      pricePaidTry: dto.pricePaidTry,
    });
  }
}

// ─── USER (logged-in) ─────────────────────────────────────

@ApiTags("events (user)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard)
@Controller("events-me")
export class EventsUserController {
  constructor(private readonly events: EventsService) {}

  @Audit({
    action: "award.submit",
    resource: "award_submission",
    resourceIdFrom: "result.id",
  })
  @Post(":eventId/submissions")
  submit(
    @Param("eventId") eventId: string,
    @Body() dto: SubmitAwardDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.events.submitToAward({
      eventId,
      submitterId: user.id,
      ...dto,
    });
  }
}

// ─── ADMIN ────────────────────────────────────────────────

@ApiTags("events (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/events")
export class EventsAdminController {
  constructor(private readonly events: EventsService) {}

  @Audit({
    action: "event.create",
    resource: "event",
    resourceIdFrom: "result.id",
  })
  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.events.createEvent({
      type: dto.type,
      title: dto.title,
      slug: dto.slug,
      description: dto.description,
      startsAt: new Date(dto.startsAt),
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      venue: dto.venue,
      city: dto.city,
      capacity: dto.capacity,
      ticketTiers: dto.ticketTiers,
      sponsorTiers: dto.sponsorTiers,
    });
  }

  @Patch(":id/status")
  setStatus(
    @Param("id") id: string,
    @Body() body: { status: EventStatus },
  ) {
    return this.events.setEventStatus(id, body.status);
  }

  @Get(":eventId/submissions")
  listSubmissions(
    @Param("eventId") eventId: string,
    @Query("status") status?: SubmissionStatus,
  ) {
    return this.events.listSubmissions(eventId, status);
  }

  @Patch("submissions/:id/status")
  setSubmissionStatus(
    @Param("id") id: string,
    @Body() dto: SetSubmissionStatusDto,
  ) {
    return this.events.setSubmissionStatus(id, dto.status, dto.juryScores);
  }

  @HttpCode(200)
  @Post("tickets/check-in")
  checkIn(@Body() body: { qrCode: string }) {
    return this.events.checkInTicket(body.qrCode);
  }
}
