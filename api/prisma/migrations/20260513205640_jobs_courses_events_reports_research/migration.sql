-- CreateEnum
CREATE TYPE "JobPlan" AS ENUM ('basic', 'featured', 'premium_distribution');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('pending', 'active', 'expired', 'filled', 'withdrawn');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('intern', 'junior', 'mid', 'senior', 'lead', 'director');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'part_time', 'freelance', 'contract', 'internship');

-- CreateEnum
CREATE TYPE "EmployerBrandPlan" AS ENUM ('starter', 'growth', 'premium');

-- CreateEnum
CREATE TYPE "CourseFormat" AS ENUM ('online_cohort', 'self_paced', 'in_person');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "CohortStatus" AS ENUM ('open', 'full', 'in_progress', 'completed', 'canceled');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('pending', 'paid', 'completed', 'refunded', 'canceled');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('summit', 'workshop', 'webinar', 'meetup', 'awards');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('draft', 'announced', 'registration_open', 'sold_out', 'in_progress', 'completed', 'canceled');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('submitted', 'reviewing', 'shortlist', 'finalist', 'winner', 'rejected');

-- CreateTable
CREATE TABLE "employer_brands" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "company_name" VARCHAR(150) NOT NULL,
    "tagline" VARCHAR(300),
    "about" TEXT,
    "culture_video_url" TEXT,
    "perks" JSONB,
    "team_size" VARCHAR(50),
    "founded_year" INTEGER,
    "website" TEXT,
    "linkedin_url" TEXT,
    "instagram_url" TEXT,
    "office_photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "team_photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "values" JSONB,
    "testimonials" JSONB,
    "plan" "EmployerBrandPlan" NOT NULL DEFAULT 'starter',
    "plan_starts_at" TIMESTAMPTZ,
    "plan_ends_at" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "employer_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_posts" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "company_name" VARCHAR(150) NOT NULL,
    "employer_brand_id" UUID,
    "category" VARCHAR(80) NOT NULL,
    "seniority" "SeniorityLevel" NOT NULL,
    "employment_type" "EmploymentType" NOT NULL,
    "location" VARCHAR(100),
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "salary_min" DECIMAL(10,2),
    "salary_max" DECIMAL(10,2),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'TRY',
    "apply_url" TEXT,
    "apply_email" VARCHAR(255),
    "plan" "JobPlan" NOT NULL DEFAULT 'basic',
    "published_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "status" "JobStatus" NOT NULL DEFAULT 'pending',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "apply_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "job_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "subtitle" VARCHAR(300),
    "description" TEXT,
    "cover_url" TEXT,
    "format" "CourseFormat" NOT NULL,
    "level" "CourseLevel" NOT NULL DEFAULT 'intermediate',
    "duration_weeks" INTEGER,
    "price_try" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "price_usd" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "early_bird_price_try" DECIMAL(12,2),
    "capacity" INTEGER,
    "syllabus" JSONB,
    "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instructor_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_cohorts" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "cohort_number" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "capacity" INTEGER,
    "enrolled_count" INTEGER NOT NULL DEFAULT 0,
    "status" "CohortStatus" NOT NULL DEFAULT 'open',
    "zoom_link" TEXT,
    "slack_channel_id" VARCHAR(80),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" UUID NOT NULL,
    "cohort_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount_paid_try" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "payment_method" VARCHAR(50),
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'pending',
    "invoice_url" TEXT,
    "completed_at" TIMESTAMPTZ,
    "certificate_url" TEXT,
    "nps_score" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "type" "EventType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "cover_url" TEXT,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "ends_at" TIMESTAMPTZ,
    "venue" VARCHAR(200),
    "city" VARCHAR(80),
    "capacity" INTEGER,
    "registered_count" INTEGER NOT NULL DEFAULT 0,
    "ticket_tiers" JSONB,
    "sponsor_tiers" JSONB,
    "status" "EventStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "award_submissions" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "submitter_id" UUID,
    "agency_id" UUID,
    "brand_name" VARCHAR(150),
    "campaign_title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "case_study_url" TEXT,
    "video_url" TEXT,
    "team_members" JSONB,
    "fee_paid_try" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'submitted',
    "jury_scores" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "award_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_tickets" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "user_id" UUID,
    "attendee_name" VARCHAR(150) NOT NULL,
    "attendee_email" VARCHAR(255) NOT NULL,
    "tier_name" VARCHAR(80) NOT NULL,
    "price_paid_try" DECIMAL(10,2) NOT NULL,
    "qr_code" VARCHAR(120) NOT NULL,
    "checked_in_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "cover_url" TEXT,
    "preview_url" TEXT,
    "file_key" VARCHAR(500),
    "page_count" INTEGER,
    "price_try" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "included_in_tier" VARCHAR(50),
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_panel_members" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_type" VARCHAR(50) NOT NULL,
    "company_size" VARCHAR(50),
    "industry" VARCHAR(80),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "honorarium_method" VARCHAR(50),
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_panel_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_surveys" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "questions" JSONB NOT NULL,
    "target_segments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fielded_at" TIMESTAMPTZ,
    "closed_at" TIMESTAMPTZ,
    "response_count" INTEGER NOT NULL DEFAULT 0,
    "report_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_responses" (
    "id" UUID NOT NULL,
    "survey_id" UUID NOT NULL,
    "user_id" UUID,
    "answers" JSONB NOT NULL,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employer_brands_slug_key" ON "employer_brands"("slug");

-- CreateIndex
CREATE INDEX "employer_brands_plan_is_active_idx" ON "employer_brands"("plan", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "job_posts_slug_key" ON "job_posts"("slug");

-- CreateIndex
CREATE INDEX "job_posts_status_published_at_idx" ON "job_posts"("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "job_posts_category_idx" ON "job_posts"("category");

-- CreateIndex
CREATE INDEX "job_posts_seniority_idx" ON "job_posts"("seniority");

-- CreateIndex
CREATE INDEX "job_posts_employer_brand_id_idx" ON "job_posts"("employer_brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "course_cohorts_start_date_idx" ON "course_cohorts"("start_date");

-- CreateIndex
CREATE UNIQUE INDEX "course_cohorts_course_id_cohort_number_key" ON "course_cohorts"("course_id", "cohort_number");

-- CreateIndex
CREATE INDEX "course_enrollments_user_id_idx" ON "course_enrollments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_cohort_id_user_id_key" ON "course_enrollments"("cohort_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_status_starts_at_idx" ON "events"("status", "starts_at");

-- CreateIndex
CREATE INDEX "award_submissions_event_id_status_idx" ON "award_submissions"("event_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "event_tickets_qr_code_key" ON "event_tickets"("qr_code");

-- CreateIndex
CREATE INDEX "event_tickets_event_id_idx" ON "event_tickets"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_slug_key" ON "reports"("slug");

-- CreateIndex
CREATE INDEX "research_panel_members_role_type_is_active_idx" ON "research_panel_members"("role_type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "research_panel_members_user_id_key" ON "research_panel_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "research_surveys_slug_key" ON "research_surveys"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "research_responses_survey_id_user_id_key" ON "research_responses"("survey_id", "user_id");

-- AddForeignKey
ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_employer_brand_id_fkey" FOREIGN KEY ("employer_brand_id") REFERENCES "employer_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_cohorts" ADD CONSTRAINT "course_cohorts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "course_cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "award_submissions" ADD CONSTRAINT "award_submissions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_responses" ADD CONSTRAINT "research_responses_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "research_surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
