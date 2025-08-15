// src/test/test-utils.ts
import { UserRole } from '@/types/enums';

export const testUtils = {
  // User utilities
  createMockUser: (overrides: any = {}) => ({
    id: 'user-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.SISWA,
    isActive: true,
    isEmailVerified: false,
    loginAttempts: 0,
    lockedUntil: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    resetToken: null,
    resetTokenExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  // Content utilities
  createMockGrade: (overrides: any = {}) => ({
    id: 'grade-id',
    title: 'Grade 10',
    description: 'Grade 10 Description',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockSubject: (overrides: any = {}) => ({
    id: 'subject-id',
    title: 'Mathematics',
    description: 'Mathematics Subject',
    gradeId: 'grade-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockChapter: (overrides: any = {}) => ({
    id: 'chapter-id',
    title: 'Algebra',
    description: 'Algebra Chapter',
    subjectId: 'subject-id',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockSubchapter: (overrides: any = {}) => ({
    id: 'subchapter-id',
    title: 'Linear Equations',
    description: 'Linear Equations Subchapter',
    content: 'Content about linear equations',
    chapterId: 'chapter-id',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  // Quiz utilities
  createMockQuiz: (overrides: any = {}) => ({
    id: 'quiz-id',
    title: 'Test Quiz',
    description: 'Test Quiz Description',
    subchapterId: 'subchapter-id',
    questions: [],
    timeLimit: 30,
    passingScore: 70,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockQuestion: (overrides: any = {}) => ({
    id: 'question-id',
    quizId: 'quiz-id',
    question: 'Test question?',
    options: ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4'],
    correctAnswer: 'A',
    explanation: 'Test explanation',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  // Progress utilities
  createMockProgress: (overrides: any = {}) => ({
    id: 'progress-id',
    userId: 'user-id',
    subchapterId: 'subchapter-id',
    isCompleted: false,
    completedAt: null,
    timeSpent: 0,
    score: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  // AI utilities
  createMockAIResponse: (overrides: any = {}) => ({
    content: 'Mocked AI response',
    usage: {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    },
    ...overrides,
  }),

  // Database transaction mock
  createMockTransaction: () => ({
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }),

  // Event utilities
  createMockEventEmitter: () => ({
    emit: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  }),

  // Date utilities
  createDateInFuture: (minutes: number = 60) =>
    new Date(Date.now() + minutes * 60 * 1000),

  createDateInPast: (minutes: number = 60) =>
    new Date(Date.now() - minutes * 60 * 1000),
};
