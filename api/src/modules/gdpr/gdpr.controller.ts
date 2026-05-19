import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { GdprService } from "./gdpr.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Audit } from "../../common/decorators/audit.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

@ApiTags("kvkk / gdpr")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard)
@Controller("me")
export class GdprController {
  constructor(private readonly gdpr: GdprService) {}

  @Audit({
    action: "user.data_export",
    resource: "user",
    resourceIdFrom: "result.user.id",
  })
  @Get("export")
  exportData(@CurrentUser() user: CurrentUserPayload) {
    return this.gdpr.exportUserData(user.id);
  }

  @Audit({ action: "user.deletion_requested", resource: "user" })
  @Post("delete")
  requestDeletion(@CurrentUser() user: CurrentUserPayload) {
    return this.gdpr.requestDeletion(user.id);
  }
}
