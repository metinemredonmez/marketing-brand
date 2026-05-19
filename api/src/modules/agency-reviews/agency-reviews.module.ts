import { Module } from "@nestjs/common";
import { AgencyReviewsService } from "./agency-reviews.service";
import {
  AgencyReviewsPublicController,
  AgencyReviewsAdminController,
} from "./agency-reviews.controller";
import { AgenciesModule } from "../agencies/agencies.module";

@Module({
  imports: [AgenciesModule],
  controllers: [
    AgencyReviewsPublicController,
    AgencyReviewsAdminController,
  ],
  providers: [AgencyReviewsService],
})
export class AgencyReviewsModule {}
