// src/common/controllers/monitoring.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/types/enums';
import { MonitoringService } from '@/common/services/monitoring.service';

@ApiTags('Monitoring')
@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', enum: ['up', 'down'] },
            redis: { type: 'string', enum: ['up', 'down'] },
            openai: { type: 'string', enum: ['up', 'down'] },
            elevenlabs: { type: 'string', enum: ['up', 'down'] },
          },
        },
        uptime: { type: 'number' },
        memory_usage: { type: 'number' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getHealthStatus() {
    return this.monitoringService.getHealthStatus();
  }

  @Get('metrics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get system metrics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'System metrics',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            active_today: { type: 'number' },
            registered_today: { type: 'number' },
            logins_today: { type: 'number' },
          },
        },
        ai: {
          type: 'object',
          properties: {
            content_generated_today: { type: 'number' },
            chat_messages_today: { type: 'number' },
            tokens_used_today: { type: 'number' },
            errors_today: { type: 'number' },
            cache_hit_rate: { type: 'number' },
          },
        },
        performance: {
          type: 'object',
          properties: {
            avg_response_time: { type: 'number' },
            avg_generation_time: { type: 'number' },
            error_rate: { type: 'number' },
          },
        },
      },
    },
  })
  async getSystemMetrics() {
    return this.monitoringService.getSystemMetrics();
  }

  @Get('users/:userId/ai-usage')
  @Roles(UserRole.ADMIN, UserRole.GURU)
  @ApiOperation({ summary: 'Get AI usage for specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User AI usage statistics',
    schema: {
      type: 'object',
      properties: {
        content_generated: { type: 'number' },
        chat_messages: { type: 'number' },
        tokens_used: { type: 'number' },
        quizzes_generated: { type: 'number' },
      },
    },
  })
  async getUserAIUsage(@Param('userId') userId: string) {
    return this.monitoringService.getUserAIUsage(userId);
  }

  @Get('analytics/popular-content')
  @Roles(UserRole.ADMIN, UserRole.GURU)
  @ApiOperation({ summary: 'Get popular content analytics' })
  @ApiResponse({
    status: 200,
    description: 'Popular content statistics',
    schema: {
      type: 'object',
      properties: {
        chat: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              score: { type: 'number' },
            },
          },
        },
        quiz: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              score: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getPopularContent() {
    return this.monitoringService.getPopularContent();
  }

  @Get('errors/recent')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get recent errors (Admin only)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of errors to retrieve (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent errors',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          service: { type: 'string' },
          operation: { type: 'string' },
          error: { type: 'string' },
          userId: { type: 'string' },
          subchapterId: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getRecentErrors(@Query('limit') limit?: number) {
    return this.monitoringService.getRecentErrors(limit || 10);
  }

  @Get('reports/daily')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate daily report (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Daily system report',
    schema: {
      type: 'object',
      properties: {
        date: { type: 'string' },
        metrics: { type: 'object' },
        health: { type: 'object' },
        popular_content: { type: 'object' },
        recent_errors: { type: 'array' },
        generated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  async generateDailyReport() {
    return this.monitoringService.generateDailyReport();
  }
}
