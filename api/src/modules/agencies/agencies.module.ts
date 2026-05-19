import { Module } from "@nestjs/common";
import { AgenciesService } from "./agencies.service";
import {
  AgenciesPublicController,
  AgenciesAdminController,
} from "./agencies.controller";

@Module({
  controllers: [AgenciesPublicController, AgenciesAdminController],
  providers: [AgenciesService],
  exports: [AgenciesService],
})
export class AgenciesModule {}
