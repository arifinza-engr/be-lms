// src/common/services/transaction.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { TransactionService } from './transaction.service';
import { DatabaseService } from '@/database/database.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let databaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const mockTransaction = {
      rollback: jest.fn(),
      commit: jest.fn(),
    };

    const mockDatabaseService = {
      db: {
        transaction: jest.fn().mockImplementation((callback) => {
          return callback(mockTransaction);
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    databaseService = module.get(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeInTransaction', () => {
    it('should execute callback within transaction successfully', async () => {
      // Arrange
      const mockCallback = jest.fn().mockResolvedValue('success result');
      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      };
      databaseService.db.transaction.mockImplementation((callback) =>
        callback(mockTransaction),
      );

      // Act
      const result = await service.executeInTransaction(mockCallback);

      // Assert
      expect(result).toBe('success result');
      expect(databaseService.db.transaction).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(mockTransaction);
    });

    it('should handle callback errors and rollback transaction', async () => {
      // Arrange
      const error = new Error('Callback error');
      const mockCallback = jest.fn().mockRejectedValue(error);
      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      };
      databaseService.db.transaction.mockImplementation(async (callback) => {
        try {
          return await callback(mockTransaction);
        } catch (err) {
          await mockTransaction.rollback();
          throw err;
        }
      });

      // Act & Assert
      await expect(service.executeInTransaction(mockCallback)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockCallback).toHaveBeenCalledWith(mockTransaction);
    });

    it('should handle transaction creation errors', async () => {
      // Arrange
      const mockCallback = jest.fn();
      databaseService.db.transaction.mockRejectedValue(
        new Error('Transaction creation failed'),
      );

      // Act & Assert
      await expect(service.executeInTransaction(mockCallback)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should pass transaction context to callback', async () => {
      // Arrange
      const mockCallback = jest.fn().mockImplementation((tx) => {
        expect(tx).toHaveProperty('rollback');
        expect(tx).toHaveProperty('commit');
        return 'success';
      });
      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      };
      databaseService.db.transaction.mockImplementation((callback) =>
        callback(mockTransaction),
      );

      // Act
      await service.executeInTransaction(mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalledWith(mockTransaction);
    });

    it('should handle nested transactions', async () => {
      // Arrange
      const nestedCallback = jest.fn().mockResolvedValue('nested result');
      const mainCallback = jest.fn().mockImplementation(async (tx) => {
        // Simulate nested transaction call
        return await service.executeInTransaction(nestedCallback);
      });

      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      };
      databaseService.db.transaction.mockImplementation((callback) =>
        callback(mockTransaction),
      );

      // Act
      const result = await service.executeInTransaction(mainCallback);

      // Assert
      expect(result).toBe('nested result');
      expect(databaseService.db.transaction).toHaveBeenCalledTimes(2);
    });

    it('should preserve error types from callback', async () => {
      // Arrange
      const customError = new Error('Custom error message');
      customError.name = 'CustomError';
      const mockCallback = jest.fn().mockRejectedValue(customError);
      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      };
      databaseService.db.transaction.mockImplementation(async (callback) => {
        try {
          return await callback(mockTransaction);
        } catch (err) {
          await mockTransaction.rollback();
          throw err;
        }
      });

      // Act & Assert
      await expect(service.executeInTransaction(mockCallback)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle synchronous callbacks', async () => {
      // Arrange
      const mockCallback = jest.fn().mockReturnValue('sync result');
      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      };
      databaseService.db.transaction.mockImplementation((callback) =>
        callback(mockTransaction),
      );

      // Act
      const result = await service.executeInTransaction(mockCallback);

      // Assert
      expect(result).toBe('sync result');
      expect(mockCallback).toHaveBeenCalledWith(mockTransaction);
    });

    it('should handle undefined return values', async () => {
      // Arrange
      const mockCallback = jest.fn().mockResolvedValue(undefined);
      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      };
      databaseService.db.transaction.mockImplementation((callback) =>
        callback(mockTransaction),
      );

      // Act
      const result = await service.executeInTransaction(mockCallback);

      // Assert
      expect(result).toBeUndefined();
      expect(mockCallback).toHaveBeenCalledWith(mockTransaction);
    });

    it('should handle null return values', async () => {
      // Arrange
      const mockCallback = jest.fn().mockResolvedValue(null);
      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      };
      databaseService.db.transaction.mockImplementation((callback) =>
        callback(mockTransaction),
      );

      // Act
      const result = await service.executeInTransaction(mockCallback);

      // Assert
      expect(result).toBeNull();
      expect(mockCallback).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe('error handling', () => {
    it('should wrap database errors in InternalServerErrorException', async () => {
      // Arrange
      const databaseError = new Error('Database connection lost');
      const mockCallback = jest.fn();
      databaseService.db.transaction.mockRejectedValue(databaseError);

      // Act & Assert
      const thrownError = await service
        .executeInTransaction(mockCallback)
        .catch((err) => err);

      expect(thrownError).toBeInstanceOf(InternalServerErrorException);
      expect(thrownError.message).toContain('Transaction failed');
    });

    it('should include original error message in wrapped exception', async () => {
      // Arrange
      const originalError = new Error('Specific database error');
      const mockCallback = jest.fn().mockRejectedValue(originalError);
      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      };
      databaseService.db.transaction.mockImplementation(async (callback) => {
        try {
          return await callback(mockTransaction);
        } catch (err) {
          await mockTransaction.rollback();
          throw err;
        }
      });

      // Act & Assert
      const thrownError = await service
        .executeInTransaction(mockCallback)
        .catch((err) => err);

      expect(thrownError).toBeInstanceOf(InternalServerErrorException);
      expect(thrownError.message).toContain('Transaction failed');
    });
  });

  describe('performance', () => {
    it('should handle multiple concurrent transactions', async () => {
      // Arrange
      const callbacks = Array.from({ length: 5 }, (_, i) =>
        jest.fn().mockResolvedValue(`result-${i}`),
      );
      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      };
      databaseService.db.transaction.mockImplementation((callback) =>
        callback(mockTransaction),
      );

      // Act
      const promises = callbacks.map((callback) =>
        service.executeInTransaction(callback),
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toEqual([
        'result-0',
        'result-1',
        'result-2',
        'result-3',
        'result-4',
      ]);
      expect(databaseService.db.transaction).toHaveBeenCalledTimes(5);
      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledWith(mockTransaction);
      });
    });

    it('should handle long-running transactions', async () => {
      // Arrange
      const longRunningCallback = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return 'long result';
      });
      const mockTransaction = {
        rollback: jest.fn(),
        commit: jest.fn(),
      };
      databaseService.db.transaction.mockImplementation((callback) =>
        callback(mockTransaction),
      );

      // Act
      const startTime = Date.now();
      const result = await service.executeInTransaction(longRunningCallback);
      const endTime = Date.now();

      // Assert
      expect(result).toBe('long result');
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
      expect(longRunningCallback).toHaveBeenCalledWith(mockTransaction);
    });
  });
});
