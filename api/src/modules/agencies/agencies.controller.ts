import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { IsEnum, IsInt, Min } from "class-validator";
import { AgencyTier, UserRole } from "@prisma/client";
import { AgenciesService } from "./agencies.service";
import { CreateAgencyDto } from "./dto/create-agency.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";

class SetTierDto {
  @IsEnum(AgencyTier) tier!: AgencyTier;
  @IsInt() @Min(1) durationMonths!: number;
}

// ─── PUBLIC ───────────────────────────────────────────────

@ApiTags("agencies (public)")
@Controller("agencies")
export class AgenciesPublicController {
  constructor(private readonly agencies: AgenciesService) {}

  @Get()
  list(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("tier") tier?: AgencyTier,
    @Query("city") city?: string,
    @Query("service") service?: string,
    @Query("q") q?: string,
  ) {
    return this.agencies.list({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      tier,
      city,
      service,
      q,
    });
  }

  @Get("ranking/top-50")
  topRanking() {
    return this.agencies.topRanking(50);
  }

  @Get(":slug")
  getOne(@Param("slug") slug: string) {
    return this.agencies.getBySlug(slug);
  }
}

// ─── ADMIN ────────────────────────────────────────────────

@ApiTags("agencies (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor, UserRole.sales)
@Controller("admin/agencies")
export class AgenciesAdminController {
  constructor(private readonly agencies: AgenciesService) {}

  @Audit({
    action: "agency.create",
    resource: "agency",
    resourceIdFrom: "result.id",
  })
  @Post()
  create(@Body() dto: CreateAgencyDto) {
    return this.agencies.create(dto);
  }

  @Audit({
    action: "agency.update",
    resource: "agency",
    resourceIdFrom: "params.id",
  })
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: Partial<CreateAgencyDto>) {
    return this.agencies.update(id, dto);
  }

  @Audit({
    action: "agency.set_tier",
    resource: "agency",
    resourceIdFrom: "params.id",
  })
  @Post(":id/tier")
  setTier(@Param("id") id: string, @Body() dto: SetTierDto) {
    return this.agencies.setTier(id, dto.tier, dto.durationMonths);
  }

  @Audit({
    action: "agency.deactivate",
    resource: "agency",
    resourceIdFrom: "params.id",
  })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.agencies.deactivate(id);
  }
}
