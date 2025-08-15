// test/setup.ts
import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '..', '.env.test') });

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Increase timeout for integration tests
  jest.setTimeout(30000);
});

afterAll(async () => {
  // Clean up after all tests
  await new Promise((resolve) => setTimeout(resolve, 500));
});

// Mock external services
jest.mock('@/common/services/redis.service', () => ({
  RedisService: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    increment: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(false),
    expire: jest.fn().mockResolvedValue(true),
    flushall: jest.fn().mockResolvedValue('OK'),
  })),
}));

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mocked AI response',
              },
            },
          ],
        }),
      },
    },
  })),
}));

// Suppress console logs during tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  if (process.env.JEST_VERBOSE !== 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterEach(() => {
  if (process.env.JEST_VERBOSE !== 'true') {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
});

// Global test utilities
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'SISWA',
    isActive: true,
    loginAttempts: 0,
    lockedUntil: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    passwordChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockGrade: (overrides = {}) => ({
    id: 'test-grade-id',
    title: 'Test Grade',
    description: 'Test Grade Description',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockSubject: (overrides = {}) => ({
    id: 'test-subject-id',
    title: 'Test Subject',
    description: 'Test Subject Description',
    gradeId: 'test-grade-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockChapter: (overrides = {}) => ({
    id: 'test-chapter-id',
    title: 'Test Chapter',
    description: 'Test Chapter Description',
    subjectId: 'test-subject-id',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockSubchapter: (overrides = {}) => ({
    id: 'test-subchapter-id',
    title: 'Test Subchapter',
    description: 'Test Subchapter Description',
    content: 'Test content',
    chapterId: 'test-chapter-id',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Type declarations for global utilities
declare global {
  var testUtils: {
    createMockUser: (overrides?: any) => any;
    createMockGrade: (overrides?: any) => any;
    createMockSubject: (overrides?: any) => any;
    createMockChapter: (overrides?: any) => any;
    createMockSubchapter: (overrides?: any) => any;
    sleep: (ms: number) => Promise<void>;
  };
}
