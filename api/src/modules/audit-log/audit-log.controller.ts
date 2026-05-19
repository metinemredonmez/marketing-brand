import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { AuditLogService } from "./audit-log.service";

@ApiTags("audit-log (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/audit-log")
export class AuditLogController {
  constructor(private readonly svc: AuditLogService) {}

  @Get()
  list(
    @Query("action") action?: string,
    @Query("resource") resource?: string,
    @Query("resourceId") resourceId?: string,
    @Query("actorEmail") actorEmail?: string,
    @Query("failedOnly") failedOnly?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.svc.list({
      action,
      resource,
      resourceId,
      actorEmail,
      failedOnly: failedOnly === "true",
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get("actions")
  actions() {
    return this.svc.distinctActions();
  }

  @Get("resources")
  resources() {
    return this.svc.distinctResources();
  }

  @Get(":resource/:resourceId")
  history(
    @Param("resource") resource: string,
    @Param("resourceId") resourceId: string,
  ) {
    return this.svc.history(resource, resourceId);
  }
}
