import { Module } from "@nestjs/common";
import { BrandAccountsService } from "./accounts/brand-accounts.service";
import { BrandWalletService } from "./wallet/brand-wallet.service";
import { BrandCampaignsService } from "./campaigns/brand-campaigns.service";
import { BrandAiService } from "./ai/brand-ai.service";
import {
  BrandPublicController,
  BrandPortalController,
  BrandAdminController,
} from "./brand-portal.controllers";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [SubscriptionsModule, AiModule],
  controllers: [
    BrandPublicController,
    BrandPortalController,
    BrandAdminController,
  ],
  providers: [
    BrandAccountsService,
    BrandWalletService,
    BrandCampaignsService,
    BrandAiService,
  ],
  exports: [
    BrandAccountsService,
    BrandWalletService,
    BrandCampaignsService,
  ],
})
export class BrandPortalModule {}
