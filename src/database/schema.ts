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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('UserRole', ['SISWA', 'ADMIN']);
export const messageTypeEnum = pgEnum('MessageType', ['USER', 'AI']);
export const progressStatusEnum = pgEnum('ProgressStatus', [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
]);

// Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('SISWA'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const grades = pgTable('grades', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const subjects = pgTable('subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  gradeId: uuid('gradeId')
    .notNull()
    .references(() => grades.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const chapters = pgTable('chapters', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  subjectId: uuid('subjectId')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const subchapters = pgTable('subchapters', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  chapterId: uuid('chapterId')
    .notNull()
    .references(() => chapters.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const aiGeneratedContent = pgTable('ai_generated_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  subchapterId: uuid('subchapterId')
    .notNull()
    .references(() => subchapters.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  audioUrl: text('audioUrl'),
  isInitial: boolean('isInitial').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const aiChatLogs = pgTable('ai_chat_logs', {
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
});

export const userProgress = pgTable('user_progress', {
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
});

export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  subchapterId: uuid('subchapterId')
    .notNull()
    .references(() => subchapters.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quizId')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  options: jsonb('options').notNull(),
  correctAnswer: text('correctAnswer').notNull(),
  explanation: text('explanation'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  quizId: uuid('quizId')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  answers: jsonb('answers').notNull(),
  score: doublePrecision('score').notNull(),
  completedAt: timestamp('completedAt').notNull().defaultNow(),
});

export const metahumanSessions = pgTable('metahuman_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  subchapterId: uuid('subchapterId')
    .notNull()
    .references(() => subchapters.id, { onDelete: 'cascade' }),
  sessionData: jsonb('sessionData').notNull(),
  duration: integer('duration'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

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
