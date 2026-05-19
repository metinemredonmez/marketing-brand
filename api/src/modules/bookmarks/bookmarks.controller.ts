import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { BookmarksService } from "./bookmarks.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class ToggleDto {
  @IsOptional() @IsString() articleId?: string;
  @IsOptional() @IsString() agencyId?: string;
  @IsOptional() @IsString() jobId?: string;
  @IsOptional() @IsString() reportId?: string;
  @IsOptional() @IsString() notes?: string;
}

@ApiTags("bookmarks")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard)
@Controller("bookmarks")
export class BookmarksController {
  constructor(private readonly bookmarks: BookmarksService) {}

  @Get()
  list(
    @CurrentUser() user: CurrentUserPayload,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.bookmarks.list(user.id, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @HttpCode(200)
  @Post("toggle")
  toggle(@Body() dto: ToggleDto, @CurrentUser() user: CurrentUserPayload) {
    return this.bookmarks.toggle(user.id, dto);
  }
}
