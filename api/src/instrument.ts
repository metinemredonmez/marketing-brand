// Sentry init — main.ts'den ÖNCE import edilmeli (instrument first pattern)
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    release: process.env.npm_package_version,
    tracesSampleRate:
      process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profilesSampleRate:
      process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    sendDefaultPii: false,
    integrations: [
      nodeProfilingIntegration(),
      // @sentry/node v8+ otomatik integration'lar (http, express, prisma, vb.)
    ],
    beforeSend(event) {
      // PII filtreleme — body/header'lardan hassas alanlar
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
      }
      // body içindeki şifreler
      if (event.request?.data && typeof event.request.data === "object") {
        const data = event.request.data as Record<string, unknown>;
        if ("password" in data) data.password = "[REDACTED]";
        if ("passwordHash" in data) data.passwordHash = "[REDACTED]";
        if ("token" in data) data.token = "[REDACTED]";
        if ("secret" in data) data.secret = "[REDACTED]";
      }
      return event;
    },
  });
  // eslint-disable-next-line no-console
  console.log(`[sentry] aktif (${process.env.NODE_ENV})`);
}
