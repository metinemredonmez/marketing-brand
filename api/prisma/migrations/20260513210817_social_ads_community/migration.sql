-- CreateEnum
CREATE TYPE "SocialChannel" AS ENUM ('linkedin', 'instagram', 'twitter', 'threads', 'tiktok', 'whatsapp_channel');

-- CreateEnum
CREATE TYPE "SocialPostFormat" AS ENUM ('text_post', 'carousel', 'reels', 'story', 'thread', 'short');

-- CreateEnum
CREATE TYPE "SocialPostStatus" AS ENUM ('draft', 'scheduled', 'published', 'failed');

-- CreateEnum
CREATE TYPE "AdvertiserStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "AdCampaignType" AS ENUM ('banner', 'sponsored_content', 'newsletter', 'native', 'agency_premium', 'job_premium');

-- CreateEnum
CREATE TYPE "AdCampaignStatus" AS ENUM ('draft', 'scheduled', 'active', 'paused', 'completed', 'canceled');

-- CreateEnum
CREATE TYPE "AdPlacement" AS ENUM ('homepage_top', 'category_top', 'article_inline', 'sidebar_sticky', 'mobile_sticky', 'newsletter_top');

-- CreateTable
CREATE TABLE "social_posts" (
    "id" UUID NOT NULL,
    "article_id" UUID,
    "channel" "SocialChannel" NOT NULL,
    "format" "SocialPostFormat" NOT NULL,
    "content" JSONB NOT NULL,
    "media_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scheduled_at" TIMESTAMPTZ,
    "published_at" TIMESTAMPTZ,
    "external_id" VARCHAR(200),
    "status" "SocialPostStatus" NOT NULL DEFAULT 'draft',
    "error_message" TEXT,
    "performance" JSONB,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "contact_name" VARCHAR(150),
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(50),
    "billing_info" JSONB,
    "status" "AdvertiserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertisers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_campaigns" (
    "id" UUID NOT NULL,
    "advertiser_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" "AdCampaignType" NOT NULL,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL,
    "budget" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'TRY',
    "targeting" JSONB,
    "status" "AdCampaignStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_slots" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "placement" "AdPlacement" NOT NULL,
    "creative_url" TEXT NOT NULL,
    "click_url" TEXT NOT NULL,
    "alt_text" VARCHAR(200),
    "weight" INTEGER NOT NULL DEFAULT 1,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL,
    "impressions" BIGINT NOT NULL DEFAULT 0,
    "clicks" BIGINT NOT NULL DEFAULT 0,
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_members" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "community" VARCHAR(50) NOT NULL,
    "slack_user_id" VARCHAR(80),
    "slack_channel_id" VARCHAR(80),
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "community_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "social_posts_article_id_idx" ON "social_posts"("article_id");

-- CreateIndex
CREATE INDEX "social_posts_channel_status_scheduled_at_idx" ON "social_posts"("channel", "status", "scheduled_at");

-- CreateIndex
CREATE INDEX "ad_campaigns_status_start_at_idx" ON "ad_campaigns"("status", "start_at");

-- CreateIndex
CREATE INDEX "ad_slots_placement_status_start_at_end_at_idx" ON "ad_slots"("placement", "status", "start_at", "end_at");

-- CreateIndex
CREATE INDEX "community_members_community_is_active_idx" ON "community_members"("community", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "community_members_user_id_community_key" ON "community_members"("user_id", "community");

-- AddForeignKey
ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_advertiser_id_fkey" FOREIGN KEY ("advertiser_id") REFERENCES "advertisers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_slots" ADD CONSTRAINT "ad_slots_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
