// src/quiz/quiz.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { UserRole } from '@/types/enums';
import { testUtils } from '@/test/test-utils';

describe('QuizController', () => {
  let controller: QuizController;
  let quizService: jest.Mocked<QuizService>;

  const mockUser = testUtils.createMockUser();
  const mockQuiz = testUtils.createMockQuiz();
  const mockQuestion = testUtils.createMockQuestion();

  beforeEach(async () => {
    const mockQuizService = {
      createQuiz: jest.fn(),
      addQuestion: jest.fn(),
      getQuizById: jest.fn(),
      getQuizzesBySubchapter: jest.fn(),
      submitQuiz: jest.fn(),
      getQuizAttempts: jest.fn(),
      updateQuiz: jest.fn(),
      deleteQuiz: jest.fn(),
      getQuizStatistics: jest.fn(),
      updateQuestion: jest.fn(),
      deleteQuestion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: mockQuizService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<QuizController>(QuizController);
    quizService = module.get(QuizService);
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

    it('should create quiz successfully', async () => {
      // Arrange
      quizService.createQuiz.mockResolvedValue(mockQuiz);

      // Act
      const result = await controller.createQuiz(createQuizDto);

      // Assert
      expect(quizService.createQuiz).toHaveBeenCalledWith(createQuizDto);
      expect(result).toEqual(mockQuiz);
    });

    it('should handle service errors', async () => {
      // Arrange
      quizService.createQuiz.mockRejectedValue(
        new BadRequestException('Invalid subchapter'),
      );

      // Act & Assert
      await expect(controller.createQuiz(createQuizDto)).rejects.toThrow(
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

    it('should add question successfully', async () => {
      // Arrange
      quizService.addQuestion.mockResolvedValue(mockQuestion);

      // Act
      const result = await controller.addQuestion(addQuestionDto);

      // Assert
      expect(quizService.addQuestion).toHaveBeenCalledWith(addQuestionDto);
      expect(result).toEqual(mockQuestion);
    });

    it('should handle quiz not found error', async () => {
      // Arrange
      quizService.addQuestion.mockRejectedValue(
        new NotFoundException('Quiz not found'),
      );

      // Act & Assert
      await expect(controller.addQuestion(addQuestionDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getQuiz', () => {
    it('should return quiz by id', async () => {
      // Arrange
      const quizWithQuestions = {
        ...mockQuiz,
        questions: [mockQuestion],
      };
      quizService.getQuizById.mockResolvedValue(quizWithQuestions);

      // Act
      const result = await controller.getQuiz('quiz-id');

      // Assert
      expect(quizService.getQuizById).toHaveBeenCalledWith('quiz-id');
      expect(result).toEqual(quizWithQuestions);
    });

    it('should handle quiz not found', async () => {
      // Arrange
      quizService.getQuizById.mockRejectedValue(
        new NotFoundException('Quiz not found'),
      );

      // Act & Assert
      await expect(controller.getQuiz('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getQuizzesBySubchapter', () => {
    it('should return quizzes for subchapter', async () => {
      // Arrange
      const mockQuizzes = [mockQuiz];
      quizService.getQuizzesBySubchapter.mockResolvedValue(mockQuizzes);

      // Act
      const result = await controller.getQuizzesBySubchapter('subchapter-id');

      // Assert
      expect(quizService.getQuizzesBySubchapter).toHaveBeenCalledWith(
        'subchapter-id',
      );
      expect(result).toEqual(mockQuizzes);
    });

    it('should return empty array when no quizzes found', async () => {
      // Arrange
      quizService.getQuizzesBySubchapter.mockResolvedValue([]);

      // Act
      const result = await controller.getQuizzesBySubchapter('subchapter-id');

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
      timeSpent: 1800,
    };

    it('should submit quiz successfully', async () => {
      // Arrange
      const mockResult = {
        attemptId: 'attempt-id',
        score: 85,
        isPassed: true,
        correctAnswers: 2,
        totalQuestions: 2,
        timeSpent: 1800,
        submittedAt: new Date(),
      };
      quizService.submitQuiz.mockResolvedValue(mockResult);

      // Act
      const result = await controller.submitQuiz(submitQuizDto, mockUser);

      // Assert
      expect(quizService.submitQuiz).toHaveBeenCalledWith(
        mockUser.id,
        submitQuizDto,
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle quiz not found error', async () => {
      // Arrange
      quizService.submitQuiz.mockRejectedValue(
        new NotFoundException('Quiz not found'),
      );

      // Act & Assert
      await expect(
        controller.submitQuiz(submitQuizDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle validation errors', async () => {
      // Arrange
      quizService.submitQuiz.mockRejectedValue(
        new BadRequestException('All questions must be answered'),
      );

      // Act & Assert
      await expect(
        controller.submitQuiz(submitQuizDto, mockUser),
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
      quizService.getQuizAttempts.mockResolvedValue(mockAttempts);

      // Act
      const result = await controller.getQuizAttempts(mockUser, 'quiz-id');

      // Assert
      expect(quizService.getQuizAttempts).toHaveBeenCalledWith(
        mockUser.id,
        'quiz-id',
      );
      expect(result).toEqual(mockAttempts);
    });

    it('should return all attempts when no quizId provided', async () => {
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
      quizService.getQuizAttempts.mockResolvedValue(mockAttempts);

      // Act
      const result = await controller.getQuizAttempts(mockUser);

      // Assert
      expect(quizService.getQuizAttempts).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
      );
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
      quizService.updateQuiz.mockResolvedValue(updatedQuiz);

      // Act
      const result = await controller.updateQuiz('quiz-id', updateQuizDto);

      // Assert
      expect(quizService.updateQuiz).toHaveBeenCalledWith(
        'quiz-id',
        updateQuizDto,
      );
      expect(result).toEqual(updatedQuiz);
    });

    it('should handle quiz not found error', async () => {
      // Arrange
      quizService.updateQuiz.mockRejectedValue(
        new NotFoundException('Quiz not found'),
      );

      // Act & Assert
      await expect(
        controller.updateQuiz('non-existent-id', updateQuizDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteQuiz', () => {
    it('should delete quiz successfully', async () => {
      // Arrange
      quizService.deleteQuiz.mockResolvedValue(undefined);

      // Act
      const result = await controller.deleteQuiz('quiz-id');

      // Assert
      expect(quizService.deleteQuiz).toHaveBeenCalledWith('quiz-id');
      expect(result).toEqual({
        message: 'Quiz deleted successfully',
        quizId: 'quiz-id',
      });
    });

    it('should handle quiz not found error', async () => {
      // Arrange
      quizService.deleteQuiz.mockRejectedValue(
        new NotFoundException('Quiz not found'),
      );

      // Act & Assert
      await expect(controller.deleteQuiz('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getQuizStatistics', () => {
    it('should return quiz statistics', async () => {
      // Arrange
      const mockStats = {
        totalAttempts: 10,
        averageScore: 78.5,
        passRate: 70,
        averageTimeSpent: 1650,
      };
      quizService.getQuizStatistics.mockResolvedValue(mockStats);

      // Act
      const result = await controller.getQuizStatistics('quiz-id');

      // Assert
      expect(quizService.getQuizStatistics).toHaveBeenCalledWith('quiz-id');
      expect(result).toEqual(mockStats);
    });

    it('should handle quiz not found error', async () => {
      // Arrange
      quizService.getQuizStatistics.mockRejectedValue(
        new NotFoundException('Quiz not found'),
      );

      // Act & Assert
      await expect(
        controller.getQuizStatistics('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateQuestion', () => {
    const updateQuestionDto = {
      question: 'Updated question?',
      options: ['A. New 1', 'B. New 2', 'C. New 3', 'D. New 4'],
      correctAnswer: 'C',
      explanation: 'Updated explanation',
    };

    it('should update question successfully', async () => {
      // Arrange
      const updatedQuestion = { ...mockQuestion, ...updateQuestionDto };
      quizService.updateQuestion.mockResolvedValue(updatedQuestion);

      // Act
      const result = await controller.updateQuestion(
        'question-id',
        updateQuestionDto,
      );

      // Assert
      expect(quizService.updateQuestion).toHaveBeenCalledWith(
        'question-id',
        updateQuestionDto,
      );
      expect(result).toEqual(updatedQuestion);
    });

    it('should handle question not found error', async () => {
      // Arrange
      quizService.updateQuestion.mockRejectedValue(
        new NotFoundException('Question not found'),
      );

      // Act & Assert
      await expect(
        controller.updateQuestion('non-existent-id', updateQuestionDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteQuestion', () => {
    it('should delete question successfully', async () => {
      // Arrange
      quizService.deleteQuestion.mockResolvedValue(undefined);

      // Act
      const result = await controller.deleteQuestion('question-id');

      // Assert
      expect(quizService.deleteQuestion).toHaveBeenCalledWith('question-id');
      expect(result).toEqual({
        message: 'Question deleted successfully',
        questionId: 'question-id',
      });
    });

    it('should handle question not found error', async () => {
      // Arrange
      quizService.deleteQuestion.mockRejectedValue(
        new NotFoundException('Question not found'),
      );

      // Act & Assert
      await expect(
        controller.deleteQuestion('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
