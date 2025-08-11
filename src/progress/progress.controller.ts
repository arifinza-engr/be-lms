import { Controller, Get, UseGuards, Request, Query, Param } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async getUserProgress(
    @Request() req,
    @Query('gradeId') gradeId?: string,
  ) {
    return this.progressService.getUserProgress(req.user.id, gradeId);
  }

  @Get('summary')
  async getProgressSummary(@Request() req) {
    return this.progressService.getProgressSummary(req.user.id);
  }

  @Get('subjects/:subjectId')
  async getSubjectProgress(
    @Param('subjectId') subjectId: string,
    @Request() req,
  ) {
    return this.progressService.getSubjectProgress(req.user.id, subjectId);
  }
}