// src/health/health.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  TerminusModule,
  HealthCheckService,
  HealthCheck,
} from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { DatabaseService } from '@/database/database.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let databaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const mockHealthCheckService = {
      check: jest.fn(),
    };

    const mockDatabaseService = {
      isHealthy: jest.fn(),
      getConnectionStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
    databaseService = module.get(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return healthy status when all services are up', async () => {
      // Arrange
      const mockHealthResult = {
        status: 'ok',
        info: {
          database: {
            status: 'up',
            message: 'Database connection is healthy',
          },
          memory_heap: {
            status: 'up',
            used: 50000000,
            total: 100000000,
          },
          memory_rss: {
            status: 'up',
            used: 80000000,
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
            message: 'Database connection is healthy',
          },
          memory_heap: {
            status: 'up',
            used: 50000000,
            total: 100000000,
          },
          memory_rss: {
            status: 'up',
            used: 80000000,
          },
        },
      };

      databaseService.isHealthy.mockResolvedValue(true);
      healthCheckService.check.mockResolvedValue(mockHealthResult);

      // Act
      const result = await controller.check();

      // Assert
      expect(result).toEqual(mockHealthResult);
      expect(result.status).toBe('ok');
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should return unhealthy status when database is down', async () => {
      // Arrange
      const mockHealthResult = {
        status: 'error',
        info: {
          memory_heap: {
            status: 'up',
            used: 50000000,
            total: 100000000,
          },
          memory_rss: {
            status: 'up',
            used: 80000000,
          },
        },
        error: {
          database: {
            status: 'down',
            message: 'Database connection failed',
          },
        },
        details: {
          database: {
            status: 'down',
            message: 'Database connection failed',
          },
          memory_heap: {
            status: 'up',
            used: 50000000,
            total: 100000000,
          },
          memory_rss: {
            status: 'up',
            used: 80000000,
          },
        },
      };

      databaseService.isHealthy.mockResolvedValue(false);
      healthCheckService.check.mockResolvedValue(mockHealthResult);

      // Act
      const result = await controller.check();

      // Assert
      expect(result).toEqual(mockHealthResult);
      expect(result.status).toBe('error');
      expect(result.error).toHaveProperty('database');
    });

    it('should handle health check errors gracefully', async () => {
      // Arrange
      const error = new Error('Health check failed');
      healthCheckService.check.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.check()).rejects.toThrow('Health check failed');
    });
  });

  describe('readiness', () => {
    it('should return ready status when all critical services are available', async () => {
      // Arrange
      const mockReadinessResult = {
        status: 'ok',
        info: {
          database: {
            status: 'up',
            message: 'Database is ready',
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
            message: 'Database is ready',
          },
        },
      };

      databaseService.isHealthy.mockResolvedValue(true);
      healthCheckService.check.mockResolvedValue(mockReadinessResult);

      // Act
      const result = await controller.readiness();

      // Assert
      expect(result).toEqual(mockReadinessResult);
      expect(result.status).toBe('ok');
    });

    it('should return not ready status when critical services are unavailable', async () => {
      // Arrange
      const mockReadinessResult = {
        status: 'error',
        info: {},
        error: {
          database: {
            status: 'down',
            message: 'Database is not ready',
          },
        },
        details: {
          database: {
            status: 'down',
            message: 'Database is not ready',
          },
        },
      };

      databaseService.isHealthy.mockResolvedValue(false);
      healthCheckService.check.mockResolvedValue(mockReadinessResult);

      // Act
      const result = await controller.readiness();

      // Assert
      expect(result).toEqual(mockReadinessResult);
      expect(result.status).toBe('error');
    });
  });

  describe('liveness', () => {
    it('should return alive status when application is running', async () => {
      // Arrange
      const mockLivenessResult = {
        status: 'ok',
        info: {
          memory_heap: {
            status: 'up',
            used: 50000000,
            total: 100000000,
          },
          memory_rss: {
            status: 'up',
            used: 80000000,
          },
        },
        error: {},
        details: {
          memory_heap: {
            status: 'up',
            used: 50000000,
            total: 100000000,
          },
          memory_rss: {
            status: 'up',
            used: 80000000,
          },
        },
      };

      healthCheckService.check.mockResolvedValue(mockLivenessResult);

      // Act
      const result = await controller.liveness();

      // Assert
      expect(result).toEqual(mockLivenessResult);
      expect(result.status).toBe('ok');
    });

    it('should return unhealthy status when memory usage is critical', async () => {
      // Arrange
      const mockLivenessResult = {
        status: 'error',
        info: {},
        error: {
          memory_heap: {
            status: 'down',
            used: 950000000,
            total: 1000000000,
            message: 'Memory usage is critical',
          },
        },
        details: {
          memory_heap: {
            status: 'down',
            used: 950000000,
            total: 1000000000,
            message: 'Memory usage is critical',
          },
        },
      };

      healthCheckService.check.mockResolvedValue(mockLivenessResult);

      // Act
      const result = await controller.liveness();

      // Assert
      expect(result).toEqual(mockLivenessResult);
      expect(result.status).toBe('error');
    });
  });

  describe('detailed', () => {
    it('should return detailed health information', async () => {
      // Arrange
      const mockDetailedResult = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        environment: 'test',
        services: {
          database: {
            status: 'up',
            responseTime: 15,
            connections: {
              active: 5,
              idle: 10,
              total: 15,
            },
          },
          memory: {
            status: 'up',
            heap: {
              used: 50000000,
              total: 100000000,
              percentage: 50,
            },
            rss: 80000000,
          },
          cpu: {
            status: 'up',
            usage: 25.5,
          },
        },
      };

      databaseService.getConnectionStatus.mockResolvedValue({
        active: 5,
        idle: 10,
        total: 15,
      });

      // Mock process.memoryUsage()
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 80000000,
        heapTotal: 100000000,
        heapUsed: 50000000,
        external: 5000000,
        arrayBuffers: 1000000,
      });

      // Mock process.cpuUsage()
      jest.spyOn(process, 'cpuUsage').mockReturnValue({
        user: 1000000,
        system: 500000,
      });

      // Act
      const result = await controller.detailed();

      // Assert
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('services');
      expect(result.services).toHaveProperty('database');
      expect(result.services).toHaveProperty('memory');
      expect(result.services.database).toHaveProperty('connections');
    });

    it('should handle database connection status errors', async () => {
      // Arrange
      databaseService.getConnectionStatus.mockRejectedValue(
        new Error('Connection status unavailable'),
      );

      // Act
      const result = await controller.detailed();

      // Assert
      expect(result).toHaveProperty('services');
      expect(result.services.database.status).toBe('down');
    });
  });

  describe('metrics', () => {
    it('should return application metrics', async () => {
      // Arrange
      const mockMetrics = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: 80000000,
          heapTotal: 100000000,
          heapUsed: 50000000,
          external: 5000000,
        },
        cpu: {
          user: 1000000,
          system: 500000,
        },
        eventLoop: {
          delay: 1.5,
        },
        gc: {
          collections: 10,
          duration: 50,
        },
      };

      // Mock process methods
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        rss: 80000000,
        heapTotal: 100000000,
        heapUsed: 50000000,
        external: 5000000,
        arrayBuffers: 1000000,
      });

      jest.spyOn(process, 'cpuUsage').mockReturnValue({
        user: 1000000,
        system: 500000,
      });

      // Act
      const result = await controller.metrics();

      // Assert
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('cpu');
      expect(result.memory).toHaveProperty('rss');
      expect(result.memory).toHaveProperty('heapTotal');
      expect(result.memory).toHaveProperty('heapUsed');
      expect(result.cpu).toHaveProperty('user');
      expect(result.cpu).toHaveProperty('system');
    });
  });
});
