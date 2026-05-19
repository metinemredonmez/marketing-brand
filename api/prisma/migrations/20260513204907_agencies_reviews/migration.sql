-- CreateEnum
CREATE TYPE "AgencyTier" AS ENUM ('free', 'basic', 'premium', 'featured', 'elite');

-- CreateEnum
CREATE TYPE "AgencyVerificationLevel" AS ENUM ('unverified', 'email_verified', 'linkedin_verified', 'fully_verified');

-- CreateEnum
CREATE TYPE "ReviewVerificationStatus" AS ENUM ('pending', 'email_pending', 'email_verified', 'linkedin_verified', 'fully_verified', 'rejected');

-- CreateEnum
CREATE TYPE "ReviewPublicationStatus" AS ENUM ('draft', 'submitted', 'published', 'hidden_by_admin', 'withdrawn_by_user');

-- CreateTable
CREATE TABLE "agencies" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "logo_url" TEXT,
    "cover_url" TEXT,
    "tagline" VARCHAR(300),
    "description" TEXT,
    "founded_year" INTEGER,
    "team_size_range" VARCHAR(50),
    "city" VARCHAR(80),
    "country" VARCHAR(80) NOT NULL DEFAULT 'TR',
    "website" TEXT,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "linkedin_url" TEXT,
    "instagram_url" TEXT,
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "client_references" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "awards" JSONB,
    "featured_works" JSONB,
    "tier" "AgencyTier" NOT NULL DEFAULT 'free',
    "tier_starts_at" TIMESTAMPTZ,
    "tier_ends_at" TIMESTAMPTZ,
    "verification_level" "AgencyVerificationLevel" NOT NULL DEFAULT 'unverified',
    "verified_at" TIMESTAMPTZ,
    "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "owner_user_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_reviews" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "reviewer_name" VARCHAR(150) NOT NULL,
    "reviewer_role" VARCHAR(100),
    "reviewer_email" VARCHAR(255) NOT NULL,
    "reviewer_company" VARCHAR(150),
    "reviewer_linkedin" TEXT,
    "project_type" VARCHAR(80),
    "project_budget_range" VARCHAR(50),
    "project_duration_months" INTEGER,
    "project_started_at" TIMESTAMPTZ,
    "rating_overall" INTEGER NOT NULL,
    "rating_quality" INTEGER NOT NULL,
    "rating_communication" INTEGER NOT NULL,
    "rating_timeline" INTEGER NOT NULL,
    "rating_value" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "pros" TEXT,
    "cons" TEXT,
    "would_work_again" VARCHAR(20),
    "nps_score" INTEGER,
    "verification_status" "ReviewVerificationStatus" NOT NULL DEFAULT 'pending',
    "verification_token" VARCHAR(255),
    "verified_at" TIMESTAMPTZ,
    "publication_status" "ReviewPublicationStatus" NOT NULL DEFAULT 'submitted',
    "moderation_notes" TEXT,
    "moderated_by" UUID,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "similarity_score" DECIMAL(4,3),
    "agency_response" TEXT,
    "agency_response_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "agency_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agencies_slug_key" ON "agencies"("slug");

-- CreateIndex
CREATE INDEX "agencies_tier_is_active_idx" ON "agencies"("tier", "is_active");

-- CreateIndex
CREATE INDEX "agencies_city_idx" ON "agencies"("city");

-- CreateIndex
CREATE INDEX "agencies_rating_avg_review_count_idx" ON "agencies"("rating_avg" DESC, "review_count" DESC);

-- CreateIndex
CREATE INDEX "agency_reviews_agency_id_publication_status_idx" ON "agency_reviews"("agency_id", "publication_status");

-- CreateIndex
CREATE INDEX "agency_reviews_verification_status_idx" ON "agency_reviews"("verification_status");

-- CreateIndex
CREATE INDEX "agency_reviews_publication_status_created_at_idx" ON "agency_reviews"("publication_status", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "agency_reviews" ADD CONSTRAINT "agency_reviews_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
