import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('subchapters/:subchapterId')
  async getQuizBySubchapter(@Param('subchapterId') subchapterId: string) {
    return this.quizService.getQuizBySubchapter(subchapterId);
  }

  @Post(':quizId/submit')
  async submitQuiz(
    @Param('quizId') quizId: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @Request() req,
  ) {
    return this.quizService.submitQuiz(req.user.id, quizId, submitQuizDto);
  }

  @Get('attempts')
  async getUserQuizAttempts(
    @Request() req,
    @Query('subchapterId') subchapterId?: string,
  ) {
    return this.quizService.getUserQuizAttempts(req.user.id, subchapterId);
  }
}