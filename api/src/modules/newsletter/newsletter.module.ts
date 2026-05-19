import { Module } from "@nestjs/common";
import { NewsletterService } from "./newsletter.service";
import {
  NewsletterAdminController,
  NewsletterPublicController,
} from "./newsletter.controller";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [AiModule],
  controllers: [NewsletterPublicController, NewsletterAdminController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
