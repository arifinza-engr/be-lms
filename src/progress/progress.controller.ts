import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Progress Tracking')
@ApiBearerAuth('JWT-auth')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @ApiOperation({
    summary: 'Get user progress',
    description:
      'Retrieve detailed progress information for the authenticated user, optionally filtered by grade',
  })
  @ApiQuery({
    name: 'gradeId',
    description: 'Filter progress by specific grade ID',
    required: false,
    example: 'uuid-grade-id',
  })
  @ApiResponse({
    status: 200,
    description: 'User progress data',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User progress retrieved successfully',
        },
        progress: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'uuid-user-id' },
            totalSubchapters: { type: 'number', example: 15 },
            completedSubchapters: { type: 'number', example: 8 },
            inProgressSubchapters: { type: 'number', example: 3 },
            notStartedSubchapters: { type: 'number', example: 4 },
            overallPercentage: { type: 'number', example: 53.33 },
            grades: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid-grade-id' },
                  title: { type: 'string', example: 'Kelas 10 SMA' },
                  subjects: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'uuid-subject-id' },
                        title: { type: 'string', example: 'Matematika' },
                        completedChapters: { type: 'number', example: 2 },
                        totalChapters: { type: 'number', example: 4 },
                        percentage: { type: 'number', example: 50 },
                      },
                    },
                  },
                },
              },
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
  @Get()
  async getUserProgress(@Request() req, @Query('gradeId') gradeId?: string) {
    return this.progressService.getUserProgress(req.user.id, gradeId);
  }

  @ApiOperation({ summary: 'Get progress summary' })
  @ApiResponse({ status: 200, description: 'User progress summary' })
  @Get('summary')
  async getProgressSummary(@Request() req) {
    return this.progressService.getProgressSummary(req.user.id);
  }

  @ApiOperation({ summary: 'Get subject progress' })
  @ApiResponse({ status: 200, description: 'Subject progress data' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @Get('subjects/:subjectId')
  async getSubjectProgress(
    @Param('subjectId') subjectId: string,
    @Request() req,
  ) {
    return this.progressService.getSubjectProgress(req.user.id, subjectId);
  }
}
