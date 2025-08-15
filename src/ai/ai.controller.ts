import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AskQuestionDto } from './dto/ask-question.dto';
import {
  AIThrottle,
  ApiThrottle,
} from '@/common/decorators/throttle.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('AI Services')
@ApiBearerAuth('JWT-auth')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({ summary: 'Get or generate AI content for subchapter' })
  @ApiResponse({
    status: 200,
    description: 'AI generated content for the subchapter',
  })
  @ApiResponse({ status: 404, description: 'Subchapter not found' })
  @Get('subchapters/:subchapterId/content')
  @AIThrottle()
  async getSubchapterContent(
    @Param('subchapterId') subchapterId: string,
    @Request() req,
  ) {
    return this.aiService.getOrGenerateSubchapterContent(
      subchapterId,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Ask a question about the subchapter content' })
  @ApiResponse({ status: 200, description: 'AI response to the question' })
  @ApiResponse({ status: 404, description: 'Subchapter not found' })
  @Post('subchapters/:subchapterId/ask')
  @AIThrottle()
  async askQuestion(
    @Param('subchapterId') subchapterId: string,
    @Body() askQuestionDto: AskQuestionDto,
    @Request() req,
  ) {
    return this.aiService.handleUserQuestion(
      req.user.id,
      subchapterId,
      askQuestionDto.question,
    );
  }

  @ApiOperation({ summary: 'Get chat history for subchapter' })
  @ApiResponse({ status: 200, description: 'Chat history between user and AI' })
  @Get('subchapters/:subchapterId/chat-history')
  @ApiThrottle()
  async getChatHistory(
    @Param('subchapterId') subchapterId: string,
    @Request() req,
  ) {
    return this.aiService.getChatHistory(req.user.id, subchapterId);
  }
}
