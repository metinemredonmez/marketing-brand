import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { CalendarEventStatus, CalendarEventType } from "@prisma/client";
import { CalendarService } from "./calendar.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class CreateEventDto {
  @IsEnum(CalendarEventType) type!: CalendarEventType;
  @IsString() @MaxLength(200) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsDateString() startsAt!: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsBoolean() allDay?: boolean;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() meetingUrl?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(50) attendees?: string[];
  @IsOptional() @IsString() articleId?: string;
  @IsOptional() @IsString() agencyId?: string;
  @IsOptional() @IsString() eventRefId?: string;
  @IsOptional() @IsString() courseCohortId?: string;
  @IsOptional() @IsInt() remindBefore?: number;
  @IsOptional() @IsString() recurrence?: string;
  @IsOptional() @IsString() notes?: string;
}

class UpdateEventDto {
  @IsOptional() @IsEnum(CalendarEventType) type?: CalendarEventType;
  @IsOptional() @IsEnum(CalendarEventStatus) status?: CalendarEventStatus;
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsBoolean() allDay?: boolean;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() meetingUrl?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(50) attendees?: string[];
  @IsOptional() @IsString() articleId?: string;
  @IsOptional() @IsString() agencyId?: string;
  @IsOptional() @IsString() eventRefId?: string;
  @IsOptional() @IsString() courseCohortId?: string;
  @IsOptional() @IsInt() remindBefore?: number;
  @IsOptional() @IsString() recurrence?: string;
  @IsOptional() @IsString() notes?: string;
}

@ApiTags("calendar")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@Controller("admin/calendar")
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  /** Public iCalendar feed — :id'den ÖNCE tanımlanmalı (route order kritik) */
  @Get("feed.ics")
  @Header("Content-Type", "text/calendar; charset=utf-8")
  @Header("Content-Disposition", 'inline; filename="markaradar.ics"')
  async icsFeed(
    @Res() res: Response,
    @Query("type") type?: CalendarEventType,
  ) {
    const body = await this.calendar.generateIcsFeed({ type });
    res.send(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  list(
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string,
    @Query("type") type?: CalendarEventType,
    @Query("status") status?: CalendarEventStatus,
    @Query("articleId") articleId?: string,
    @Query("agencyId") agencyId?: string,
  ) {
    return this.calendar.list({
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      type,
      status,
      articleId,
      agencyId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.calendar.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.calendar.create({
      ...dto,
      startsAt: new Date(dto.startsAt),
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      createdById: user.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateEventDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.startsAt) data.startsAt = new Date(dto.startsAt);
    if (dto.endsAt) data.endsAt = new Date(dto.endsAt);
    return this.calendar.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.calendar.remove(id);
  }
}
