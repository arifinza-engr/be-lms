// src/quiz/quiz.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { QuizService } from './quiz.service';
import { DatabaseService } from '@/database/database.service';
import { TransactionService } from '@/common/services/transaction.service';
import { testUtils } from '@/test/test-utils';

describe('QuizService', () => {
  let service: QuizService;
  let databaseService: jest.Mocked<DatabaseService>;
  let transactionService: jest.Mocked<TransactionService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockQuiz = testUtils.createMockQuiz();
  const mockQuestion = testUtils.createMockQuestion();
  const mockUser = testUtils.createMockUser();

  beforeEach(async () => {
    const mockDatabaseService = {
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        eq: jest.fn(),
        and: jest.fn(),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
      },
      schema: {
        quizzes: {},
        quizQuestions: {},
        quizAttempts: {},
        quizAnswers: {},
        subchapters: {},
      },
      eq: jest.fn(),
      and: jest.fn(),
      desc: jest.fn(),
    };

    const mockTransactionService = {
      executeInTransaction: jest.fn((callback) =>
        callback(mockDatabaseService.db),
      ),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    databaseService = module.get(DatabaseService);
    transactionService = module.get(TransactionService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuiz', () => {
    const createQuizDto = {
      title: 'Test Quiz',
      description: 'Test Quiz Description',
      subchapterId: 'subchapter-id',
      timeLimit: 30,
      passingScore: 70,
    };

    it('should create a quiz successfully', async () => {
      // Arrange
      const mockSubchapter = testUtils.createMockSubchapter({
        id: 'subchapter-id',
      });
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValue([mockSubchapter]);
      databaseService.db
        .insert()
        .values()
        .returning.mockResolvedValue([mockQuiz]);

      // Act
      const result = await service.createQuiz(createQuizDto);

      // Assert
      expect(result).toEqual(mockQuiz);
      expect(databaseService.db.select).toHaveBeenCalled();
      expect(databaseService.db.insert).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'quiz.created',
        expect.objectContaining({
          quizId: mockQuiz.id,
          title: mockQuiz.title,
          subchapterId: mockQuiz.subchapterId,
        }),
      );
    });

    it('should throw NotFoundException when subchapter does not exist', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(service.createQuiz(createQuizDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate time limit', async () => {
      // Arrange
      const invalidDto = { ...createQuizDto, timeLimit: -1 };

      // Act & Assert
      await expect(service.createQuiz(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate passing score', async () => {
      // Arrange
      const invalidDto = { ...createQuizDto, passingScore: 150 };

      // Act & Assert
      await expect(service.createQuiz(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addQuestion', () => {
    const addQuestionDto = {
      quizId: 'quiz-id',
      question: 'What is 2 + 2?',
      options: ['A. 3', 'B. 4', 'C. 5', 'D. 6'],
      correctAnswer: 'B',
      explanation: '2 + 2 equals 4',
      order: 1,
    };

    it('should add question to quiz successfully', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([mockQuiz]);
      databaseService.db
        .insert()
        .values()
        .returning.mockResolvedValue([mockQuestion]);

      // Act
      const result = await service.addQuestion(addQuestionDto);

      // Assert
      expect(result).toEqual(mockQuestion);
      expect(databaseService.db.select).toHaveBeenCalled();
      expect(databaseService.db.insert).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'quiz.question_added',
        expect.objectContaining({
          quizId: addQuestionDto.quizId,
          questionId: mockQuestion.id,
        }),
      );
    });

    it('should throw NotFoundException when quiz does not exist', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(service.addQuestion(addQuestionDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate options array', async () => {
      // Arrange
      const invalidDto = { ...addQuestionDto, options: ['A. Only one option'] };

      // Act & Assert
      await expect(service.addQuestion(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate correct answer format', async () => {
      // Arrange
      const invalidDto = { ...addQuestionDto, correctAnswer: 'Z' };

      // Act & Assert
      await expect(service.addQuestion(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getQuizById', () => {
    it('should return quiz with questions', async () => {
      // Arrange
      const mockQuizWithQuestions = {
        ...mockQuiz,
        questions: [mockQuestion],
      };
      databaseService.db
        .select()
        .from()
        .leftJoin()
        .where.mockResolvedValue([mockQuizWithQuestions]);

      // Act
      const result = await service.getQuizById('quiz-id');

      // Assert
      expect(result).toEqual(mockQuizWithQuestions);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should throw NotFoundException when quiz not found', async () => {
      // Arrange
      databaseService.db.select().from().leftJoin().where.mockResolvedValue([]);

      // Act & Assert
      await expect(service.getQuizById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getQuizzesBySubchapter', () => {
    it('should return quizzes for subchapter', async () => {
      // Arrange
      const mockQuizzes = [mockQuiz];
      databaseService.db.select().from().where.mockResolvedValue(mockQuizzes);

      // Act
      const result = await service.getQuizzesBySubchapter('subchapter-id');

      // Assert
      expect(result).toEqual(mockQuizzes);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should return empty array when no quizzes found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act
      const result = await service.getQuizzesBySubchapter('subchapter-id');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('submitQuiz', () => {
    const submitQuizDto = {
      quizId: 'quiz-id',
      answers: [
        { questionId: 'question-1', selectedAnswer: 'A' },
        { questionId: 'question-2', selectedAnswer: 'B' },
      ],
      timeSpent: 1800, // 30 minutes
    };

    it('should submit quiz and calculate score', async () => {
      // Arrange
      const mockQuizWithQuestions = {
        ...mockQuiz,
        questions: [
          { ...mockQuestion, id: 'question-1', correctAnswer: 'A' },
          { ...mockQuestion, id: 'question-2', correctAnswer: 'C' },
        ],
      };
      const mockAttempt = {
        id: 'attempt-id',
        userId: mockUser.id,
        quizId: 'quiz-id',
        score: 50,
        isPassed: false,
        timeSpent: 1800,
        submittedAt: new Date(),
      };

      databaseService.db
        .select()
        .from()
        .leftJoin()
        .where.mockResolvedValue([mockQuizWithQuestions]);
      databaseService.db
        .insert()
        .values()
        .returning.mockResolvedValue([mockAttempt]);

      // Act
      const result = await service.submitQuiz(mockUser.id, submitQuizDto);

      // Assert
      expect(result).toHaveProperty('score', 50);
      expect(result).toHaveProperty('isPassed', false);
      expect(result).toHaveProperty('correctAnswers', 1);
      expect(result).toHaveProperty('totalQuestions', 2);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'quiz.submitted',
        expect.objectContaining({
          userId: mockUser.id,
          quizId: 'quiz-id',
          score: 50,
          isPassed: false,
        }),
      );
    });

    it('should mark as passed when score meets passing threshold', async () => {
      // Arrange
      const mockQuizWithQuestions = {
        ...mockQuiz,
        passingScore: 70,
        questions: [
          { ...mockQuestion, id: 'question-1', correctAnswer: 'A' },
          { ...mockQuestion, id: 'question-2', correctAnswer: 'B' },
        ],
      };
      const mockAttempt = {
        id: 'attempt-id',
        userId: mockUser.id,
        quizId: 'quiz-id',
        score: 100,
        isPassed: true,
        timeSpent: 1800,
        submittedAt: new Date(),
      };

      databaseService.db
        .select()
        .from()
        .leftJoin()
        .where.mockResolvedValue([mockQuizWithQuestions]);
      databaseService.db
        .insert()
        .values()
        .returning.mockResolvedValue([mockAttempt]);

      const submitDto = {
        ...submitQuizDto,
        answers: [
          { questionId: 'question-1', selectedAnswer: 'A' },
          { questionId: 'question-2', selectedAnswer: 'B' },
        ],
      };

      // Act
      const result = await service.submitQuiz(mockUser.id, submitDto);

      // Assert
      expect(result).toHaveProperty('score', 100);
      expect(result).toHaveProperty('isPassed', true);
    });

    it('should throw NotFoundException when quiz not found', async () => {
      // Arrange
      databaseService.db.select().from().leftJoin().where.mockResolvedValue([]);

      // Act & Assert
      await expect(
        service.submitQuiz(mockUser.id, submitQuizDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate all questions are answered', async () => {
      // Arrange
      const mockQuizWithQuestions = {
        ...mockQuiz,
        questions: [
          { ...mockQuestion, id: 'question-1', correctAnswer: 'A' },
          { ...mockQuestion, id: 'question-2', correctAnswer: 'B' },
          { ...mockQuestion, id: 'question-3', correctAnswer: 'C' },
        ],
      };
      databaseService.db
        .select()
        .from()
        .leftJoin()
        .where.mockResolvedValue([mockQuizWithQuestions]);

      // Act & Assert
      await expect(
        service.submitQuiz(mockUser.id, submitQuizDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getQuizAttempts', () => {
    it('should return user quiz attempts', async () => {
      // Arrange
      const mockAttempts = [
        {
          id: 'attempt-1',
          userId: mockUser.id,
          quizId: 'quiz-id',
          score: 85,
          isPassed: true,
          submittedAt: new Date(),
        },
      ];
      databaseService.db.select().from().where.mockResolvedValue(mockAttempts);

      // Act
      const result = await service.getQuizAttempts(mockUser.id, 'quiz-id');

      // Assert
      expect(result).toEqual(mockAttempts);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should return all attempts when no quizId specified', async () => {
      // Arrange
      const mockAttempts = [
        {
          id: 'attempt-1',
          userId: mockUser.id,
          quizId: 'quiz-1',
          score: 85,
        },
        {
          id: 'attempt-2',
          userId: mockUser.id,
          quizId: 'quiz-2',
          score: 92,
        },
      ];
      databaseService.db.select().from().where.mockResolvedValue(mockAttempts);

      // Act
      const result = await service.getQuizAttempts(mockUser.id);

      // Assert
      expect(result).toEqual(mockAttempts);
    });
  });

  describe('updateQuiz', () => {
    const updateQuizDto = {
      title: 'Updated Quiz Title',
      description: 'Updated description',
      timeLimit: 45,
      passingScore: 80,
    };

    it('should update quiz successfully', async () => {
      // Arrange
      const updatedQuiz = { ...mockQuiz, ...updateQuizDto };
      databaseService.db.select().from().where.mockResolvedValue([mockQuiz]);
      databaseService.db.update().set().where.mockResolvedValue([updatedQuiz]);

      // Act
      const result = await service.updateQuiz('quiz-id', updateQuizDto);

      // Assert
      expect(result).toEqual(updatedQuiz);
      expect(databaseService.db.update).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'quiz.updated',
        expect.objectContaining({
          quizId: 'quiz-id',
          changes: updateQuizDto,
        }),
      );
    });

    it('should throw NotFoundException when quiz not found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(
        service.updateQuiz('non-existent-id', updateQuizDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteQuiz', () => {
    it('should delete quiz successfully', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([mockQuiz]);
      databaseService.db.delete().where.mockResolvedValue(undefined);

      // Act
      await service.deleteQuiz('quiz-id');

      // Assert
      expect(databaseService.db.delete).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'quiz.deleted',
        expect.objectContaining({
          quizId: 'quiz-id',
          title: mockQuiz.title,
        }),
      );
    });

    it('should throw NotFoundException when quiz not found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(service.deleteQuiz('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getQuizStatistics', () => {
    it('should return quiz statistics', async () => {
      // Arrange
      const mockStats = [
        {
          totalAttempts: 10,
          averageScore: 78.5,
          passRate: 70,
          averageTimeSpent: 1650,
        },
      ];
      databaseService.db.select().from().where.mockResolvedValue(mockStats);

      // Act
      const result = await service.getQuizStatistics('quiz-id');

      // Assert
      expect(result).toEqual(mockStats[0]);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should return default stats when no attempts found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act
      const result = await service.getQuizStatistics('quiz-id');

      // Assert
      expect(result).toEqual({
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        averageTimeSpent: 0,
      });
    });
  });
});
