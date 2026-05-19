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
import { IsDateString } from "class-validator";
import { ArticleStatus, UserRole } from "@prisma/client";
import { ArticlesAdminService } from "./articles-admin.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class ScheduleDto {
  @IsDateString() scheduledAt!: string;
}

@ApiTags("articles (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor, UserRole.writer)
@Controller("admin/articles")
export class ArticlesAdminController {
  constructor(private readonly articles: ArticlesAdminService) {}

  @Get()
  list(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("status") status?: ArticleStatus,
    @Query("categoryId") categoryId?: string,
    @Query("q") q?: string,
    @Query("authorId") authorId?: string,
  ) {
    return this.articles.list({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      status,
      categoryId,
      authorId,
      q,
    });
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.articles.getById(id);
  }

  @Audit({
    action: "article.create",
    resource: "article",
    resourceIdFrom: "result.id",
  })
  @Post()
  create(
    @Body() dto: CreateArticleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.articles.create(dto, user.id);
  }

  @Audit({
    action: "article.update",
    resource: "article",
    resourceIdFrom: "params.id",
  })
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: Partial<CreateArticleDto>) {
    return this.articles.update(id, dto);
  }

  @Audit({
    action: "article.publish",
    resource: "article",
    resourceIdFrom: "params.id",
  })
  @Post(":id/publish")
  publish(@Param("id") id: string) {
    return this.articles.publish(id);
  }

  @Audit({
    action: "article.unpublish",
    resource: "article",
    resourceIdFrom: "params.id",
  })
  @Post(":id/unpublish")
  unpublish(@Param("id") id: string) {
    return this.articles.unpublish(id);
  }

  @Audit({
    action: "article.schedule",
    resource: "article",
    resourceIdFrom: "params.id",
  })
  @Post(":id/schedule")
  schedule(@Param("id") id: string, @Body() dto: ScheduleDto) {
    return this.articles.schedule(id, new Date(dto.scheduledAt));
  }

  @Audit({
    action: "article.delete",
    resource: "article",
    resourceIdFrom: "params.id",
  })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.articles.softDelete(id);
  }
}
