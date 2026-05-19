import { z } from "zod";

export const envSchema = z.object({
  // App
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  APP_URL: z.string().url().default("http://localhost:4000"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("debug"),
  TZ: z.string().default("Europe/Istanbul"),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6390),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  QUEUE_REDIS_DB: z.coerce.number().default(1),

  // Auth
  JWT_SECRET: z.string().min(32, "JWT_SECRET en az 32 karakter olmalı"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  COOKIE_DOMAIN: z.string().default("localhost"),
  /** "true" | "false" — override. Boş ise NODE_ENV'e göre karar. */
  COOKIE_SECURE: z.enum(["true", "false"]).optional(),

  // Storage
  STORAGE_DRIVER: z.enum(["s3", "local"]).default("s3"),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_PUBLIC_URL: z.string().url(),

  // AI
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  DEFAULT_AI_MODEL: z.string().default("gpt-4o-mini"),
  AI_MONTHLY_BUDGET_USD: z.coerce.number().default(500),

  // Mail — giden
  MAIL_FROM: z.string().email().default("hello@markaradar.com"),
  MAIL_FROM_NAME: z.string().default("MarkaRadar"),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(1030),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_TLS_REJECT_UNAUTHORIZED: z.string().default("true"),

  // Mail — gelen (IMAP)
  IMAP_HOST: z.string().optional(),
  IMAP_PORT: z.coerce.number().default(993),
  IMAP_USER: z.string().optional(),
  IMAP_PASS: z.string().optional(),
  IMAP_SECURE: z.string().default("true"),
  IMAP_TLS_REJECT_UNAUTHORIZED: z.string().default("true"),

  // Payment
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  IYZICO_API_KEY: z.string().optional(),
  IYZICO_SECRET_KEY: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),

  // CORS + rate limit
  CORS_ORIGINS: z.string().default("http://localhost:3003,http://localhost:3004"),
  RATE_LIMIT_TTL: z.coerce.number().default(60),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const formatted = parsed.error.format();
    throw new Error(
      `❌ Env validation failed:\n${JSON.stringify(formatted, null, 2)}`,
    );
  }
  return parsed.data;
}
