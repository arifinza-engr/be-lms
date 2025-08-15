import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@/types/enums';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Quiz Management')
@ApiBearerAuth('JWT-auth')
@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // Quiz CRUD Operations
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.createQuiz(createQuizDto);
  }

  @ApiOperation({ summary: 'Get all quizzes' })
  @ApiResponse({ status: 200, description: 'List of all quizzes' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GURU)
  async getAllQuizzes() {
    return this.quizService.getAllQuizzes();
  }

  @ApiOperation({ summary: 'Get quiz by ID' })
  @ApiResponse({ status: 200, description: 'Quiz details' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Get(':id')
  async getQuizById(@Param('id') id: string) {
    return this.quizService.getQuizById(id);
  }

  @ApiOperation({ summary: 'Update quiz' })
  @ApiResponse({ status: 200, description: 'Quiz updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateQuiz(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    return this.quizService.updateQuiz(id, updateQuizDto);
  }

  @ApiOperation({ summary: 'Delete quiz (soft delete)' })
  @ApiResponse({ status: 200, description: 'Quiz deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteQuiz(@Param('id') id: string) {
    return this.quizService.deleteQuiz(id);
  }

  // Quiz Questions CRUD
  @ApiOperation({ summary: 'Create a new quiz question' })
  @ApiResponse({
    status: 201,
    description: 'Quiz question created successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Post('questions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createQuizQuestion(
    @Body() createQuizQuestionDto: CreateQuizQuestionDto,
  ) {
    return this.quizService.createQuizQuestion(createQuizQuestionDto);
  }

  @ApiOperation({ summary: 'Get questions by quiz ID' })
  @ApiResponse({ status: 200, description: 'List of questions for the quiz' })
  @Get(':quizId/questions')
  async getQuestionsByQuizId(@Param('quizId') quizId: string) {
    return this.quizService.getQuestionsByQuizId(quizId);
  }

  @ApiOperation({ summary: 'Get quiz question by ID' })
  @ApiResponse({ status: 200, description: 'Quiz question details' })
  @ApiResponse({ status: 404, description: 'Quiz question not found' })
  @Get('questions/:id')
  async getQuizQuestionById(@Param('id') id: string) {
    return this.quizService.getQuizQuestionById(id);
  }

  @ApiOperation({ summary: 'Update quiz question' })
  @ApiResponse({
    status: 200,
    description: 'Quiz question updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Quiz question not found' })
  @Put('questions/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateQuizQuestion(
    @Param('id') id: string,
    @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
  ) {
    return this.quizService.updateQuizQuestion(id, updateQuizQuestionDto);
  }

  @ApiOperation({ summary: 'Delete quiz question' })
  @ApiResponse({
    status: 200,
    description: 'Quiz question deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Quiz question not found' })
  @Delete('questions/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteQuizQuestion(@Param('id') id: string) {
    return this.quizService.deleteQuizQuestion(id);
  }

  // Student Quiz Operations
  @ApiOperation({ summary: 'Get quiz by subchapter (for students)' })
  @ApiResponse({ status: 200, description: 'Quiz for the subchapter' })
  @Get('subchapters/:subchapterId')
  async getQuizBySubchapter(@Param('subchapterId') subchapterId: string) {
    return this.quizService.getQuizBySubchapter(subchapterId);
  }

  @ApiOperation({ summary: 'Submit quiz answers' })
  @ApiResponse({
    status: 200,
    description: 'Quiz submitted successfully with results',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @Post(':quizId/submit')
  async submitQuiz(
    @Param('quizId') quizId: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @Request() req,
  ) {
    return this.quizService.submitQuiz(req.user.id, quizId, submitQuizDto);
  }

  @ApiOperation({ summary: 'Get user quiz attempts' })
  @ApiResponse({ status: 200, description: 'List of user quiz attempts' })
  @Get('attempts')
  async getUserQuizAttempts(
    @Request() req,
    @Query('subchapterId') subchapterId?: string,
  ) {
    return this.quizService.getUserQuizAttempts(req.user.id, subchapterId);
  }
}
