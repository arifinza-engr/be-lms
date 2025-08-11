import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { UnrealService } from './unreal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateSessionDurationDto } from './dto/update-session-duration.dto';

@Controller('unreal')
@UseGuards(JwtAuthGuard)
export class UnrealController {
  constructor(private readonly unrealService: UnrealService) {}

  @Get('sessions/:subchapterId')
  async getMetahumanSessionData(
    @Param('subchapterId') subchapterId: string,
    @Request() req,
  ) {
    return this.unrealService.getMetahumanSessionData(subchapterId, req.user.id);
  }

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

  @Get('sessions')
  async getSessionHistory(
    @Request() req,
    @Query('subchapterId') subchapterId?: string,
  ) {
    return this.unrealService.getSessionHistory(req.user.id, subchapterId);
  }
}