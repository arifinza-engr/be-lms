// src/unreal/unreal.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { UnrealService } from './unreal.service';
import { DatabaseService } from '@/database/database.service';
import { TransactionService } from '@/common/services/transaction.service';
import { testUtils } from '@/test/test-utils';

describe('UnrealService', () => {
  let service: UnrealService;
  let databaseService: jest.Mocked<DatabaseService>;
  let transactionService: jest.Mocked<TransactionService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockUser = testUtils.createMockUser();
  const mockSession = {
    id: 'session-id',
    userId: mockUser.id,
    subchapterId: 'subchapter-id',
    startTime: new Date(),
    endTime: null,
    duration: 0,
    isActive: true,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
      },
      schema: {
        unrealSessions: {},
        users: {},
        subchapters: {},
      },
      eq: jest.fn(),
      and: jest.fn(),
      desc: jest.fn(),
      isNull: jest.fn(),
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
        UnrealService,
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

    service = module.get<UnrealService>(UnrealService);
    databaseService = module.get(DatabaseService);
    transactionService = module.get(TransactionService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startSession', () => {
    const startSessionDto = {
      subchapterId: 'subchapter-id',
      metadata: {
        unrealVersion: '5.1',
        platform: 'Windows',
        resolution: '1920x1080',
      },
    };

    it('should start a new session successfully', async () => {
      // Arrange
      const mockSubchapter = testUtils.createMockSubchapter({
        id: 'subchapter-id',
      });
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValueOnce([mockSubchapter]);
      databaseService.db.select().from().where.mockResolvedValueOnce([]); // No active session
      databaseService.db
        .insert()
        .values()
        .returning.mockResolvedValue([mockSession]);

      // Act
      const result = await service.startSession(mockUser.id, startSessionDto);

      // Assert
      expect(result).toEqual(mockSession);
      expect(databaseService.db.select).toHaveBeenCalledTimes(2);
      expect(databaseService.db.insert).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'unreal.session_started',
        expect.objectContaining({
          sessionId: mockSession.id,
          userId: mockUser.id,
          subchapterId: startSessionDto.subchapterId,
        }),
      );
    });

    it('should end existing active session before starting new one', async () => {
      // Arrange
      const activeSession = { ...mockSession, id: 'active-session-id' };
      const mockSubchapter = testUtils.createMockSubchapter({
        id: 'subchapter-id',
      });

      databaseService.db
        .select()
        .from()
        .where.mockResolvedValueOnce([mockSubchapter]);
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValueOnce([activeSession]);
      databaseService.db.update().set().where.mockResolvedValueOnce([]);
      databaseService.db
        .insert()
        .values()
        .returning.mockResolvedValue([mockSession]);

      // Act
      const result = await service.startSession(mockUser.id, startSessionDto);

      // Assert
      expect(result).toEqual(mockSession);
      expect(databaseService.db.update).toHaveBeenCalled(); // End active session
      expect(databaseService.db.insert).toHaveBeenCalled(); // Start new session
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'unreal.session_ended',
        expect.objectContaining({
          sessionId: activeSession.id,
          userId: mockUser.id,
        }),
      );
    });

    it('should throw NotFoundException when subchapter does not exist', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValueOnce([]);

      // Act & Assert
      await expect(
        service.startSession(mockUser.id, startSessionDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('endSession', () => {
    const endSessionDto = {
      sessionId: 'session-id',
      metadata: {
        completionRate: 85,
        interactions: 15,
        achievements: ['first_interaction', 'completed_tutorial'],
      },
    };

    it('should end session successfully', async () => {
      // Arrange
      const endedSession = {
        ...mockSession,
        endTime: new Date(),
        duration: 1800, // 30 minutes
        isActive: false,
        metadata: endSessionDto.metadata,
      };

      databaseService.db.select().from().where.mockResolvedValue([mockSession]);
      databaseService.db.update().set().where.mockResolvedValue([endedSession]);

      // Act
      const result = await service.endSession(mockUser.id, endSessionDto);

      // Assert
      expect(result).toEqual(endedSession);
      expect(databaseService.db.update).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'unreal.session_ended',
        expect.objectContaining({
          sessionId: endSessionDto.sessionId,
          userId: mockUser.id,
          duration: expect.any(Number),
        }),
      );
    });

    it('should throw NotFoundException when session not found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(
        service.endSession(mockUser.id, endSessionDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when session is already ended', async () => {
      // Arrange
      const endedSession = {
        ...mockSession,
        isActive: false,
        endTime: new Date(),
      };
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValue([endedSession]);

      // Act & Assert
      await expect(
        service.endSession(mockUser.id, endSessionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when session belongs to different user', async () => {
      // Arrange
      const otherUserSession = { ...mockSession, userId: 'other-user-id' };
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValue([otherUserSession]);

      // Act & Assert
      await expect(
        service.endSession(mockUser.id, endSessionDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateSessionDuration', () => {
    const updateDto = {
      sessionId: 'session-id',
      duration: 1800, // 30 minutes
    };

    it('should update session duration successfully', async () => {
      // Arrange
      const updatedSession = { ...mockSession, duration: 1800 };
      databaseService.db.select().from().where.mockResolvedValue([mockSession]);
      databaseService.db
        .update()
        .set()
        .where.mockResolvedValue([updatedSession]);

      // Act
      const result = await service.updateSessionDuration(
        mockUser.id,
        updateDto,
      );

      // Assert
      expect(result).toEqual(updatedSession);
      expect(databaseService.db.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when session not found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(
        service.updateSessionDuration(mockUser.id, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate duration is positive', async () => {
      // Arrange
      const invalidDto = { ...updateDto, duration: -100 };

      // Act & Assert
      await expect(
        service.updateSessionDuration(mockUser.id, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserSessions', () => {
    it('should return user sessions', async () => {
      // Arrange
      const mockSessions = [
        mockSession,
        { ...mockSession, id: 'session-2', subchapterId: 'subchapter-2' },
      ];
      databaseService.db.select().from().where.mockResolvedValue(mockSessions);

      // Act
      const result = await service.getUserSessions(mockUser.id);

      // Assert
      expect(result).toEqual(mockSessions);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should filter by subchapterId when provided', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([mockSession]);

      // Act
      const result = await service.getUserSessions(
        mockUser.id,
        'subchapter-id',
      );

      // Assert
      expect(result).toEqual([mockSession]);
    });

    it('should return empty array when no sessions found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act
      const result = await service.getUserSessions(mockUser.id);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getSessionById', () => {
    it('should return session by id', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([mockSession]);

      // Act
      const result = await service.getSessionById('session-id');

      // Assert
      expect(result).toEqual(mockSession);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should throw NotFoundException when session not found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(service.getSessionById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getActiveSession', () => {
    it('should return active session for user', async () => {
      // Arrange
      const activeSession = { ...mockSession, isActive: true };
      databaseService.db
        .select()
        .from()
        .where.mockResolvedValue([activeSession]);

      // Act
      const result = await service.getActiveSession(mockUser.id);

      // Assert
      expect(result).toEqual(activeSession);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should return null when no active session found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act
      const result = await service.getActiveSession(mockUser.id);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getSessionStatistics', () => {
    it('should return session statistics for user', async () => {
      // Arrange
      const mockStats = {
        totalSessions: 10,
        totalDuration: 18000, // 5 hours
        averageDuration: 1800, // 30 minutes
        completedSessions: 8,
        completionRate: 80,
        lastSessionDate: new Date(),
      };
      databaseService.db.select().from().where.mockResolvedValue([mockStats]);

      // Act
      const result = await service.getSessionStatistics(mockUser.id);

      // Assert
      expect(result).toEqual(mockStats);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should return default stats when no sessions found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act
      const result = await service.getSessionStatistics(mockUser.id);

      // Assert
      expect(result).toEqual({
        totalSessions: 0,
        totalDuration: 0,
        averageDuration: 0,
        completedSessions: 0,
        completionRate: 0,
        lastSessionDate: null,
      });
    });

    it('should filter by date range when provided', async () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockStats = {
        totalSessions: 5,
        totalDuration: 9000,
        averageDuration: 1800,
        completedSessions: 4,
        completionRate: 80,
        lastSessionDate: new Date('2024-01-30'),
      };
      databaseService.db.select().from().where.mockResolvedValue([mockStats]);

      // Act
      const result = await service.getSessionStatistics(
        mockUser.id,
        startDate,
        endDate,
      );

      // Assert
      expect(result).toEqual(mockStats);
    });
  });

  describe('deleteSession', () => {
    it('should delete session successfully', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([mockSession]);
      databaseService.db.delete().where.mockResolvedValue(undefined);

      // Act
      await service.deleteSession('session-id');

      // Assert
      expect(databaseService.db.delete).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'unreal.session_deleted',
        expect.objectContaining({
          sessionId: 'session-id',
          userId: mockSession.userId,
        }),
      );
    });

    it('should throw NotFoundException when session not found', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act & Assert
      await expect(service.deleteSession('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cleanupInactiveSessions', () => {
    it('should cleanup inactive sessions older than threshold', async () => {
      // Arrange
      const inactiveSessions = [
        { ...mockSession, id: 'inactive-1', isActive: true },
        { ...mockSession, id: 'inactive-2', isActive: true },
      ];
      const thresholdMinutes = 60;

      databaseService.db
        .select()
        .from()
        .where.mockResolvedValue(inactiveSessions);
      databaseService.db.update().set().where.mockResolvedValue([]);

      // Act
      const result = await service.cleanupInactiveSessions(thresholdMinutes);

      // Assert
      expect(result).toEqual({
        cleanedSessions: 2,
        thresholdMinutes: 60,
        cleanupTime: expect.any(Date),
      });
      expect(databaseService.db.update).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'unreal.sessions_cleaned',
        expect.objectContaining({
          cleanedCount: 2,
          thresholdMinutes: 60,
        }),
      );
    });

    it('should return zero when no sessions to cleanup', async () => {
      // Arrange
      databaseService.db.select().from().where.mockResolvedValue([]);

      // Act
      const result = await service.cleanupInactiveSessions(60);

      // Assert
      expect(result.cleanedSessions).toBe(0);
      expect(databaseService.db.update).not.toHaveBeenCalled();
    });
  });

  describe('getGlobalStatistics', () => {
    it('should return global session statistics', async () => {
      // Arrange
      const mockGlobalStats = {
        totalUsers: 100,
        totalSessions: 1000,
        totalDuration: 1800000, // 500 hours
        averageSessionDuration: 1800, // 30 minutes
        activeSessions: 5,
        popularSubchapters: [
          { subchapterId: 'sub-1', sessionCount: 50 },
          { subchapterId: 'sub-2', sessionCount: 45 },
        ],
        dailyStats: [
          { date: '2024-01-01', sessions: 25, duration: 45000 },
          { date: '2024-01-02', sessions: 30, duration: 54000 },
        ],
      };
      databaseService.db.select().from().mockResolvedValue([mockGlobalStats]);

      // Act
      const result = await service.getGlobalStatistics();

      // Assert
      expect(result).toEqual(mockGlobalStats);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should filter by date range when provided', async () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockStats = {
        totalUsers: 50,
        totalSessions: 500,
        totalDuration: 900000,
        averageSessionDuration: 1800,
        activeSessions: 3,
      };
      databaseService.db.select().from().mockResolvedValue([mockStats]);

      // Act
      const result = await service.getGlobalStatistics(startDate, endDate);

      // Assert
      expect(result).toEqual(mockStats);
    });
  });
});
