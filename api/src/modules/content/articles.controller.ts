import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ArticlesService } from "./articles.service";

@ApiTags("articles")
@Controller("articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  list(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("category") category?: string,
  ) {
    return this.articlesService.list({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      category,
    });
  }

  @Get(":slug")
  getOne(@Param("slug") slug: string) {
    return this.articlesService.getBySlug(slug);
  }
}
