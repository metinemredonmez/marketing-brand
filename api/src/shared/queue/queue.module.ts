import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { QueueService } from "./queue.service";
import {
  QUEUE_AI,
  QUEUE_MAIL,
  QUEUE_NEWSLETTER,
  QUEUE_SOCIAL,
} from "./queue.constants";

export {
  QUEUE_AI,
  QUEUE_MAIL,
  QUEUE_NEWSLETTER,
  QUEUE_SOCIAL,
} from "./queue.constants";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>("REDIS_HOST", "localhost"),
          port: config.get<number>("REDIS_PORT", 6390),
          password: config.get<string>("REDIS_PASSWORD") || undefined,
          db: config.get<number>("QUEUE_REDIS_DB", 1),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
          removeOnComplete: { count: 1000, age: 24 * 3600 },
          removeOnFail: { count: 5000, age: 7 * 24 * 3600 },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_AI },
      { name: QUEUE_MAIL },
      { name: QUEUE_NEWSLETTER },
      { name: QUEUE_SOCIAL },
    ),
  ],
  providers: [QueueService],
  exports: [BullModule, QueueService],
})
export class QueueModule {}
