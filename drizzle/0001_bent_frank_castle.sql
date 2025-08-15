ALTER TABLE "ai_generated_content" ADD CONSTRAINT "ai_content_subchapter_initial_unique" UNIQUE("subchapterId","isInitial");--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_title_subject_unique" UNIQUE("title","subjectId");--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_title_unique" UNIQUE("title");--> statement-breakpoint
ALTER TABLE "subchapters" ADD CONSTRAINT "subchapters_title_chapter_unique" UNIQUE("title","chapterId");--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_title_grade_unique" UNIQUE("title","gradeId");