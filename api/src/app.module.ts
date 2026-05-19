import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { validateEnv } from "./config/env.validation";
import { PrismaModule } from "./shared/prisma/prisma.module";
import { RedisModule } from "./shared/redis/redis.module";
import { SharedMailModule } from "./shared/mail/mail.module";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ContentModule } from "./modules/content/content.module";
import { MailModule } from "./modules/mail/mail.module";
import { CalendarModule } from "./modules/calendar/calendar.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { AiModule } from "./modules/ai/ai.module";
import { QueueModule } from "./shared/queue/queue.module";
import { StorageModule } from "./shared/storage/storage.module";
import { MediaModule } from "./modules/media/media.module";
import { ArticlesAdminModule } from "./modules/articles-admin/articles-admin.module";
import { TaxonomyModule } from "./modules/taxonomy/taxonomy.module";
import { AgenciesModule } from "./modules/agencies/agencies.module";
import { AgencyReviewsModule } from "./modules/agency-reviews/agency-reviews.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { EmployerBrandsModule } from "./modules/employer-brands/employer-brands.module";
import { CoursesModule } from "./modules/courses/courses.module";
import { EventsModule } from "./modules/events/events.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { ResearchPanelModule } from "./modules/research-panel/research-panel.module";
import { SearchModule } from "./modules/search/search.module";
import { SocialModule } from "./modules/social/social.module";
import { AdsModule } from "./modules/ads/ads.module";
import { GdprModule } from "./modules/gdpr/gdpr.module";
import { CommunityModule } from "./modules/community/community.module";
import { NewsletterModule } from "./modules/newsletter/newsletter.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { BookmarksModule } from "./modules/bookmarks/bookmarks.module";
import { BrandPortalModule } from "./modules/brand-portal/brand-portal.module";
import { AuditLogModule } from "./modules/audit-log/audit-log.module";
import { PageContentsModule } from "./modules/page-contents/page-contents.module";

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
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: "HH:MM:ss.l",
                    ignore: "pid,hostname,req.headers,res.headers",
                  },
                }
              : undefined,
          autoLogging: { ignore: (req) => req.url === "/health" },
          redact: {
            paths: [
              "req.headers.authorization",
              "req.headers.cookie",
              "req.body.password",
              "req.body.passwordHash",
              "req.body.refreshToken",
              "req.body.token",
              "req.body.secret",
              "*.password",
              "*.passwordHash",
              "*.token",
              "*.secret",
              "*.creditCard",
            ],
            censor: "[REDACTED]",
          },
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          name: "default",
          ttl: Number(process.env.RATE_LIMIT_TTL || 60) * 1000,
          limit: Number(process.env.RATE_LIMIT_MAX || 100),
        },
        {
          name: "auth",
          ttl: 60_000, // 1 dk
          limit: 5,    // brute force koruma
        },
        {
          name: "ai",
          ttl: 3_600_000, // 1 saat
          limit: 30,      // saatte 30 AI üretim / kullanıcı (bütçe koruması)
        },
      ],
    }),
    PrismaModule,
    RedisModule,
    SharedMailModule,
    StorageModule,
    QueueModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ContentModule,
    MailModule,
    CalendarModule,
    NotificationsModule,
    SubscriptionsModule,
    AiModule,
    MediaModule,
    ArticlesAdminModule,
    TaxonomyModule,
    AgenciesModule,
    AgencyReviewsModule,
    JobsModule,
    EmployerBrandsModule,
    CoursesModule,
    EventsModule,
    ReportsModule,
    ResearchPanelModule,
    SearchModule,
    SocialModule,
    AdsModule,
    GdprModule,
    CommunityModule,
    NewsletterModule,
    CommentsModule,
    BookmarksModule,
    BrandPortalModule,
    AuditLogModule,
    PageContentsModule,
  ],
})
export class AppModule {}
