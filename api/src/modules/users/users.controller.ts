import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { IsBoolean, IsEnum } from "class-validator";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.findById(user.id);
  }
}

// ──────────────────────────── ADMIN

class SetRoleDto {
  @IsEnum(UserRole) role!: UserRole;
}

class SetActiveDto {
  @IsBoolean() isActive!: boolean;
}

@ApiTags("users (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/users")
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(
    @Query("role") role?: UserRole,
    @Query("search") search?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.usersService.adminList({
      role,
      search,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Audit({
    action: "user.role_change",
    resource: "user",
    resourceIdFrom: "params.id",
  })
  @Post(":id/role")
  setRole(@Param("id") id: string, @Body() dto: SetRoleDto) {
    return this.usersService.adminSetRole(id, dto.role);
  }

  @Audit({
    action: "user.set_active",
    resource: "user",
    resourceIdFrom: "params.id",
  })
  @Post(":id/active")
  setActive(@Param("id") id: string, @Body() dto: SetActiveDto) {
    return this.usersService.adminSetActive(id, dto.isActive);
  }
}
