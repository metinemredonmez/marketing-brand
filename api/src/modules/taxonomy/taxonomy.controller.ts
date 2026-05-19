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
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { TagType, UserRole } from "@prisma/client";
import { TaxonomyService } from "./taxonomy.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

class CreateCategoryDto {
  @IsString() @MaxLength(120) name!: string;
  @IsOptional() @IsString() @MaxLength(120) slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsString() @MaxLength(160) seoTitle?: string;
  @IsOptional() @IsString() @MaxLength(320) seoDescription?: string;
  @IsOptional() @IsInt() orderIndex?: number;
}

class CreateTagDto {
  @IsString() @MaxLength(120) name!: string;
  @IsOptional() @IsString() @MaxLength(120) slug?: string;
  @IsOptional() @IsEnum(TagType) type?: TagType;
}

// ─── Public read ─────────────────────────────────────────

@ApiTags("taxonomy (public)")
@Controller("taxonomy")
export class TaxonomyPublicController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  @Get("categories")
  listCategories() {
    return this.taxonomy.listCategories();
  }

  @Get("tags")
  listTags(@Query("type") type?: TagType) {
    return this.taxonomy.listTags(type);
  }
}

// ─── Admin ────────────────────────────────────────────────

@ApiTags("taxonomy (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/taxonomy")
export class TaxonomyAdminController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  @Post("categories")
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.taxonomy.createCategory(dto);
  }

  @Patch("categories/:id")
  updateCategory(
    @Param("id") id: string,
    @Body() dto: Partial<CreateCategoryDto>,
  ) {
    return this.taxonomy.updateCategory(id, dto);
  }

  @Delete("categories/:id")
  deleteCategory(@Param("id") id: string) {
    return this.taxonomy.deleteCategory(id);
  }

  @Post("tags")
  createTag(@Body() dto: CreateTagDto) {
    return this.taxonomy.createTag(dto);
  }

  @Delete("tags/:id")
  deleteTag(@Param("id") id: string) {
    return this.taxonomy.deleteTag(id);
  }
}
