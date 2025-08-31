// src/ai/ai.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { AiService } from './ai.service';
import { OpenAIService } from './services/openai.service';
import { ElevenLabsService } from './services/elevenlabs.service';
import { AiCacheService } from './services/ai-cache.service';
import { DatabaseService } from '@/database/database.service';
import { testUtils } from '@/test/test-utils';

describe('AiService', () => {
  let service: AiService;
  let openAIService: jest.Mocked<OpenAIService>;
  let elevenLabsService: jest.Mocked<ElevenLabsService>;
  let aiCacheService: jest.Mocked<AiCacheService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockOpenAIService = {
      generateResponse: jest.fn(),
      generateExplanation: jest.fn(),
      generateQuizQuestions: jest.fn(),
      generateSummary: jest.fn(),
    };

    const mockElevenLabsService = {
      generateSpeech: jest.fn(),
      getVoices: jest.fn(),
    };

    const mockAiCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      invalidate: jest.fn(),
      generateCacheKey: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          AI_ENABLED: 'true',
          AI_CACHE_TTL: '3600',
          AI_MAX_TOKENS: '2000',
          AI_TEMPERATURE: '0.7',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: OpenAIService,
          useValue: mockOpenAIService,
        },
        {
          provide: ElevenLabsService,
          useValue: mockElevenLabsService,
        },
        {
          provide: AiCacheService,
          useValue: mockAiCacheService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DatabaseService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    openAIService = module.get(OpenAIService);
    elevenLabsService = module.get(ElevenLabsService);
    aiCacheService = module.get(AiCacheService);
    eventEmitter = module.get(EventEmitter2);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('askQuestion', () => {
    const askQuestionDto = {
      question: 'What is photosynthesis?',
      context: 'biology',
      userId: 'user-id',
    };

    it('should return cached response if available', async () => {
      // Arrange
      const cachedResponse = {
        answer: 'Cached answer about photosynthesis',
        confidence: 0.95,
        sources: [],
      };
      aiCacheService.generateCacheKey.mockReturnValue('cache-key');
      aiCacheService.get.mockResolvedValue(cachedResponse);

      // Act
      const result = await service.askQuestion(askQuestionDto);

      // Assert
      expect(aiCacheService.generateCacheKey).toHaveBeenCalledWith(
        'question',
        askQuestionDto.question,
        askQuestionDto.context,
      );
      expect(aiCacheService.get).toHaveBeenCalledWith('cache-key');
      expect(result).toEqual(cachedResponse);
      expect(openAIService.generateResponse).not.toHaveBeenCalled();
    });

    it('should generate new response if not cached', async () => {
      // Arrange
      const aiResponse = testUtils.createMockAIResponse({
        content: 'Photosynthesis is the process...',
      });
      const expectedResponse = {
        answer: 'Photosynthesis is the process...',
        confidence: 0.9,
        sources: [],
        metadata: {
          model: 'gpt-4',
          tokens: aiResponse.usage.totalTokens,
          cached: false,
        },
      };

      aiCacheService.generateCacheKey.mockReturnValue('cache-key');
      aiCacheService.get.mockResolvedValue(null);
      openAIService.generateResponse.mockResolvedValue(aiResponse);

      // Act
      const result = await service.askQuestion(askQuestionDto);

      // Assert
      expect(openAIService.generateResponse).toHaveBeenCalledWith(
        askQuestionDto.question,
        expect.objectContaining({
          context: askQuestionDto.context,
          maxTokens: 2000,
          temperature: 0.7,
        }),
      );
      expect(aiCacheService.set).toHaveBeenCalledWith(
        'cache-key',
        expectedResponse,
        3600,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should emit ai.question_asked event', async () => {
      // Arrange
      aiCacheService.generateCacheKey.mockReturnValue('cache-key');
      aiCacheService.get.mockResolvedValue(null);
      openAIService.generateResponse.mockResolvedValue(
        testUtils.createMockAIResponse(),
      );

      // Act
      await service.askQuestion(askQuestionDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'ai.question_asked',
        expect.objectContaining({
          userId: askQuestionDto.userId,
          question: askQuestionDto.question,
          context: askQuestionDto.context,
        }),
      );
    });

    it('should throw BadRequestException for empty question', async () => {
      // Arrange
      const invalidDto = { ...askQuestionDto, question: '' };

      // Act & Assert
      await expect(service.askQuestion(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle OpenAI service errors', async () => {
      // Arrange
      aiCacheService.generateCacheKey.mockReturnValue('cache-key');
      aiCacheService.get.mockResolvedValue(null);
      openAIService.generateResponse.mockRejectedValue(
        new Error('OpenAI API error'),
      );

      // Act & Assert
      await expect(service.askQuestion(askQuestionDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('generateExplanation', () => {
    const explanationDto = {
      topic: 'Photosynthesis',
      level: 'beginner' as const,
      userId: 'user-id',
    };

    it('should generate explanation successfully', async () => {
      // Arrange
      const aiResponse = testUtils.createMockAIResponse({
        content: 'Detailed explanation of photosynthesis...',
      });
      aiCacheService.generateCacheKey.mockReturnValue('cache-key');
      aiCacheService.get.mockResolvedValue(null);
      openAIService.generateExplanation.mockResolvedValue(aiResponse);

      // Act
      const result = await service.generateExplanation(explanationDto);

      // Assert
      expect(openAIService.generateExplanation).toHaveBeenCalledWith(
        explanationDto.topic,
        explanationDto.level,
      );
      expect(result).toHaveProperty('explanation');
      expect(result).toHaveProperty('metadata');
      expect(result.explanation).toBe(
        'Detailed explanation of photosynthesis...',
      );
    });

    it('should return cached explanation if available', async () => {
      // Arrange
      const cachedExplanation = {
        explanation: 'Cached explanation',
        metadata: { cached: true },
      };
      aiCacheService.generateCacheKey.mockReturnValue('cache-key');
      aiCacheService.get.mockResolvedValue(cachedExplanation);

      // Act
      const result = await service.generateExplanation(explanationDto);

      // Assert
      expect(result).toEqual(cachedExplanation);
      expect(openAIService.generateExplanation).not.toHaveBeenCalled();
    });
  });

  describe('generateQuizQuestions', () => {
    const quizDto = {
      topic: 'Photosynthesis',
      difficulty: 'medium' as const,
      questionCount: 5,
      userId: 'user-id',
    };

    it('should generate quiz questions successfully', async () => {
      // Arrange
      const mockQuestions = [
        {
          question: 'What is photosynthesis?',
          options: ['A. Process', 'B. Reaction', 'C. Both', 'D. Neither'],
          correctAnswer: 'C',
          explanation: 'Photosynthesis is both a process and reaction',
        },
      ];
      const aiResponse = testUtils.createMockAIResponse({
        content: JSON.stringify(mockQuestions),
      });
      aiCacheService.generateCacheKey.mockReturnValue('cache-key');
      aiCacheService.get.mockResolvedValue(null);
      openAIService.generateQuizQuestions.mockResolvedValue(aiResponse);

      // Act
      const result = await service.generateQuizQuestions(quizDto);

      // Assert
      expect(openAIService.generateQuizQuestions).toHaveBeenCalledWith(
        quizDto.topic,
        quizDto.difficulty,
        quizDto.questionCount,
      );
      expect(result).toHaveProperty('questions');
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0]).toHaveProperty('question');
      expect(result.questions[0]).toHaveProperty('options');
      expect(result.questions[0]).toHaveProperty('correctAnswer');
    });

    it('should handle invalid JSON response from AI', async () => {
      // Arrange
      const aiResponse = testUtils.createMockAIResponse({
        content: 'Invalid JSON response',
      });
      aiCacheService.generateCacheKey.mockReturnValue('cache-key');
      aiCacheService.get.mockResolvedValue(null);
      openAIService.generateQuizQuestions.mockResolvedValue(aiResponse);

      // Act & Assert
      await expect(service.generateQuizQuestions(quizDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('generateSpeech', () => {
    const speechDto = {
      text: 'Hello, this is a test speech.',
      voice: 'alloy',
      userId: 'user-id',
    };

    it('should generate speech successfully', async () => {
      // Arrange
      const mockAudioBuffer = Buffer.from('mock audio data');
      elevenLabsService.generateSpeech.mockResolvedValue(mockAudioBuffer);

      // Act
      const result = await service.generateSpeech(speechDto);

      // Assert
      expect(elevenLabsService.generateSpeech).toHaveBeenCalledWith(
        speechDto.text,
        speechDto.voice,
      );
      expect(result).toHaveProperty('audioBuffer');
      expect(result).toHaveProperty('metadata');
      expect(result.audioBuffer).toEqual(mockAudioBuffer);
    });

    it('should emit ai.speech_generated event', async () => {
      // Arrange
      const mockAudioBuffer = Buffer.from('mock audio data');
      elevenLabsService.generateSpeech.mockResolvedValue(mockAudioBuffer);

      // Act
      await service.generateSpeech(speechDto);

      // Assert
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'ai.speech_generated',
        expect.objectContaining({
          userId: speechDto.userId,
          textLength: speechDto.text.length,
          voice: speechDto.voice,
        }),
      );
    });

    it('should handle ElevenLabs service errors', async () => {
      // Arrange
      elevenLabsService.generateSpeech.mockRejectedValue(
        new Error('ElevenLabs API error'),
      );

      // Act & Assert
      await expect(service.generateSpeech(speechDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('generateSummary', () => {
    const summaryDto = {
      content: 'Long content to be summarized...',
      maxLength: 100,
      userId: 'user-id',
    };

    it('should generate summary successfully', async () => {
      // Arrange
      const aiResponse = testUtils.createMockAIResponse({
        content: 'This is a summary of the content.',
      });
      aiCacheService.generateCacheKey.mockReturnValue('cache-key');
      aiCacheService.get.mockResolvedValue(null);
      openAIService.generateSummary.mockResolvedValue(aiResponse);

      // Act
      const result = await service.generateSummary(summaryDto);

      // Assert
      expect(openAIService.generateSummary).toHaveBeenCalledWith(
        summaryDto.content,
        summaryDto.maxLength,
      );
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('metadata');
      expect(result.summary).toBe('This is a summary of the content.');
    });

    it('should return cached summary if available', async () => {
      // Arrange
      const cachedSummary = {
        summary: 'Cached summary',
        metadata: { cached: true },
      };
      aiCacheService.generateCacheKey.mockReturnValue('cache-key');
      aiCacheService.get.mockResolvedValue(cachedSummary);

      // Act
      const result = await service.generateSummary(summaryDto);

      // Assert
      expect(result).toEqual(cachedSummary);
      expect(openAIService.generateSummary).not.toHaveBeenCalled();
    });
  });

  describe('isAiEnabled', () => {
    it('should return true when AI is enabled', () => {
      // Act
      const result = service.isAiEnabled();

      // Assert
      expect(result).toBe(true);
      expect(configService.get).toHaveBeenCalledWith('AI_ENABLED');
    });

    it('should return false when AI is disabled', () => {
      // Arrange
      configService.get.mockReturnValue('false');

      // Act
      const result = service.isAiEnabled();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear AI cache successfully', async () => {
      // Arrange
      aiCacheService.invalidate.mockResolvedValue(undefined);

      // Act
      await service.clearCache('user-id');

      // Assert
      expect(aiCacheService.invalidate).toHaveBeenCalledWith('user-id');
    });

    it('should clear all cache when no userId provided', async () => {
      // Arrange
      aiCacheService.invalidate.mockResolvedValue(undefined);

      // Act
      await service.clearCache();

      // Assert
      expect(aiCacheService.invalidate).toHaveBeenCalledWith(undefined);
    });
  });
});
