// Sentry client-side init (browser)
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_ENV ?? "development",
    tracesSampleRate:
      process.env.NEXT_PUBLIC_ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.0, // session replay kapalı (privacy)
    replaysOnErrorSampleRate: 1.0, // sadece hata olduğunda replay
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    sendDefaultPii: false,
  });
}
