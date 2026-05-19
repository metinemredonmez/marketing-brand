-- CreateEnum
CREATE TYPE "EmailDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('UNREAD', 'READ', 'DELETED');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('EDITORIAL', 'MEETING', 'EVENT', 'WEBINAR', 'COURSE_SESSION', 'CAMPAIGN', 'REMINDER', 'OTHER');

-- CreateEnum
CREATE TYPE "CalendarEventStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "email_messages" (
    "id" UUID NOT NULL,
    "direction" "EmailDirection" NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'UNREAD',
    "imap_uid" VARCHAR(50),
    "imap_folder" VARCHAR(50) NOT NULL DEFAULT 'INBOX',
    "message_id" VARCHAR(500),
    "in_reply_to" VARCHAR(500),
    "thread_key" VARCHAR(200),
    "from_address" VARCHAR(255) NOT NULL,
    "from_name" VARCHAR(200),
    "to_addresses" TEXT NOT NULL,
    "cc_addresses" TEXT,
    "subject" VARCHAR(500) NOT NULL DEFAULT '',
    "body_text" TEXT NOT NULL DEFAULT '',
    "body_html" TEXT NOT NULL DEFAULT '',
    "has_attachment" BOOLEAN NOT NULL DEFAULT false,
    "received_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fetched_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" UUID NOT NULL,
    "type" "CalendarEventType" NOT NULL,
    "status" "CalendarEventStatus" NOT NULL DEFAULT 'PLANNED',
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "ends_at" TIMESTAMPTZ,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "color" VARCHAR(20),
    "location" VARCHAR(300),
    "meeting_url" TEXT,
    "attendees" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "article_id" UUID,
    "agency_id" UUID,
    "event_ref_id" UUID,
    "course_cohort_id" UUID,
    "remind_before" INTEGER,
    "recurrence" VARCHAR(50),
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "type" VARCHAR(80) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "body" TEXT,
    "link" VARCHAR(500),
    "metadata" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_messages_direction_status_received_at_idx" ON "email_messages"("direction", "status", "received_at" DESC);

-- CreateIndex
CREATE INDEX "email_messages_thread_key_idx" ON "email_messages"("thread_key");

-- CreateIndex
CREATE UNIQUE INDEX "email_messages_imap_folder_imap_uid_key" ON "email_messages"("imap_folder", "imap_uid");

-- CreateIndex
CREATE INDEX "calendar_events_starts_at_idx" ON "calendar_events"("starts_at");

-- CreateIndex
CREATE INDEX "calendar_events_type_status_idx" ON "calendar_events"("type", "status");

-- CreateIndex
CREATE INDEX "calendar_events_article_id_idx" ON "calendar_events"("article_id");

-- CreateIndex
CREATE INDEX "calendar_events_created_by_idx" ON "calendar_events"("created_by");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_created_at_idx" ON "notifications"("user_id", "read", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
