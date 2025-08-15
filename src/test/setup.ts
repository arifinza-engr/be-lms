// src/test/setup.ts
import { Test } from '@nestjs/testing';
import { DatabaseService } from '../config/database.config';

beforeAll(async () => {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/test_db';
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  const moduleRef = await Test.createTestingModule({
    providers: [DatabaseService],
  }).compile();

  const database = moduleRef.get<DatabaseService>(DatabaseService);
  await database.close(); // ✅ method resmi tutup pool
  await moduleRef.close();
});

// Mock external services
jest.mock('../ai/services/openai.service', () => ({
  OpenaiService: jest.fn().mockImplementation(() => ({
    generateContent: jest.fn().mockResolvedValue('Mocked AI response'),
    generateQuiz: jest.fn().mockResolvedValue({
      questions: [
        {
          question: 'Test question?',
          options: ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4'],
          correctAnswer: 'A',
          explanation: 'Test explanation',
        },
      ],
    }),
  })),
}));

jest.mock('../ai/services/elevenlabs.service', () => ({
  ElevenlabsService: jest.fn().mockImplementation(() => ({
    generateAudio: jest.fn().mockResolvedValue('https://example.com/audio.mp3'),
  })),
}));
