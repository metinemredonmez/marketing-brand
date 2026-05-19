import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { IsEnum } from "class-validator";
import {
  BillingInterval,
  PaymentProvider,
  SubscriptionTier,
} from "@prisma/client";
import { SubscriptionsService } from "./subscriptions.service";
import { StripeProvider } from "./providers/stripe.provider";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class CreateCheckoutDto {
  @IsEnum(SubscriptionTier)
  tier!: SubscriptionTier;

  @IsEnum(BillingInterval)
  billingInterval!: BillingInterval;

  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;
}

@ApiTags("subscriptions")
@Controller("subscriptions")
export class SubscriptionsController {
  private readonly logger = new Logger(SubscriptionsController.name);

  constructor(
    private readonly subscriptions: SubscriptionsService,
    private readonly stripe: StripeProvider,
  ) {}

  /** Public — tarife listesi (premium landing page'i için) */
  @Get("tiers")
  listTiers() {
    return this.subscriptions.listTiers();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth("mr_access")
  @Get("me")
  async getMine(@CurrentUser() user: CurrentUserPayload) {
    const [current, all] = await Promise.all([
      this.subscriptions.getCurrent(user.id),
      this.subscriptions.listMine(user.id),
    ]);
    return { current, history: all };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth("mr_access")
  @Post("checkout")
  async checkout(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.subscriptions.createCheckout({
      userId: user.id,
      userEmail: user.email,
      tier: dto.tier,
      billingInterval: dto.billingInterval,
      provider: dto.provider,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth("mr_access")
  @HttpCode(200)
  @Post("cancel")
  cancel(@CurrentUser() user: CurrentUserPayload) {
    return this.subscriptions.cancelAtPeriodEnd(user.id);
  }
}

/** Webhook controller — auth yok, signature ile doğrulanır */
@ApiTags("webhooks")
@Controller("webhooks")
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly subscriptions: SubscriptionsService,
    private readonly stripe: StripeProvider,
  ) {}

  @HttpCode(200)
  @Post("stripe")
  async stripe_(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("stripe-signature") signature: string,
  ) {
    if (!this.stripe.isConfigured()) {
      throw new UnauthorizedException("Stripe yapılandırılmadı");
    }
    if (!signature) {
      throw new UnauthorizedException("Stripe signature header yok");
    }
    if (!req.rawBody) {
      throw new UnauthorizedException("Raw body alınamadı");
    }

    let event;
    try {
      event = this.stripe.verifyWebhookSignature(req.rawBody, signature);
    } catch (err) {
      this.logger.error(
        `Stripe webhook signature invalid: ${(err as Error).message}`,
      );
      throw new UnauthorizedException("Geçersiz signature");
    }

    return this.subscriptions.handleStripeEvent(
      event as unknown as { id: string; type: string; data: { object: Record<string, unknown> } },
    );
  }

  @HttpCode(200)
  @Post("iyzico")
  iyzico_() {
    // TODO: iyzico webhook handler (faz 2)
    return { ok: true, note: "iyzico webhook stub" };
  }
}
