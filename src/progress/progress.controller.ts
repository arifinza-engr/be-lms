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
} from '@nestjs/swagger';

@ApiTags('Progress Tracking')
@ApiBearerAuth('JWT-auth')
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @ApiOperation({ summary: 'Get user progress' })
  @ApiResponse({ status: 200, description: 'User progress data' })
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
