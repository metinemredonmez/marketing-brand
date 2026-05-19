-- CreateEnum
CREATE TYPE "NewsletterSubscriberStatus" AS ENUM ('pending', 'confirmed', 'unsubscribed', 'bounced', 'complained');

-- CreateEnum
CREATE TYPE "NewsletterIssueStatus" AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('pending', 'approved', 'rejected', 'spam');

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(150),
    "status" "NewsletterSubscriberStatus" NOT NULL DEFAULT 'pending',
    "segments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" VARCHAR(80),
    "confirm_token" VARCHAR(120),
    "confirmed_at" TIMESTAMPTZ,
    "unsubscribed_at" TIMESTAMPTZ,
    "last_open_at" TIMESTAMPTZ,
    "last_click_at" TIMESTAMPTZ,
    "open_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" UUID,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_issues" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "subject" VARCHAR(300) NOT NULL,
    "preheader" VARCHAR(200),
    "content_html" TEXT NOT NULL,
    "content_json" JSONB,
    "segments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scheduled_at" TIMESTAMPTZ,
    "sent_at" TIMESTAMPTZ,
    "sponsor_id" UUID,
    "sponsor_position" VARCHAR(50),
    "sponsor_revenue" DECIMAL(10,2),
    "total_recipients" INTEGER NOT NULL DEFAULT 0,
    "total_sent" INTEGER NOT NULL DEFAULT 0,
    "total_opens" INTEGER NOT NULL DEFAULT 0,
    "total_clicks" INTEGER NOT NULL DEFAULT 0,
    "total_unsubs" INTEGER NOT NULL DEFAULT 0,
    "status" "NewsletterIssueStatus" NOT NULL DEFAULT 'draft',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "newsletter_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "parent_id" UUID,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'pending',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "reported_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "article_id" UUID,
    "agency_id" UUID,
    "job_id" UUID,
    "report_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_status_created_at_idx" ON "newsletter_subscribers"("status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_issues_slug_key" ON "newsletter_issues"("slug");

-- CreateIndex
CREATE INDEX "newsletter_issues_status_scheduled_at_idx" ON "newsletter_issues"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "comments_article_id_status_created_at_idx" ON "comments"("article_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_created_at_idx" ON "bookmarks"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_article_id_key" ON "bookmarks"("user_id", "article_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_agency_id_key" ON "bookmarks"("user_id", "agency_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_job_id_key" ON "bookmarks"("user_id", "job_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_report_id_key" ON "bookmarks"("user_id", "report_id");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
