import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { AgencyTier } from "@prisma/client";

export class CreateAgencyDto {
  @IsString() @MaxLength(150) name!: string;
  @IsOptional() @IsString() @MaxLength(150) slug?: string;
  @IsOptional() @IsString() @MaxLength(300) tagline?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() coverUrl?: string;
  @IsOptional() @IsInt() @Min(1900) foundedYear?: number;
  @IsOptional() @IsString() @MaxLength(50) teamSizeRange?: string;
  @IsOptional() @IsString() @MaxLength(80) city?: string;
  @IsOptional() @IsString() @MaxLength(80) country?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(50) phone?: string;
  @IsOptional() @IsString() linkedinUrl?: string;
  @IsOptional() @IsString() instagramUrl?: string;
  @IsOptional() @IsArray() services?: string[];
  @IsOptional() @IsArray() industries?: string[];
  @IsOptional() @IsArray() clientReferences?: string[];
  @IsOptional() @IsEnum(AgencyTier) tier?: AgencyTier;
}
