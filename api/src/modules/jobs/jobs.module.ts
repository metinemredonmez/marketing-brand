import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import {
  JobsPublicController,
  JobsAdminController,
} from "./jobs.controller";

@Module({
  controllers: [JobsPublicController, JobsAdminController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
