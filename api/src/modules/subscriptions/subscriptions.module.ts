import { Module } from "@nestjs/common";
import {
  SubscriptionsController,
  WebhooksController,
} from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { StripeProvider } from "./providers/stripe.provider";
import { IyzicoProvider } from "./providers/iyzico.provider";

@Module({
  controllers: [SubscriptionsController, WebhooksController],
  providers: [SubscriptionsService, StripeProvider, IyzicoProvider],
  exports: [SubscriptionsService, StripeProvider],
})
export class SubscriptionsModule {}
