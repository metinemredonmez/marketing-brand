import { Module } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import {
  ReportsAdminController,
  ReportsPublicController,
} from "./reports.controller";

@Module({
  controllers: [ReportsPublicController, ReportsAdminController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
