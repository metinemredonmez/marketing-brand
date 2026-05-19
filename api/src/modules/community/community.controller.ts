import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { UserRole } from "@prisma/client";
import { CommunityService } from "./community.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class JoinDto {
  @IsString() community!: string;
}

@ApiTags("community")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard)
@Controller("community")
export class CommunityController {
  constructor(private readonly community: CommunityService) {}

  @Get("me")
  myMemberships(@CurrentUser() user: CurrentUserPayload) {
    return this.community.myMemberships(user.id);
  }

  @Post("join")
  join(@Body() dto: JoinDto, @CurrentUser() user: CurrentUserPayload) {
    return this.community.addToCommunity(user.id, dto.community);
  }

  @Post("leave")
  leave(@Body() dto: JoinDto, @CurrentUser() user: CurrentUserPayload) {
    return this.community.removeFromCommunity(user.id, dto.community);
  }
}

@ApiTags("community (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/community")
export class CommunityAdminController {
  constructor(private readonly community: CommunityService) {}

  @Get(":community/members")
  members(@Param("community") community: string) {
    return this.community.listMembers(community);
  }
}
