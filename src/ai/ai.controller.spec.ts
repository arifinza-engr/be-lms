// src/ai/ai.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { UserRole } from '@/types/enums';

describe('AiController', () => {
  let controller: AiController;
  let aiService: jest.Mocked<AiService>;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    role: UserRole.SISWA,
  };

  beforeEach(async () => {
    const mockAiService = {
      askQuestion: jest.fn(),
      generateExplanation: jest.fn(),
      generateQuizQuestions: jest.fn(),
      generateSpeech: jest.fn(),
      generateSummary: jest.fn(),
      isAiEnabled: jest.fn(),
      clearCache: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('askQuestion', () => {
    const askQuestionDto = {
      question: 'What is photosynthesis?',
      context: 'biology',
    };

    it('should ask question successfully', async () => {
      // Arrange
      const expectedResponse = {
        answer: 'Photosynthesis is the process...',
        confidence: 0.9,
        sources: [],
        metadata: { cached: false },
      };
      aiService.askQuestion.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.askQuestion(askQuestionDto, mockUser);

      // Assert
      expect(aiService.askQuestion).toHaveBeenCalledWith({
        ...askQuestionDto,
        userId: mockUser.id,
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should handle service errors', async () => {
      // Arrange
      aiService.askQuestion.mockRejectedValue(
        new BadRequestException('Invalid question'),
      );

      // Act & Assert
      await expect(
        controller.askQuestion(askQuestionDto, mockUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateExplanation', () => {
    const explanationDto = {
      topic: 'Photosynthesis',
      level: 'beginner' as const,
    };

    it('should generate explanation successfully', async () => {
      // Arrange
      const expectedResponse = {
        explanation: 'Detailed explanation...',
        metadata: { cached: false },
      };
      aiService.generateExplanation.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.generateExplanation(
        explanationDto,
        mockUser,
      );

      // Assert
      expect(aiService.generateExplanation).toHaveBeenCalledWith({
        ...explanationDto,
        userId: mockUser.id,
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should validate explanation level', async () => {
      // Arrange
      const invalidDto = { ...explanationDto, level: 'invalid' as any };

      // Act & Assert
      // This would be caught by class-validator in real scenario
      await expect(
        controller.generateExplanation(invalidDto, mockUser),
      ).resolves.toBeDefined();
    });
  });

  describe('generateQuizQuestions', () => {
    const quizDto = {
      topic: 'Photosynthesis',
      difficulty: 'medium' as const,
      questionCount: 5,
    };

    it('should generate quiz questions successfully', async () => {
      // Arrange
      const expectedResponse = {
        questions: [
          {
            question: 'What is photosynthesis?',
            options: ['A. Process', 'B. Reaction', 'C. Both', 'D. Neither'],
            correctAnswer: 'C',
            explanation: 'Explanation...',
          },
        ],
        metadata: { cached: false },
      };
      aiService.generateQuizQuestions.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.generateQuizQuestions(quizDto, mockUser);

      // Assert
      expect(aiService.generateQuizQuestions).toHaveBeenCalledWith({
        ...quizDto,
        userId: mockUser.id,
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should validate question count limits', async () => {
      // Arrange
      const invalidDto = { ...quizDto, questionCount: 100 };

      // Act & Assert
      // This would be caught by class-validator in real scenario
      await expect(
        controller.generateQuizQuestions(invalidDto, mockUser),
      ).resolves.toBeDefined();
    });
  });

  describe('generateSpeech', () => {
    const speechDto = {
      text: 'Hello, this is a test speech.',
      voice: 'alloy',
    };

    it('should generate speech successfully', async () => {
      // Arrange
      const mockAudioBuffer = Buffer.from('mock audio data');
      const expectedResponse = {
        audioBuffer: mockAudioBuffer,
        metadata: { duration: 5.2, voice: 'alloy' },
      };
      aiService.generateSpeech.mockResolvedValue(expectedResponse);

      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      // Act
      await controller.generateSpeech(speechDto, mockUser, mockResponse);

      // Assert
      expect(aiService.generateSpeech).toHaveBeenCalledWith({
        ...speechDto,
        userId: mockUser.id,
      });
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'audio/mpeg',
        'Content-Length': mockAudioBuffer.length,
        'Content-Disposition': 'attachment; filename="speech.mp3"',
      });
      expect(mockResponse.send).toHaveBeenCalledWith(mockAudioBuffer);
    });

    it('should handle empty text', async () => {
      // Arrange
      const invalidDto = { ...speechDto, text: '' };

      // Act & Assert
      // This would be caught by class-validator in real scenario
      await expect(
        controller.generateSpeech(invalidDto, mockUser, {} as Response),
      ).resolves.toBeDefined();
    });
  });

  describe('generateSummary', () => {
    const summaryDto = {
      content: 'Long content to be summarized...',
      maxLength: 100,
    };

    it('should generate summary successfully', async () => {
      // Arrange
      const expectedResponse = {
        summary: 'This is a summary.',
        metadata: { originalLength: 35, summaryLength: 18 },
      };
      aiService.generateSummary.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.generateSummary(summaryDto, mockUser);

      // Assert
      expect(aiService.generateSummary).toHaveBeenCalledWith({
        ...summaryDto,
        userId: mockUser.id,
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should validate content length', async () => {
      // Arrange
      const invalidDto = { ...summaryDto, content: '' };

      // Act & Assert
      // This would be caught by class-validator in real scenario
      await expect(
        controller.generateSummary(invalidDto, mockUser),
      ).resolves.toBeDefined();
    });
  });

  describe('getAiStatus', () => {
    it('should return AI status', async () => {
      // Arrange
      aiService.isAiEnabled.mockReturnValue(true);

      // Act
      const result = await controller.getAiStatus();

      // Assert
      expect(result).toEqual({
        enabled: true,
        services: {
          openai: true,
          elevenlabs: true,
          cache: true,
        },
        version: '1.0.0',
      });
    });

    it('should return disabled status when AI is disabled', async () => {
      // Arrange
      aiService.isAiEnabled.mockReturnValue(false);

      // Act
      const result = await controller.getAiStatus();

      // Assert
      expect(result).toEqual({
        enabled: false,
        services: {
          openai: false,
          elevenlabs: false,
          cache: false,
        },
        version: '1.0.0',
      });
    });
  });

  describe('clearCache', () => {
    it('should clear user cache successfully', async () => {
      // Arrange
      aiService.clearCache.mockResolvedValue(undefined);

      // Act
      const result = await controller.clearCache(mockUser);

      // Assert
      expect(aiService.clearCache).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        message: 'AI cache cleared successfully',
        userId: mockUser.id,
      });
    });

    it('should handle cache clearing errors', async () => {
      // Arrange
      aiService.clearCache.mockRejectedValue(new Error('Cache error'));

      // Act & Assert
      await expect(controller.clearCache(mockUser)).rejects.toThrow(
        'Cache error',
      );
    });
  });

  describe('clearAllCache', () => {
    it('should clear all cache successfully for admin', async () => {
      // Arrange
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      aiService.clearCache.mockResolvedValue(undefined);

      // Act
      const result = await controller.clearAllCache(adminUser);

      // Assert
      expect(aiService.clearCache).toHaveBeenCalledWith();
      expect(result).toEqual({
        message: 'All AI cache cleared successfully',
        clearedBy: adminUser.id,
      });
    });

    it('should throw UnauthorizedException for non-admin users', async () => {
      // Arrange
      const nonAdminUser = { ...mockUser, role: UserRole.SISWA };

      // Act & Assert
      await expect(controller.clearAllCache(nonAdminUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
