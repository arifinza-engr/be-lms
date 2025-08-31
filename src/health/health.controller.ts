// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { DatabaseService } from '@/database/database.service';
import { RedisService } from '@/common/services/redis.service';
import { CacheService } from '@/common/services/cache.service';
import { RateLimitService } from '@/common/services/rate-limit.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private database: DatabaseService,
    private redis: RedisService,
    private cache: CacheService,
    private rateLimit: RateLimitService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Overall health check',
    description:
      'Check the health status of all critical system components including database and Redis',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check results - all systems operational',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                responseTime: { type: 'string', example: '15ms' },
                connections: {
                  type: 'object',
                  properties: {
                    active: { type: 'number', example: 5 },
                    idle: { type: 'number', example: 10 },
                    total: { type: 'number', example: 15 },
                  },
                },
              },
            },
            redis: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                responseTime: { type: 'string', example: '8ms' },
                testOperation: { type: 'string', example: 'passed' },
              },
            },
          },
        },
        error: { type: 'object', example: {} },
        details: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                responseTime: { type: 'string', example: '15ms' },
                connections: {
                  type: 'object',
                  properties: {
                    active: { type: 'number', example: 5 },
                    idle: { type: 'number', example: 10 },
                    total: { type: 'number', example: 15 },
                  },
                },
              },
            },
            redis: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                responseTime: { type: 'string', example: '8ms' },
                testOperation: { type: 'string', example: 'passed' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - one or more components are down',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        info: { type: 'object', example: {} },
        error: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'down' },
                message: {
                  type: 'string',
                  example: 'Database connection failed',
                },
                error: { type: 'string', example: 'Connection timeout' },
              },
            },
          },
        },
        details: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'down' },
                message: {
                  type: 'string',
                  example: 'Database connection failed',
                },
                error: { type: 'string', example: 'Connection timeout' },
              },
            },
            redis: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                responseTime: { type: 'string', example: '8ms' },
                testOperation: { type: 'string', example: 'passed' },
              },
            },
          },
        },
      },
    },
  })
  check() {
    return this.health.check([
      () => this.databaseHealthCheck(),
      () => this.redisHealthCheck(),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({
    status: 200,
    description: 'Service is ready to accept traffic',
  })
  readiness() {
    return this.health.check([
      () => this.databaseHealthCheck(),
      () => this.redisHealthCheck(),
    ]);
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe for Kubernetes',
    description:
      'Simple liveness check that returns basic system information. Used by Kubernetes to determine if the pod should be restarted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is alive and responding',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T10:00:00.000Z' },
        uptime: { type: 'number', example: 3600.123 },
        memory: {
          type: 'object',
          properties: {
            rss: { type: 'number', example: 52428800 },
            heapTotal: { type: 'number', example: 20971520 },
            heapUsed: { type: 'number', example: 15728640 },
            external: { type: 'number', example: 1048576 },
            arrayBuffers: { type: 'number', example: 524288 },
          },
        },
        version: { type: 'string', example: '1.0.0' },
        nodeVersion: { type: 'string', example: 'v20.10.0' },
        environment: { type: 'string', example: 'development' },
      },
    },
  })
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health and performance metrics' })
  @ApiResponse({ status: 200, description: 'Detailed system metrics' })
  async detailed() {
    const [dbStats, cacheStats, rateLimitStats, dbConnectionStats, dbSize] =
      await Promise.allSettled([
        this.database.getConnectionStats(),
        this.cache.getStats(),
        this.rateLimit.getRateLimitStats(),
        this.database.getConnectionStats(),
        this.database.getDatabaseSize(),
      ]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        platform: process.platform,
        arch: process.arch,
      },
      database: {
        status: dbStats.status === 'fulfilled' ? 'up' : 'down',
        connectionStats: dbStats.status === 'fulfilled' ? dbStats.value : null,
        size: dbSize.status === 'fulfilled' ? dbSize.value : null,
      },
      cache: {
        status: 'up',
        stats: cacheStats.status === 'fulfilled' ? cacheStats.value : null,
      },
      rateLimit: {
        status: 'up',
        stats:
          rateLimitStats.status === 'fulfilled' ? rateLimitStats.value : null,
      },
      redis: {
        status: this.redis.isHealthy() ? 'up' : 'down',
      },
    };
  }

  private async databaseHealthCheck(): Promise<HealthIndicatorResult> {
    try {
      const startTime = Date.now();
      const isHealthy = await this.database.healthCheck();
      const responseTime = Date.now() - startTime;

      if (isHealthy) {
        const connectionStats = await this.database.getConnectionStats();
        return {
          database: {
            status: 'up',
            responseTime: `${responseTime}ms`,
            connections: connectionStats,
          },
        };
      } else {
        return {
          database: {
            status: 'down',
            responseTime: `${responseTime}ms`,
            message: 'Database health check failed',
          },
        };
      }
    } catch (error) {
      return {
        database: {
          status: 'down',
          message: 'Database connection failed',
          error: error.message,
        },
      };
    }
  }

  private async redisHealthCheck(): Promise<HealthIndicatorResult> {
    try {
      const startTime = Date.now();
      const isHealthy = this.redis.isHealthy();
      const responseTime = Date.now() - startTime;

      if (isHealthy) {
        // Test Redis with a simple operation
        await this.redis.set('health:check', 'ok', 10);
        const testValue = await this.redis.get('health:check');

        return {
          redis: {
            status: 'up',
            responseTime: `${responseTime}ms`,
            testOperation: testValue === 'ok' ? 'passed' : 'failed',
          },
        };
      } else {
        return {
          redis: {
            status: 'down',
            responseTime: `${responseTime}ms`,
            message: 'Redis is not healthy',
          },
        };
      }
    } catch (error) {
      return {
        redis: {
          status: 'down',
          message: 'Redis connection failed',
          error: error.message,
        },
      };
    }
  }
}
