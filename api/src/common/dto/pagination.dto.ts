import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationDto {
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @ApiPropertyOptional({
    description: "İsteğe bağlı arama metni (her servis kendi alanlarına göre uygular)",
  })
  @IsOptional()
  @IsString()
  q?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export function paginated<T>(
  items: T[],
  total: number,
  dto: PaginationDto,
): PaginatedResult<T> {
  return {
    items,
    total,
    limit: dto.limit,
    offset: dto.offset,
    hasMore: dto.offset + items.length < total,
  };
}
