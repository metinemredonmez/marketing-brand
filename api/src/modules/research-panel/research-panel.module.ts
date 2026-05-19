import { Module } from "@nestjs/common";
import { ResearchPanelService } from "./research-panel.service";
import {
  ResearchPanelAdminController,
  ResearchPanelUserController,
} from "./research-panel.controller";

@Module({
  controllers: [ResearchPanelUserController, ResearchPanelAdminController],
  providers: [ResearchPanelService],
  exports: [ResearchPanelService],
})
export class ResearchPanelModule {}
