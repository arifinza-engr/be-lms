CREATE TYPE "public"."MessageType" AS ENUM('USER', 'AI');--> statement-breakpoint
CREATE TYPE "public"."ProgressStatus" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('SISWA', 'ADMIN', 'GURU');--> statement-breakpoint
CREATE TABLE "ai_chat_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"subchapterId" uuid NOT NULL,
	"message" text NOT NULL,
	"messageType" "MessageType" NOT NULL,
	"audioUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_generated_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subchapterId" uuid NOT NULL,
	"content" text NOT NULL,
	"audioUrl" text,
	"isInitial" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_content_subchapter_initial_unique" UNIQUE("subchapterId","isInitial")
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"subjectId" uuid NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chapters_title_subject_unique" UNIQUE("title","subjectId")
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "grades_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "metahuman_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"subchapterId" uuid NOT NULL,
	"sessionData" jsonb NOT NULL,
	"duration" integer,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"quizId" uuid NOT NULL,
	"answers" jsonb NOT NULL,
	"score" double precision NOT NULL,
	"maxScore" double precision NOT NULL,
	"percentage" double precision NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	"timeSpent" integer,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quizId" uuid NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"correctAnswer" varchar(10) NOT NULL,
	"explanation" text,
	"order" integer DEFAULT 0 NOT NULL,
	"points" double precision DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subchapterId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"timeLimit" integer,
	"passingScore" double precision DEFAULT 70 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quizzes_subchapter_title_unique" UNIQUE("subchapterId","title")
);
--> statement-breakpoint
CREATE TABLE "subchapter_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subchapterId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"fileName" varchar(255) NOT NULL,
	"fileUrl" text NOT NULL,
	"fileType" varchar(50) NOT NULL,
	"fileSize" integer,
	"mimeType" varchar(100),
	"thumbnailUrl" text,
	"duration" integer,
	"uploadedBy" uuid NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subchapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"chapterId" uuid NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subchapters_title_chapter_unique" UNIQUE("title","chapterId")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"gradeId" uuid NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_title_grade_unique" UNIQUE("title","gradeId")
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"subchapterId" uuid NOT NULL,
	"status" "ProgressStatus" DEFAULT 'NOT_STARTED' NOT NULL,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_progress_user_subchapter_unique" UNIQUE("userId","subchapterId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "UserRole" DEFAULT 'SISWA' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"refreshToken" text,
	"refreshTokenExpiresAt" timestamp,
	"resetToken" varchar(255),
	"resetTokenExpiresAt" timestamp,
	"lastLoginAt" timestamp,
	"passwordChangedAt" timestamp,
	"loginAttempts" integer DEFAULT 0 NOT NULL,
	"lockedUntil" timestamp,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"emailVerificationToken" varchar(255),
	"emailVerificationExpiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_chat_logs" ADD CONSTRAINT "ai_chat_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_logs" ADD CONSTRAINT "ai_chat_logs_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES "public"."subchapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generated_content" ADD CONSTRAINT "ai_generated_content_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES "public"."subchapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subjectId_subjects_id_fk" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metahuman_sessions" ADD CONSTRAINT "metahuman_sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metahuman_sessions" ADD CONSTRAINT "metahuman_sessions_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES "public"."subchapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_quizzes_id_fk" FOREIGN KEY ("quizId") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_quizzes_id_fk" FOREIGN KEY ("quizId") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES "public"."subchapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subchapter_materials" ADD CONSTRAINT "subchapter_materials_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES "public"."subchapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subchapter_materials" ADD CONSTRAINT "subchapter_materials_uploadedBy_users_id_fk" FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subchapters" ADD CONSTRAINT "subchapters_chapterId_chapters_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_gradeId_grades_id_fk" FOREIGN KEY ("gradeId") REFERENCES "public"."grades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES "public"."subchapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_chat_logs_user_idx" ON "ai_chat_logs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "ai_chat_logs_subchapter_idx" ON "ai_chat_logs" USING btree ("subchapterId");--> statement-breakpoint
CREATE INDEX "ai_chat_logs_message_type_idx" ON "ai_chat_logs" USING btree ("messageType");--> statement-breakpoint
CREATE INDEX "ai_chat_logs_created_at_idx" ON "ai_chat_logs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "ai_chat_logs_user_subchapter_idx" ON "ai_chat_logs" USING btree ("userId","subchapterId");--> statement-breakpoint
CREATE INDEX "ai_chat_logs_user_created_at_idx" ON "ai_chat_logs" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "ai_content_subchapter_idx" ON "ai_generated_content" USING btree ("subchapterId");--> statement-breakpoint
CREATE INDEX "ai_content_initial_idx" ON "ai_generated_content" USING btree ("isInitial");--> statement-breakpoint
CREATE INDEX "ai_content_version_idx" ON "ai_generated_content" USING btree ("version");--> statement-breakpoint
CREATE INDEX "ai_content_subchapter_initial_idx" ON "ai_generated_content" USING btree ("subchapterId","isInitial");--> statement-breakpoint
CREATE INDEX "chapters_title_idx" ON "chapters" USING btree ("title");--> statement-breakpoint
CREATE INDEX "chapters_subject_idx" ON "chapters" USING btree ("subjectId");--> statement-breakpoint
CREATE INDEX "chapters_order_idx" ON "chapters" USING btree ("order");--> statement-breakpoint
CREATE INDEX "chapters_active_idx" ON "chapters" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "chapters_subject_order_idx" ON "chapters" USING btree ("subjectId","order");--> statement-breakpoint
CREATE INDEX "chapters_subject_active_idx" ON "chapters" USING btree ("subjectId","isActive");--> statement-breakpoint
CREATE INDEX "grades_title_idx" ON "grades" USING btree ("title");--> statement-breakpoint
CREATE INDEX "grades_active_idx" ON "grades" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "metahuman_sessions_user_idx" ON "metahuman_sessions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "metahuman_sessions_subchapter_idx" ON "metahuman_sessions" USING btree ("subchapterId");--> statement-breakpoint
CREATE INDEX "metahuman_sessions_status_idx" ON "metahuman_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "metahuman_sessions_created_at_idx" ON "metahuman_sessions" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "metahuman_sessions_user_subchapter_idx" ON "metahuman_sessions" USING btree ("userId","subchapterId");--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_idx" ON "quiz_attempts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "quiz_attempts_quiz_idx" ON "quiz_attempts" USING btree ("quizId");--> statement-breakpoint
CREATE INDEX "quiz_attempts_score_idx" ON "quiz_attempts" USING btree ("score");--> statement-breakpoint
CREATE INDEX "quiz_attempts_passed_idx" ON "quiz_attempts" USING btree ("passed");--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_quiz_idx" ON "quiz_attempts" USING btree ("userId","quizId");--> statement-breakpoint
CREATE INDEX "quiz_attempts_completed_at_idx" ON "quiz_attempts" USING btree ("completedAt");--> statement-breakpoint
CREATE INDEX "quiz_questions_quiz_idx" ON "quiz_questions" USING btree ("quizId");--> statement-breakpoint
CREATE INDEX "quiz_questions_order_idx" ON "quiz_questions" USING btree ("order");--> statement-breakpoint
CREATE INDEX "quiz_questions_quiz_order_idx" ON "quiz_questions" USING btree ("quizId","order");--> statement-breakpoint
CREATE INDEX "quizzes_title_idx" ON "quizzes" USING btree ("title");--> statement-breakpoint
CREATE INDEX "quizzes_subchapter_idx" ON "quizzes" USING btree ("subchapterId");--> statement-breakpoint
CREATE INDEX "quizzes_active_idx" ON "quizzes" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "quizzes_subchapter_active_idx" ON "quizzes" USING btree ("subchapterId","isActive");--> statement-breakpoint
CREATE INDEX "materials_subchapter_idx" ON "subchapter_materials" USING btree ("subchapterId");--> statement-breakpoint
CREATE INDEX "materials_type_idx" ON "subchapter_materials" USING btree ("fileType");--> statement-breakpoint
CREATE INDEX "materials_active_idx" ON "subchapter_materials" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "materials_uploaded_by_idx" ON "subchapter_materials" USING btree ("uploadedBy");--> statement-breakpoint
CREATE INDEX "subchapters_title_idx" ON "subchapters" USING btree ("title");--> statement-breakpoint
CREATE INDEX "subchapters_chapter_idx" ON "subchapters" USING btree ("chapterId");--> statement-breakpoint
CREATE INDEX "subchapters_order_idx" ON "subchapters" USING btree ("order");--> statement-breakpoint
CREATE INDEX "subchapters_active_idx" ON "subchapters" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "subchapters_chapter_order_idx" ON "subchapters" USING btree ("chapterId","order");--> statement-breakpoint
CREATE INDEX "subchapters_chapter_active_idx" ON "subchapters" USING btree ("chapterId","isActive");--> statement-breakpoint
CREATE INDEX "subjects_title_idx" ON "subjects" USING btree ("title");--> statement-breakpoint
CREATE INDEX "subjects_grade_idx" ON "subjects" USING btree ("gradeId");--> statement-breakpoint
CREATE INDEX "subjects_active_idx" ON "subjects" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "subjects_grade_active_idx" ON "subjects" USING btree ("gradeId","isActive");--> statement-breakpoint
CREATE INDEX "user_progress_user_idx" ON "user_progress" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_progress_subchapter_idx" ON "user_progress" USING btree ("subchapterId");--> statement-breakpoint
CREATE INDEX "user_progress_status_idx" ON "user_progress" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_progress_user_status_idx" ON "user_progress" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_active_idx" ON "users" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("createdAt");