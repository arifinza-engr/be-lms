// src/database/database.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { Logger } from '@nestjs/common';

// Mock postgres client with template literal support
const mockClient = jest.fn();
mockClient.end = jest.fn();
mockClient.query = jest.fn();

// Mock drizzle
const mockDb = {
  transaction: jest.fn(),
  query: {},
};

jest.mock('postgres', () => {
  const mockPostgresFunction = jest.fn(() => mockClient);
  mockPostgresFunction.camel = 'camel';
  return mockPostgresFunction;
});

jest.mock('drizzle-orm/postgres-js', () => ({
  drizzle: jest.fn(() => mockDb),
}));

describe('DatabaseService', () => {
  let service: DatabaseService;
  let configService: jest.Mocked<ConfigService>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    configService = module.get(ConfigService);

    // Spy on logger methods
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize database with development config', () => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/test_db';
            case 'NODE_ENV':
              return 'development';
            default:
              return defaultValue;
          }
        },
      );

      // Create new service instance to test initialization
      const testService = new DatabaseService(configService);

      expect(configService.get).toHaveBeenCalledWith('DATABASE_URL');
      expect(configService.get).toHaveBeenCalledWith('NODE_ENV', 'development');
    });

    it('should initialize database with production config', () => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/prod_db';
            case 'NODE_ENV':
              return 'production';
            default:
              return defaultValue;
          }
        },
      );

      const testService = new DatabaseService(configService);

      expect(configService.get).toHaveBeenCalledWith('DATABASE_URL');
      expect(configService.get).toHaveBeenCalledWith('NODE_ENV', 'development');
    });

    it('should initialize database with test config', () => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/test_db';
            case 'NODE_ENV':
              return 'test';
            default:
              return defaultValue;
          }
        },
      );

      const testService = new DatabaseService(configService);

      expect(configService.get).toHaveBeenCalledWith('DATABASE_URL');
      expect(configService.get).toHaveBeenCalledWith('NODE_ENV', 'development');
    });
  });

  describe('onModuleInit', () => {
    beforeEach(() => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/test_db';
            case 'NODE_ENV':
              return 'test';
            default:
              return defaultValue;
          }
        },
      );
    });

    it('should connect successfully on first attempt', async () => {
      // Mock successful connection - template literal query
      mockClient.mockResolvedValue([{ '?column?': 1 }]);

      await service.onModuleInit();

      expect(loggerSpy).toHaveBeenCalledWith(
        '✅ Database connected successfully',
      );
    });

    it('should retry connection on failure and eventually succeed', async () => {
      let attemptCount = 0;
      mockClient.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Connection failed');
        }
        return Promise.resolve([{ '?column?': 1 }]);
      });

      // Mock setTimeout to resolve immediately for testing
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      await service.onModuleInit();

      expect(loggerSpy).toHaveBeenCalledWith(
        '✅ Database connected successfully',
      );
      expect(attemptCount).toBe(3);
    });

    it('should throw error after max retries exceeded', async () => {
      mockClient.mockRejectedValue(new Error('Connection failed'));

      // Mock setTimeout to resolve immediately for testing
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('onModuleDestroy', () => {
    beforeEach(() => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/test_db';
            case 'NODE_ENV':
              return 'test';
            default:
              return defaultValue;
          }
        },
      );
    });

    it('should close database connection successfully', async () => {
      mockClient.end.mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(mockClient.end).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('🔌 Closing DB connection...');
      expect(loggerSpy).toHaveBeenCalledWith('✅ DB connection closed.');
    });

    it('should handle error when closing connection', async () => {
      const error = new Error('Close failed');
      mockClient.end.mockRejectedValue(error);

      await service.onModuleDestroy();

      expect(mockClient.end).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('🔌 Closing DB connection...');
    });
  });

  describe('transaction', () => {
    beforeEach(() => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/test_db';
            case 'NODE_ENV':
              return 'test';
            default:
              return defaultValue;
          }
        },
      );
    });

    it('should execute transaction successfully', async () => {
      const mockCallback = jest.fn().mockResolvedValue('transaction result');
      mockDb.transaction.mockImplementation((callback) => callback(mockDb));

      const result = await service.transaction(mockCallback);

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(mockDb);
      expect(result).toBe('transaction result');
    });

    it('should handle transaction error', async () => {
      const error = new Error('Transaction failed');
      const mockCallback = jest.fn().mockRejectedValue(error);
      mockDb.transaction.mockImplementation((callback) => callback(mockDb));

      await expect(service.transaction(mockCallback)).rejects.toThrow(
        'Transaction failed',
      );
    });
  });

  describe('healthCheck', () => {
    beforeEach(() => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/test_db';
            case 'NODE_ENV':
              return 'test';
            default:
              return defaultValue;
          }
        },
      );
    });

    it('should return true when database is healthy', async () => {
      mockClient.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.healthCheck();

      expect(result).toBe(true);
    });

    it('should return false when database is unhealthy', async () => {
      mockClient.mockRejectedValue(new Error('Health check failed'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('getRawClient', () => {
    beforeEach(() => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/test_db';
            case 'NODE_ENV':
              return 'test';
            default:
              return defaultValue;
          }
        },
      );
    });

    it('should return raw postgres client', () => {
      const client = service.getRawClient();
      expect(client).toBeDefined();
    });
  });

  describe('getConnectionStats', () => {
    beforeEach(() => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/test_db';
            case 'NODE_ENV':
              return 'test';
            default:
              return defaultValue;
          }
        },
      );
    });

    it('should return connection stats successfully', async () => {
      const mockStats = {
        total_connections: 10,
        active_connections: 5,
        idle_connections: 5,
      };
      mockClient.mockResolvedValue([mockStats]);

      const result = await service.getConnectionStats();

      expect(result).toEqual(mockStats);
    });

    it('should return null when query fails', async () => {
      mockClient.mockRejectedValue(new Error('Query failed'));

      const result = await service.getConnectionStats();

      expect(result).toBeNull();
    });
  });

  describe('getDatabaseSize', () => {
    beforeEach(() => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/test_db';
            case 'NODE_ENV':
              return 'test';
            default:
              return defaultValue;
          }
        },
      );
    });

    it('should return database size successfully', async () => {
      const mockSize = { size: '100 MB' };
      mockClient.mockResolvedValue([mockSize]);

      const result = await service.getDatabaseSize();

      expect(result).toEqual(mockSize);
    });

    it('should return null when query fails', async () => {
      mockClient.mockRejectedValue(new Error('Query failed'));

      const result = await service.getDatabaseSize();

      expect(result).toBeNull();
    });
  });

  describe('getSlowQueries', () => {
    beforeEach(() => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/test_db';
            case 'NODE_ENV':
              return 'test';
            default:
              return defaultValue;
          }
        },
      );
    });

    it('should return slow queries successfully', async () => {
      const mockQueries = [
        {
          query: 'SELECT * FROM users',
          calls: 100,
          total_time: 1000,
          mean_time: 10,
          rows: 1000,
        },
      ];
      mockClient.mockResolvedValue(mockQueries);

      const result = await service.getSlowQueries(5);

      expect(result).toEqual(mockQueries);
    });

    it('should return empty array when pg_stat_statements not available', async () => {
      mockClient.mockRejectedValue(new Error('Extension not available'));

      const result = await service.getSlowQueries();

      expect(result).toEqual([]);
    });
  });

  describe('gracefulShutdown', () => {
    beforeEach(() => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          switch (key) {
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/test_db';
            case 'NODE_ENV':
              return 'test';
            default:
              return defaultValue;
          }
        },
      );
    });

    it('should shutdown gracefully when no active connections', async () => {
      const mockStats = { active_connections: 1 };
      mockClient.end.mockResolvedValue(undefined);

      // Mock getConnectionStats method
      jest.spyOn(service, 'getConnectionStats').mockResolvedValue(mockStats);

      await service.gracefulShutdown();

      expect(mockClient.end).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('✅ Database shutdown completed');
    });

    it('should wait for active connections to finish', async () => {
      let callCount = 0;
      jest.spyOn(service, 'getConnectionStats').mockImplementation(async () => {
        callCount++;
        return callCount < 3
          ? { active_connections: 5 }
          : { active_connections: 1 };
      });

      mockClient.end.mockResolvedValue(undefined);

      // Mock setTimeout to resolve immediately for testing
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      await service.gracefulShutdown();

      expect(mockClient.end).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('✅ Database shutdown completed');
    });

    it('should handle error during graceful shutdown', async () => {
      const error = new Error('Shutdown failed');
      jest.spyOn(service, 'getConnectionStats').mockRejectedValue(error);

      await expect(service.gracefulShutdown()).rejects.toThrow(
        'Shutdown failed',
      );
    });
  });
});
