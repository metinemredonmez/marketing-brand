import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { validateEnv } from "./config/env.validation";
import { PrismaModule } from "./shared/prisma/prisma.module";
import { RedisModule } from "./shared/redis/redis.module";
import { SharedMailModule } from "./shared/mail/mail.module";
import { StorageModule } from "./shared/storage/storage.module";
import { QueueModule } from "./shared/queue/queue.module";
import { AiModule } from "./modules/ai/ai.module";
import { SocialModule } from "./modules/social/social.module";
import { NewsletterModule } from "./modules/newsletter/newsletter.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { MailProcessor } from "./shared/queue/processors/mail.processor";
import { AiProcessor } from "./shared/queue/processors/ai.processor";
import { SocialProcessor } from "./shared/queue/processors/social.processor";
import { NewsletterProcessor } from "./shared/queue/processors/newsletter.processor";
import {
  MaintenanceProcessor,
  HourlyMailProcessor,
} from "./shared/queue/processors/maintenance.processor";
import { CronBootstrapService } from "./shared/queue/cron/cron-bootstrap.service";

/**
 * Worker app — BullMQ job processor'ları çalıştırır.
 * API'den ayrı PM2 process (WORKER_ENABLED=true).
 *
 * Newsletter + Maintenance processor'lar burada (cross-module dependency).
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: {
          level: process.env.LOG_LEVEL || "debug",
          transport:
            process.env.NODE_ENV !== "production"
              ? {
                  target: "pino-pretty",
                  options: { colorize: true, singleLine: true },
                }
              : undefined,
        },
      }),
    }),
    PrismaModule,
    RedisModule,
    SharedMailModule,
    StorageModule,
    QueueModule,
    AiModule,
    SocialModule,
    NewsletterModule,
    SubscriptionsModule,
  ],
  providers: [
    MailProcessor,
    AiProcessor,
    SocialProcessor,
    NewsletterProcessor,
    MaintenanceProcessor,
    HourlyMailProcessor,
    CronBootstrapService,
  ],
})
export class WorkerModule {}
