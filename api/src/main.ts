// Sentry önce yüklenmeli
import "./instrument";

// BigInt → string (Prisma BIGINT kolonları için JSON serialize)
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

import { NestFactory, Reflector } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Logger } from "nestjs-pino";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { json, raw } from "express";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { AuditInterceptor } from "./common/interceptors/audit.interceptor";
import { PrismaService } from "./shared/prisma/prisma.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Pino logger
  app.useLogger(app.get(Logger));

  // Graceful shutdown (PM2 reload, Ctrl+C)
  app.enableShutdownHooks();

  // Config
  const config = app.get(ConfigService);
  const port = config.get<number>("PORT", 4000);
  const corsOrigins =
    config.get<string>("CORS_ORIGINS", "").split(",").filter(Boolean);
  const isProd = config.get<string>("NODE_ENV") === "production";

  // Security
  app.use(helmet());
  app.use(cookieParser());

  // Webhook'lar için raw body (signature verify gerek)
  app.use(
    "/api/v1/webhooks/stripe",
    raw({ type: "application/json", verify: (req: any, _res, buf) => (req.rawBody = buf) }),
  );
  app.use(
    "/api/v1/webhooks/iyzico",
    raw({ type: "application/json", verify: (req: any, _res, buf) => (req.rawBody = buf) }),
  );
  // Diğer endpoint'lere normal JSON parser
  app.use(json({ limit: "5mb" }));

  // CORS — prod'da açık fallback yok
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : isProd ? false : true,
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global audit interceptor
  app.useGlobalInterceptors(
    new AuditInterceptor(app.get(Reflector), app.get(PrismaService)),
  );

  // API versioning
  app.setGlobalPrefix("api/v1", { exclude: ["health", "/"] });

  // Swagger (dev only)
  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("MarkaRadar API")
      .setDescription("Türkiye'nin AI-native pazarlama medyası — API")
      .setVersion("0.2.0")
      .addBearerAuth()
      .addCookieAuth("mr_access")
      .build();
    const doc = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, doc);
  }

  await app.listen(port);
  const logger = app.get(Logger);
  logger.log(`🚀 API hazır: http://localhost:${port}`);
  logger.log(`📚 Swagger:  http://localhost:${port}/docs`);
}

bootstrap();
