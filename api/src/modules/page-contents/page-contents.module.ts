import { Module } from "@nestjs/common";
import {
  PageContentsAdminController,
  PageContentsPublicController,
} from "./page-contents.controller";
import { PageContentsService } from "./page-contents.service";

@Module({
  controllers: [PageContentsPublicController, PageContentsAdminController],
  providers: [PageContentsService],
  exports: [PageContentsService],
})
export class PageContentsModule {}
