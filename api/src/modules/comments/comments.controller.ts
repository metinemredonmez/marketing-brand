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
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { CommentStatus, UserRole } from "@prisma/client";
import { CommentsService } from "./comments.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class CreateCommentDto {
  @IsString() @MinLength(5) @MaxLength(2000) content!: string;
  @IsOptional() @IsString() parentId?: string;
}

class SetStatusDto {
  @IsEnum(CommentStatus) status!: CommentStatus;
}

@ApiTags("comments (public)")
@Controller("comments")
export class CommentsPublicController {
  constructor(private readonly comments: CommentsService) {}

  @Get(":articleId")
  list(
    @Param("articleId") articleId: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.comments.list(articleId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @HttpCode(200)
  @Post(":id/upvote")
  upvote(@Param("id") id: string) {
    return this.comments.upvote(id);
  }

  @HttpCode(200)
  @Post(":id/report")
  report(@Param("id") id: string) {
    return this.comments.report(id);
  }
}

@ApiTags("comments (user)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard)
@Controller("comments-me")
export class CommentsUserController {
  constructor(private readonly comments: CommentsService) {}

  @Post(":articleId")
  create(
    @Param("articleId") articleId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.comments.create({
      articleId,
      userId: user.id,
      content: dto.content,
      parentId: dto.parentId,
    });
  }
}

@ApiTags("comments (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/comments")
export class CommentsAdminController {
  constructor(private readonly comments: CommentsService) {}

  @Get("queue")
  queue() {
    return this.comments.moderationQueue();
  }

  @Patch(":id/status")
  setStatus(@Param("id") id: string, @Body() dto: SetStatusDto) {
    return this.comments.setStatus(id, dto.status);
  }
}
