// src/progress/progress.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ProgressService } from './progress.service';
import { DatabaseService } from '@/database/database.service';
import { TransactionService } from '@/common/services/transaction.service';
import { testUtils } from '@/test/test-utils';

describe('ProgressService', () => {
  let service: ProgressService;
  let databaseService: jest.Mocked<DatabaseService>;
  let transactionService: jest.Mocked<TransactionService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockUser = testUtils.createMockUser();
  const mockProgress = testUtils.createMockProgress();
  const mockSubchapter = testUtils.createMockSubchapter();

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
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        count: jest.fn(),
        avg: jest.fn(),
        sum: jest.fn(),
      },
      schema: {
        progress: {},
        subchapters: {},
        chapters: {},
        subjects: {},
        grades: {},
        users: {},
      },
      eq: jest.fn(),
      and: jest.fn(),
      desc: jest.fn(),
      asc: jest.fn(),
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
        ProgressService,
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

    service = module.get<ProgressService>(ProgressService);
    databaseService = module.get(DatabaseService);
    transactionService = module.get(TransactionService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startSubchapter', () => {
    const startDto = {
      subchapterId: 'subchapter-id',
    };

    it('should start subchapter progress successfully', async () => {
      // Arrange
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValueOnce([mockSubchapter]);
      databaseService.db.select().from().where.mockResolvedValueOnce([]); // No existing progress
      databaseService.db
        .insert()
        .values()
        .returning.mockResolvedValue([mockProgress]);

      // Act
      const result = await service.startSubchapter(mockUser.id, startDto);

      // Assert
      expect(result).toEqual(mockProgress);
      expect(databaseService.db.select).toHaveBeenCalledTimes(2);
      expect(databaseService.db.insert).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'progress.started',
        expect.objectContaining({
          userId: mockUser.id,
          subchapterId: startDto.subchapterId,
        }),
      );
    });

    it('should return existing progress if already started', async () => {
      // Arrange
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValueOnce([mockSubchapter]);
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValueOnce([mockProgress]);

      // Act
      const result = await service.startSubchapter(mockUser.id, startDto);

      // Assert
      expect(result).toEqual(mockProgress);
      expect(databaseService.db.insert).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when subchapter does not exist', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValueOnce([]);

      // Act & Assert
      await expect(
        service.startSubchapter(mockUser.id, startDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('completeSubchapter', () => {
    const completeDto = {
      subchapterId: 'subchapter-id',
      timeSpent: 1800, // 30 minutes
      score: 85,
    };

    it('should complete subchapter successfully', async () => {
      // Arrange
      const completedProgress = {
        ...mockProgress,
        isCompleted: true,
        completedAt: new Date(),
        timeSpent: 1800,
        score: 85,
      };
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValue([mockProgress]);
      databaseService.db
        .update()
        .set()
        .where.mockResolvedValue([completedProgress]);

      // Act
      const result = await service.completeSubchapter(mockUser.id, completeDto);

      // Assert
      expect(result).toEqual(completedProgress);
      expect(databaseService.db.update).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'progress.completed',
        expect.objectContaining({
          userId: mockUser.id,
          subchapterId: completeDto.subchapterId,
          score: completeDto.score,
          timeSpent: completeDto.timeSpent,
        }),
      );
    });

    it('should throw NotFoundException when progress not found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(
        service.completeSubchapter(mockUser.id, completeDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already completed', async () => {
      // Arrange
      const completedProgress = { ...mockProgress, isCompleted: true };
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValue([completedProgress]);

      // Act & Assert
      await expect(
        service.completeSubchapter(mockUser.id, completeDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate score range', async () => {
      // Arrange
      const invalidDto = { ...completeDto, score: 150 };

      // Act & Assert
      await expect(
        service.completeSubchapter(mockUser.id, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserProgress', () => {
    it('should return user progress for all subchapters', async () => {
      // Arrange
      const mockProgressList = [
        mockProgress,
        { ...mockProgress, id: 'progress-2', subchapterId: 'subchapter-2' },
      ];
      databaseService.db
        .select()
        .from()
        .leftJoin()
        .where.mockResolvedValue(mockProgressList);

      // Act
      const result = await service.getUserProgress(mockUser.id);

      // Assert
      expect(result).toEqual(mockProgressList);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should filter by subchapterId when provided', async () => {
      // Arrange
      databaseService.db
        .select()
        .from()
        .leftJoin()
        .where.mockResolvedValue([mockProgress]);

      // Act
      const result = await service.getUserProgress(
        mockUser.id,
        'subchapter-id',
      );

      // Assert
      expect(result).toEqual([mockProgress]);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should return empty array when no progress found', async () => {
      // Arrange
      databaseService.db.select().from().leftJoin().where.mockResolvedValue([]);

      // Act
      const result = await service.getUserProgress(mockUser.id);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getProgressSummary', () => {
    it('should return progress summary', async () => {
      // Arrange
      const mockSummary = {
        totalSubchapters: 10,
        completedSubchapters: 7,
        completionRate: 70,
        averageScore: 82.5,
        totalTimeSpent: 18000,
        lastActivity: new Date(),
      };
      databaseService.db.select().from().where.mockResolvedValue([mockSummary]);

      // Act
      const result = await service.getProgressSummary(mockUser.id);

      // Assert
      expect(result).toEqual(mockSummary);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should return default summary when no progress found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act
      const result = await service.getProgressSummary(mockUser.id);

      // Assert
      expect(result).toEqual({
        totalSubchapters: 0,
        completedSubchapters: 0,
        completionRate: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        lastActivity: null,
      });
    });
  });

  describe('getSubjectProgress', () => {
    it('should return progress by subject', async () => {
      // Arrange
      const mockSubjectProgress = [
        {
          subjectId: 'subject-1',
          subjectTitle: 'Mathematics',
          totalSubchapters: 5,
          completedSubchapters: 3,
          completionRate: 60,
          averageScore: 85,
        },
        {
          subjectId: 'subject-2',
          subjectTitle: 'Physics',
          totalSubchapters: 4,
          completedSubchapters: 4,
          completionRate: 100,
          averageScore: 92,
        },
      ];
      databaseService.db
        .select()
        .from()
        .leftJoin()
        .where.mockResolvedValue(mockSubjectProgress);

      // Act
      const result = await service.getSubjectProgress(mockUser.id);

      // Assert
      expect(result).toEqual(mockSubjectProgress);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should filter by gradeId when provided', async () => {
      // Arrange
      const mockSubjectProgress = [
        {
          subjectId: 'subject-1',
          subjectTitle: 'Mathematics',
          totalSubchapters: 5,
          completedSubchapters: 3,
          completionRate: 60,
        },
      ];
      databaseService.db
        .select()
        .from()
        .leftJoin()
        .where.mockResolvedValue(mockSubjectProgress);

      // Act
      const result = await service.getSubjectProgress(mockUser.id, 'grade-id');

      // Assert
      expect(result).toEqual(mockSubjectProgress);
    });
  });

  describe('getChapterProgress', () => {
    it('should return progress by chapter', async () => {
      // Arrange
      const mockChapterProgress = [
        {
          chapterId: 'chapter-1',
          chapterTitle: 'Algebra',
          totalSubchapters: 3,
          completedSubchapters: 2,
          completionRate: 66.67,
          averageScore: 88,
        },
      ];
      databaseService.db
        .select()
        .from()
        .leftJoin()
        .where.mockResolvedValue(mockChapterProgress);

      // Act
      const result = await service.getChapterProgress(
        mockUser.id,
        'subject-id',
      );

      // Assert
      expect(result).toEqual(mockChapterProgress);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should throw NotFoundException when subject not found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(
        service.getChapterProgress(mockUser.id, 'non-existent-subject'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTimeSpent', () => {
    const updateDto = {
      subchapterId: 'subchapter-id',
      additionalTime: 600, // 10 minutes
    };

    it('should update time spent successfully', async () => {
      // Arrange
      const updatedProgress = {
        ...mockProgress,
        timeSpent: mockProgress.timeSpent + 600,
      };
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValue([mockProgress]);
      databaseService.db
        .update()
        .set()
        .where.mockResolvedValue([updatedProgress]);

      // Act
      const result = await service.updateTimeSpent(mockUser.id, updateDto);

      // Assert
      expect(result).toEqual(updatedProgress);
      expect(databaseService.db.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when progress not found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(
        service.updateTimeSpent(mockUser.id, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate additional time is positive', async () => {
      // Arrange
      const invalidDto = { ...updateDto, additionalTime: -100 };

      // Act & Assert
      await expect(
        service.updateTimeSpent(mockUser.id, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetProgress', () => {
    it('should reset subchapter progress successfully', async () => {
      // Arrange
      const resetProgress = {
        ...mockProgress,
        isCompleted: false,
        completedAt: null,
        timeSpent: 0,
        score: null,
      };
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValue([mockProgress]);
      databaseService.db
        .update()
        .set()
        .where.mockResolvedValue([resetProgress]);

      // Act
      const result = await service.resetProgress(mockUser.id, 'subchapter-id');

      // Assert
      expect(result).toEqual(resetProgress);
      expect(databaseService.db.update).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'progress.reset',
        expect.objectContaining({
          userId: mockUser.id,
          subchapterId: 'subchapter-id',
        }),
      );
    });

    it('should throw NotFoundException when progress not found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(
        service.resetProgress(mockUser.id, 'non-existent-subchapter'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard data', async () => {
      // Arrange
      const mockLeaderboard = [
        {
          userId: 'user-1',
          userName: 'John Doe',
          totalScore: 850,
          completedSubchapters: 10,
          averageScore: 85,
          rank: 1,
        },
        {
          userId: 'user-2',
          userName: 'Jane Smith',
          totalScore: 820,
          completedSubchapters: 9,
          averageScore: 91.1,
          rank: 2,
        },
      ];
      databaseService.db
        .select()
        .from()
        .leftJoin()
        .groupBy()
        .orderBy.mockResolvedValue(mockLeaderboard);

      // Act
      const result = await service.getLeaderboard(10);

      // Assert
      expect(result).toEqual(mockLeaderboard);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should limit results to specified count', async () => {
      // Arrange
      const mockLeaderboard = [
        {
          userId: 'user-1',
          userName: 'John Doe',
          totalScore: 850,
          rank: 1,
        },
      ];
      databaseService.db
        .select()
        .from()
        .leftJoin()
        .groupBy()
        .orderBy.mockResolvedValue(mockLeaderboard);

      // Act
      const result = await service.getLeaderboard(1);

      // Assert
      expect(result).toHaveLength(1);
    });

    it('should filter by gradeId when provided', async () => {
      // Arrange
      const mockLeaderboard = [
        {
          userId: 'user-1',
          userName: 'John Doe',
          totalScore: 850,
          rank: 1,
        },
      ];
      databaseService.db
        .select()
        .from()
        .leftJoin()
        .groupBy()
        .orderBy.mockResolvedValue(mockLeaderboard);

      // Act
      const result = await service.getLeaderboard(10, 'grade-id');

      // Assert
      expect(result).toEqual(mockLeaderboard);
    });
  });

  describe('getUserRank', () => {
    it('should return user rank', async () => {
      // Arrange
      const mockRankData = {
        userId: mockUser.id,
        rank: 5,
        totalScore: 750,
        completedSubchapters: 8,
        averageScore: 93.75,
        totalUsers: 50,
      };
      databaseService.db
        .select()
        .from()
        .leftJoin()
        .where.mockResolvedValue([mockRankData]);

      // Act
      const result = await service.getUserRank(mockUser.id);

      // Assert
      expect(result).toEqual(mockRankData);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should return null when user has no progress', async () => {
      // Arrange
      databaseService.db.select().from().leftJoin().where.mockResolvedValue([]);

      // Act
      const result = await service.getUserRank(mockUser.id);

      // Assert
      expect(result).toBeNull();
    });
  });
});
