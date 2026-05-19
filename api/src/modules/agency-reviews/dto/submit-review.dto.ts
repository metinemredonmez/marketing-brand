import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class SubmitReviewDto {
  // Reviewer
  @IsString() @MaxLength(150) reviewerName!: string;
  @IsString() @MaxLength(100) reviewerRole!: string;
  @IsEmail() reviewerEmail!: string;
  @IsString() @MaxLength(150) reviewerCompany!: string;
  @IsUrl() reviewerLinkedin!: string;

  // Proje
  @IsOptional() @IsString() @MaxLength(80) projectType?: string;
  @IsOptional() @IsString() @MaxLength(50) projectBudgetRange?: string;
  @IsOptional() @IsInt() @Min(1) projectDurationMonths?: number;

  // Puanlama (1-5)
  @IsInt() @Min(1) @Max(5) ratingOverall!: number;
  @IsInt() @Min(1) @Max(5) ratingQuality!: number;
  @IsInt() @Min(1) @Max(5) ratingCommunication!: number;
  @IsInt() @Min(1) @Max(5) ratingTimeline!: number;
  @IsInt() @Min(1) @Max(5) ratingValue!: number;

  // Yazılı içerik
  @IsString() @MaxLength(200) title!: string;
  @IsString() @MinLength(200) @MaxLength(5000) content!: string;
  @IsOptional() @IsString() pros?: string;
  @IsOptional() @IsString() cons?: string;
  @IsOptional() @IsString() wouldWorkAgain?: string;
  @IsOptional() @IsInt() @Min(0) @Max(10) npsScore?: number;

  // KVKK
  @IsOptional() consent?: boolean;
}
