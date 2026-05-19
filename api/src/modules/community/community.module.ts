import { Module } from "@nestjs/common";
import { CommunityService } from "./community.service";
import {
  CommunityAdminController,
  CommunityController,
} from "./community.controller";

@Module({
  controllers: [CommunityController, CommunityAdminController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
