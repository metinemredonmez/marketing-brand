import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SearchService } from "./search.service";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  global(
    @Query("q") q: string,
    @Query("limit") limit?: string,
  ) {
    return this.search.global(q ?? "", limit ? Number(limit) : 5);
  }
}
