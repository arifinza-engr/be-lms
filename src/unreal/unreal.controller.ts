import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UnrealService } from './unreal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateSessionDurationDto } from './dto/update-session-duration.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Unreal Engine Integration')
@ApiBearerAuth('JWT-auth')
@Controller('unreal')
@UseGuards(JwtAuthGuard)
export class UnrealController {
  constructor(private readonly unrealService: UnrealService) {}

  @ApiOperation({
    summary: 'Get Metahuman session data for subchapter',
    description:
      'Retrieve or create Metahuman session data for a specific subchapter, including session configuration and progress tracking',
  })
  @ApiParam({
    name: 'subchapterId',
    description: 'Subchapter ID to get Metahuman session for',
    example: 'uuid-subchapter-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Metahuman session data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Metahuman session data retrieved successfully',
        },
        session: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-session-id' },
            userId: { type: 'string', example: 'uuid-user-id' },
            subchapterId: { type: 'string', example: 'uuid-subchapter-id' },
            sessionToken: { type: 'string', example: 'session-token-string' },
            startedAt: { type: 'string', example: '2024-01-01T10:00:00.000Z' },
            duration: { type: 'number', example: 0 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2024-01-01T10:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T10:00:00.000Z' },
          },
        },
        subchapter: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-subchapter-id' },
            title: {
              type: 'string',
              example: 'Persamaan Linear Satu Variabel',
            },
            description: {
              type: 'string',
              example: 'Mempelajari cara menyelesaikan persamaan linear',
            },
          },
        },
        config: {
          type: 'object',
          properties: {
            metahumanUrl: {
              type: 'string',
              example: 'https://metahuman.example.com',
            },
            sessionTimeout: { type: 'number', example: 3600 },
            features: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'voice_interaction',
                'gesture_recognition',
                'progress_tracking',
              ],
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Subchapter not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Subchapter not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @Get('sessions/:subchapterId')
  async getMetahumanSessionData(
    @Param('subchapterId') subchapterId: string,
    @Request() req,
  ) {
    return this.unrealService.getMetahumanSessionData(
      subchapterId,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Update session duration' })
  @ApiResponse({
    status: 200,
    description: 'Session duration updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @Post('sessions/:sessionId/duration')
  async updateSessionDuration(
    @Param('sessionId') sessionId: string,
    @Body() updateSessionDurationDto: UpdateSessionDurationDto,
  ) {
    return this.unrealService.updateSessionDuration(
      sessionId,
      updateSessionDurationDto.duration,
    );
  }

  @ApiOperation({
    summary: 'Get session history',
    description:
      "Retrieve user's Metahuman session history, optionally filtered by subchapter",
  })
  @ApiQuery({
    name: 'subchapterId',
    description: 'Filter sessions by specific subchapter ID',
    required: false,
    example: 'uuid-subchapter-id',
  })
  @ApiResponse({
    status: 200,
    description: 'User session history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Session history retrieved successfully',
        },
        sessions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid-session-id' },
              subchapterId: { type: 'string', example: 'uuid-subchapter-id' },
              startedAt: {
                type: 'string',
                example: '2024-01-01T10:00:00.000Z',
              },
              endedAt: { type: 'string', example: '2024-01-01T10:30:00.000Z' },
              duration: { type: 'number', example: 1800 },
              isActive: { type: 'boolean', example: false },
              subchapter: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid-subchapter-id' },
                  title: {
                    type: 'string',
                    example: 'Persamaan Linear Satu Variabel',
                  },
                  chapter: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', example: 'Aljabar' },
                      subject: {
                        type: 'object',
                        properties: {
                          title: { type: 'string', example: 'Matematika' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        stats: {
          type: 'object',
          properties: {
            totalSessions: { type: 'number', example: 15 },
            totalDuration: { type: 'number', example: 27000 },
            averageDuration: { type: 'number', example: 1800 },
            activeSessions: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @Get('sessions')
  async getSessionHistory(
    @Request() req,
    @Query('subchapterId') subchapterId?: string,
  ) {
    return this.unrealService.getSessionHistory(req.user.id, subchapterId);
  }
}
