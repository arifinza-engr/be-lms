// src/database/schema.ts
import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  boolean,
  jsonb,
  doublePrecision,
  integer,
  uuid,
  index,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('UserRole', ['SISWA', 'ADMIN', 'GURU']);
export const messageTypeEnum = pgEnum('MessageType', ['USER', 'AI']);
export const progressStatusEnum = pgEnum('ProgressStatus', [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
]);

// Tables
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull().default('SISWA'),
    isActive: boolean('isActive').notNull().default(true),
    refreshToken: text('refreshToken'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    resetToken: varchar('resetToken', { length: 255 }),
    resetTokenExpiresAt: timestamp('resetTokenExpiresAt'),
    lastLoginAt: timestamp('lastLoginAt'),
    passwordChangedAt: timestamp('passwordChangedAt'),
    loginAttempts: integer('loginAttempts').notNull().default(0),
    lockedUntil: timestamp('lockedUntil'),
    emailVerified: boolean('emailVerified').notNull().default(false),
    emailVerificationToken: varchar('emailVerificationToken', { length: 255 }),
    emailVerificationExpiresAt: timestamp('emailVerificationExpiresAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
    activeIdx: index('users_active_idx').on(table.isActive),
    createdAtIdx: index('users_created_at_idx').on(table.createdAt),
  }),
);

export const grades = pgTable(
  'grades',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull().unique(),
    description: text('description'),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    titleIdx: index('grades_title_idx').on(table.title),
    activeIdx: index('grades_active_idx').on(table.isActive),
  }),
);

export const subjects = pgTable(
  'subjects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    gradeId: uuid('gradeId')
      .notNull()
      .references(() => grades.id, { onDelete: 'cascade' }),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    titleIdx: index('subjects_title_idx').on(table.title),
    gradeIdx: index('subjects_grade_idx').on(table.gradeId),
    activeIdx: index('subjects_active_idx').on(table.isActive),
    gradeActiveIdx: index('subjects_grade_active_idx').on(
      table.gradeId,
      table.isActive,
    ),
    titleGradeUnique: unique('subjects_title_grade_unique').on(
      table.title,
      table.gradeId,
    ),
  }),
);

export const chapters = pgTable(
  'chapters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    order: integer('order').notNull().default(0),
    subjectId: uuid('subjectId')
      .notNull()
      .references(() => subjects.id, { onDelete: 'cascade' }),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    titleIdx: index('chapters_title_idx').on(table.title),
    subjectIdx: index('chapters_subject_idx').on(table.subjectId),
    orderIdx: index('chapters_order_idx').on(table.order),
    activeIdx: index('chapters_active_idx').on(table.isActive),
    subjectOrderIdx: index('chapters_subject_order_idx').on(
      table.subjectId,
      table.order,
    ),
    subjectActiveIdx: index('chapters_subject_active_idx').on(
      table.subjectId,
      table.isActive,
    ),
    titleSubjectUnique: unique('chapters_title_subject_unique').on(
      table.title,
      table.subjectId,
    ),
  }),
);

export const subchapters = pgTable(
  'subchapters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    order: integer('order').notNull().default(0),
    chapterId: uuid('chapterId')
      .notNull()
      .references(() => chapters.id, { onDelete: 'cascade' }),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    titleIdx: index('subchapters_title_idx').on(table.title),
    chapterIdx: index('subchapters_chapter_idx').on(table.chapterId),
    orderIdx: index('subchapters_order_idx').on(table.order),
    activeIdx: index('subchapters_active_idx').on(table.isActive),
    chapterOrderIdx: index('subchapters_chapter_order_idx').on(
      table.chapterId,
      table.order,
    ),
    chapterActiveIdx: index('subchapters_chapter_active_idx').on(
      table.chapterId,
      table.isActive,
    ),
    titleChapterUnique: unique('subchapters_title_chapter_unique').on(
      table.title,
      table.chapterId,
    ),
  }),
);

export const aiGeneratedContent = pgTable(
  'ai_generated_content',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subchapterId: uuid('subchapterId')
      .notNull()
      .references(() => subchapters.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    audioUrl: text('audioUrl'),
    isInitial: boolean('isInitial').notNull().default(true),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    subchapterIdx: index('ai_content_subchapter_idx').on(table.subchapterId),
    initialIdx: index('ai_content_initial_idx').on(table.isInitial),
    versionIdx: index('ai_content_version_idx').on(table.version),
    subchapterInitialIdx: index('ai_content_subchapter_initial_idx').on(
      table.subchapterId,
      table.isInitial,
    ),
    subchapterInitialUnique: unique('ai_content_subchapter_initial_unique').on(
      table.subchapterId,
      table.isInitial,
    ),
  }),
);

export const aiChatLogs = pgTable(
  'ai_chat_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subchapterId: uuid('subchapterId')
      .notNull()
      .references(() => subchapters.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    messageType: messageTypeEnum('messageType').notNull(),
    audioUrl: text('audioUrl'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('ai_chat_logs_user_idx').on(table.userId),
    subchapterIdx: index('ai_chat_logs_subchapter_idx').on(table.subchapterId),
    messageTypeIdx: index('ai_chat_logs_message_type_idx').on(
      table.messageType,
    ),
    createdAtIdx: index('ai_chat_logs_created_at_idx').on(table.createdAt),
    userSubchapterIdx: index('ai_chat_logs_user_subchapter_idx').on(
      table.userId,
      table.subchapterId,
    ),
    userCreatedAtIdx: index('ai_chat_logs_user_created_at_idx').on(
      table.userId,
      table.createdAt,
    ),
  }),
);

export const userProgress = pgTable(
  'user_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subchapterId: uuid('subchapterId')
      .notNull()
      .references(() => subchapters.id, { onDelete: 'cascade' }),
    status: progressStatusEnum('status').notNull().default('NOT_STARTED'),
    completedAt: timestamp('completedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('user_progress_user_idx').on(table.userId),
    subchapterIdx: index('user_progress_subchapter_idx').on(table.subchapterId),
    statusIdx: index('user_progress_status_idx').on(table.status),
    userSubchapterIdx: unique('user_progress_user_subchapter_unique').on(
      table.userId,
      table.subchapterId,
    ),
    userStatusIdx: index('user_progress_user_status_idx').on(
      table.userId,
      table.status,
    ),
  }),
);

export const quizzes = pgTable(
  'quizzes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subchapterId: uuid('subchapterId')
      .notNull()
      .references(() => subchapters.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    isActive: boolean('isActive').notNull().default(true),
    timeLimit: integer('timeLimit'), // in minutes
    passingScore: doublePrecision('passingScore').notNull().default(70),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    titleIdx: index('quizzes_title_idx').on(table.title),
    subchapterIdx: index('quizzes_subchapter_idx').on(table.subchapterId),
    activeIdx: index('quizzes_active_idx').on(table.isActive),
    subchapterActiveIdx: index('quizzes_subchapter_active_idx').on(
      table.subchapterId,
      table.isActive,
    ),
    subchapterTitleUnique: unique('quizzes_subchapter_title_unique').on(
      table.subchapterId,
      table.title,
    ),
  }),
);

export const quizQuestions = pgTable(
  'quiz_questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quizId: uuid('quizId')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    question: text('question').notNull(),
    options: jsonb('options').notNull(),
    correctAnswer: varchar('correctAnswer', { length: 10 }).notNull(),
    explanation: text('explanation'),
    order: integer('order').notNull().default(0),
    points: doublePrecision('points').notNull().default(1),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    quizIdx: index('quiz_questions_quiz_idx').on(table.quizId),
    orderIdx: index('quiz_questions_order_idx').on(table.order),
    quizOrderIdx: index('quiz_questions_quiz_order_idx').on(
      table.quizId,
      table.order,
    ),
  }),
);

export const quizAttempts = pgTable(
  'quiz_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    quizId: uuid('quizId')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    answers: jsonb('answers').notNull(),
    score: doublePrecision('score').notNull(),
    maxScore: doublePrecision('maxScore').notNull(),
    percentage: doublePrecision('percentage').notNull(),
    passed: boolean('passed').notNull().default(false),
    timeSpent: integer('timeSpent'), // in seconds
    startedAt: timestamp('startedAt').notNull().defaultNow(),
    completedAt: timestamp('completedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('quiz_attempts_user_idx').on(table.userId),
    quizIdx: index('quiz_attempts_quiz_idx').on(table.quizId),
    scoreIdx: index('quiz_attempts_score_idx').on(table.score),
    passedIdx: index('quiz_attempts_passed_idx').on(table.passed),
    userQuizIdx: index('quiz_attempts_user_quiz_idx').on(
      table.userId,
      table.quizId,
    ),
    completedAtIdx: index('quiz_attempts_completed_at_idx').on(
      table.completedAt,
    ),
  }),
);

export const metahumanSessions = pgTable(
  'metahuman_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subchapterId: uuid('subchapterId')
      .notNull()
      .references(() => subchapters.id, { onDelete: 'cascade' }),
    sessionData: jsonb('sessionData').notNull(),
    duration: integer('duration'), // in seconds
    status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('metahuman_sessions_user_idx').on(table.userId),
    subchapterIdx: index('metahuman_sessions_subchapter_idx').on(
      table.subchapterId,
    ),
    statusIdx: index('metahuman_sessions_status_idx').on(table.status),
    createdAtIdx: index('metahuman_sessions_created_at_idx').on(
      table.createdAt,
    ),
    userSubchapterIdx: index('metahuman_sessions_user_subchapter_idx').on(
      table.userId,
      table.subchapterId,
    ),
  }),
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  quizAttempts: many(quizAttempts),
  chatLogs: many(aiChatLogs),
  metahumanSessions: many(metahumanSessions),
}));

export const gradesRelations = relations(grades, ({ many }) => ({
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  grade: one(grades, {
    fields: [subjects.gradeId],
    references: [grades.id],
  }),
  chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [chapters.subjectId],
    references: [subjects.id],
  }),
  subchapters: many(subchapters),
}));

export const subchaptersRelations = relations(subchapters, ({ one, many }) => ({
  chapter: one(chapters, {
    fields: [subchapters.chapterId],
    references: [chapters.id],
  }),
  aiGeneratedContent: many(aiGeneratedContent),
  progress: many(userProgress),
  quizzes: many(quizzes),
  chatLogs: many(aiChatLogs),
  metahumanSessions: many(metahumanSessions),
  materials: many(subchapterMaterials),
}));

export const aiGeneratedContentRelations = relations(
  aiGeneratedContent,
  ({ one }) => ({
    subchapter: one(subchapters, {
      fields: [aiGeneratedContent.subchapterId],
      references: [subchapters.id],
    }),
  }),
);

export const aiChatLogsRelations = relations(aiChatLogs, ({ one }) => ({
  user: one(users, {
    fields: [aiChatLogs.userId],
    references: [users.id],
  }),
  subchapter: one(subchapters, {
    fields: [aiChatLogs.subchapterId],
    references: [subchapters.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  subchapter: one(subchapters, {
    fields: [userProgress.subchapterId],
    references: [subchapters.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  subchapter: one(subchapters, {
    fields: [quizzes.subchapterId],
    references: [subchapters.id],
  }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
}));

export const metahumanSessionsRelations = relations(
  metahumanSessions,
  ({ one }) => ({
    user: one(users, {
      fields: [metahumanSessions.userId],
      references: [users.id],
    }),
    subchapter: one(subchapters, {
      fields: [metahumanSessions.subchapterId],
      references: [subchapters.id],
    }),
  }),
);

export const subchapterMaterials = pgTable(
  'subchapter_materials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subchapterId: uuid('subchapterId')
      .notNull()
      .references(() => subchapters.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    fileName: varchar('fileName', { length: 255 }).notNull(),
    fileUrl: text('fileUrl').notNull(),
    fileType: varchar('fileType', { length: 50 }).notNull(), // 'video', 'pdf', 'image', 'document'
    fileSize: integer('fileSize'),
    mimeType: varchar('mimeType', { length: 100 }),
    thumbnailUrl: text('thumbnailUrl'),
    duration: integer('duration'), // for videos in seconds
    uploadedBy: uuid('uploadedBy')
      .notNull()
      .references(() => users.id),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    subchapterIdx: index('materials_subchapter_idx').on(table.subchapterId),
    typeIdx: index('materials_type_idx').on(table.fileType),
    activeIdx: index('materials_active_idx').on(table.isActive),
    uploadedByIdx: index('materials_uploaded_by_idx').on(table.uploadedBy),
  }),
);

export const subchapterMaterialsRelations = relations(
  subchapterMaterials,
  ({ one }) => ({
    subchapter: one(subchapters, {
      fields: [subchapterMaterials.subchapterId],
      references: [subchapters.id],
    }),
    uploadedBy: one(users, {
      fields: [subchapterMaterials.uploadedBy],
      references: [users.id],
    }),
  }),
);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Grade = typeof grades.$inferSelect;
export type NewGrade = typeof grades.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
export type Subchapter = typeof subchapters.$inferSelect;
export type NewSubchapter = typeof subchapters.$inferInsert;
export type AiGeneratedContent = typeof aiGeneratedContent.$inferSelect;
export type NewAiGeneratedContent = typeof aiGeneratedContent.$inferInsert;
export type AiChatLog = typeof aiChatLogs.$inferSelect;
export type NewAiChatLog = typeof aiChatLogs.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type NewQuizQuestion = typeof quizQuestions.$inferInsert;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
export type MetahumanSession = typeof metahumanSessions.$inferSelect;
export type NewMetahumanSession = typeof metahumanSessions.$inferInsert;
export type SubchapterMaterial = typeof subchapterMaterials.$inferSelect;
export type NewSubchapterMaterial = typeof subchapterMaterials.$inferInsert;
