import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AskQuestionDto } from './dto/ask-question.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('subchapters/:subchapterId/content')
  async getSubchapterContent(
    @Param('subchapterId') subchapterId: string,
    @Request() req,
  ) {
    return this.aiService.getOrGenerateSubchapterContent(subchapterId, req.user.id);
  }

  @Post('subchapters/:subchapterId/ask')
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

  @Get('subchapters/:subchapterId/chat-history')
  async getChatHistory(
    @Param('subchapterId') subchapterId: string,
    @Request() req,
  ) {
    return this.aiService.getChatHistory(req.user.id, subchapterId);
  }
}