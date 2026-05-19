import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { PageContentsService } from "./page-contents.service";

// ── DTOs
class CreatePageDto {
  @IsString() @MinLength(2) @MaxLength(80) slug!: string;
  @IsString() @MinLength(2) @MaxLength(5) locale!: string;
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsArray() blocks!: Array<{ type: string; [k: string]: unknown }>;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}

class UpdatePageDto {
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsArray()
  blocks?: Array<{ type: string; [k: string]: unknown }>;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}

interface AuthedRequest {
  user?: { sub?: string; id?: string };
}

// ════════════════════════════════════════════════════════════════
// PUBLIC — sayfa render'ı için (web tarafı)
// ════════════════════════════════════════════════════════════════
@ApiTags("page-contents")
@Controller("page-contents")
export class PageContentsPublicController {
  constructor(private readonly svc: PageContentsService) {}

  @Get(":slug")
  async get(
    @Param("slug") slug: string,
    @Query("locale") locale?: string,
  ) {
    const page = await this.svc.get(slug, locale ?? "tr");
    if (!page) throw new NotFoundException("page_not_found");
    return page;
  }
}

// ════════════════════════════════════════════════════════════════
// ADMIN — yönetim
// ════════════════════════════════════════════════════════════════
@ApiTags("page-contents (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/page-contents")
export class PageContentsAdminController {
  constructor(private readonly svc: PageContentsService) {}

  @Get()
  list() {
    return this.svc.adminList();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.svc.adminGet(id);
  }

  @Post()
  create(@Body() dto: CreatePageDto, @Req() req: AuthedRequest) {
    const actorId = req.user?.sub ?? req.user?.id ?? "";
    return this.svc.adminCreate(actorId, dto);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePageDto,
    @Req() req: AuthedRequest,
  ) {
    const actorId = req.user?.sub ?? req.user?.id ?? "";
    return this.svc.adminUpdate(id, actorId, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.svc.adminDelete(id);
  }
}
