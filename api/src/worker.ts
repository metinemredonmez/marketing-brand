// Sentry önce
import "./instrument";

// BigInt JSON polyfill
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

// Worker entry point — sadece BullMQ processor'ları çalıştırır
process.env.WORKER_ENABLED = "true";

import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { WorkerModule } from "./worker.module";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  const logger = app.get(Logger);
  logger.log("🛠️  MarkaRadar Worker hazır (BullMQ processors aktif)");
  logger.log("    Queues: ai-generation, mail-delivery, newsletter-send, social-post");
}

bootstrap();
