import { Module } from "@nestjs/common";
import { AdsService } from "./ads.service";
import {
  AdsAdminController,
  AdsPublicController,
} from "./ads.controller";

@Module({
  controllers: [AdsPublicController, AdsAdminController],
  providers: [AdsService],
  exports: [AdsService],
})
export class AdsModule {}
