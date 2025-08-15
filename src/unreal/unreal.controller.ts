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
} from '@nestjs/swagger';

@ApiTags('Unreal Engine Integration')
@ApiBearerAuth('JWT-auth')
@Controller('unreal')
@UseGuards(JwtAuthGuard)
export class UnrealController {
  constructor(private readonly unrealService: UnrealService) {}

  @ApiOperation({ summary: 'Get Metahuman session data for subchapter' })
  @ApiResponse({ status: 200, description: 'Metahuman session data' })
  @ApiResponse({ status: 404, description: 'Subchapter not found' })
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

  @ApiOperation({ summary: 'Get session history' })
  @ApiResponse({ status: 200, description: 'User session history' })
  @Get('sessions')
  async getSessionHistory(
    @Request() req,
    @Query('subchapterId') subchapterId?: string,
  ) {
    return this.unrealService.getSessionHistory(req.user.id, subchapterId);
  }
}
