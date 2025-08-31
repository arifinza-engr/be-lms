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
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Quiz Management')
@ApiBearerAuth('JWT-auth')
@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // Quiz CRUD Operations
  @ApiOperation({
    summary: 'Create a new quiz',
    description:
      'Create a new quiz for a specific subchapter. Only admins can create quizzes.',
  })
  @ApiBody({
    type: CreateQuizDto,
    description: 'Quiz creation data',
    examples: {
      mathQuiz: {
        summary: 'Mathematics Quiz',
        description: 'Create a quiz for linear equations',
        value: {
          subchapterId: 'uuid-subchapter-id',
          title: 'Quiz Persamaan Linear',
          description: 'Quiz untuk menguji pemahaman tentang persamaan linear',
          timeLimit: 30,
          passingScore: 70,
        },
      },
      physicsQuiz: {
        summary: 'Physics Quiz',
        description: 'Create a quiz for motion physics',
        value: {
          subchapterId: 'uuid-subchapter-id',
          title: 'Quiz Gerak Lurus',
          description: 'Quiz untuk menguji pemahaman tentang gerak lurus',
          timeLimit: 45,
          passingScore: 75,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Quiz created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Quiz created successfully' },
        quiz: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-string' },
            subchapterId: { type: 'string', example: 'uuid-subchapter-id' },
            title: { type: 'string', example: 'Quiz Persamaan Linear' },
            description: {
              type: 'string',
              example: 'Quiz untuk menguji pemahaman tentang persamaan linear',
            },
            isActive: { type: 'boolean', example: true },
            timeLimit: { type: 'number', example: 30 },
            passingScore: { type: 'number', example: 70 },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['title should not be empty', 'subchapterId must be a UUID'],
        },
        error: { type: 'string', example: 'Bad Request' },
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
    status: 403,
    description: 'Forbidden - Admin access required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Insufficient permissions' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
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

  @ApiOperation({ summary: 'Get user quiz attempts' })
  @ApiResponse({ status: 200, description: 'List of user quiz attempts' })
  @Get('attempts')
  async getUserQuizAttempts(
    @Request() req,
    @Query('subchapterId') subchapterId?: string,
  ) {
    return this.quizService.getUserQuizAttempts(req.user.id, subchapterId);
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

  @ApiOperation({
    summary: 'Submit quiz answers',
    description:
      'Submit answers for a quiz and get immediate results with score and feedback',
  })
  @ApiParam({
    name: 'quizId',
    description: 'Quiz ID to submit answers for',
    example: 'uuid-quiz-id',
  })
  @ApiBody({
    type: SubmitQuizDto,
    description: 'Quiz submission data with answers',
    examples: {
      mathQuizSubmission: {
        summary: 'Math Quiz Submission',
        description: 'Submit answers for a mathematics quiz',
        value: {
          answers: {
            'question-1-id': 'A',
            'question-2-id': 'B',
            'question-3-id': 'C',
            'question-4-id': 'A',
          },
          timeSpent: 1800,
        },
      },
      physicsQuizSubmission: {
        summary: 'Physics Quiz Submission',
        description: 'Submit answers for a physics quiz',
        value: {
          answers: {
            'question-1-id': 'B',
            'question-2-id': 'A',
            'question-3-id': 'D',
            'question-4-id': 'C',
            'question-5-id': 'B',
          },
          timeSpent: 2100,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz submitted successfully with results',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Quiz submitted successfully' },
        attempt: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-attempt-id' },
            userId: { type: 'string', example: 'uuid-user-id' },
            quizId: { type: 'string', example: 'uuid-quiz-id' },
            score: { type: 'number', example: 85 },
            maxScore: { type: 'number', example: 100 },
            percentage: { type: 'number', example: 85 },
            passed: { type: 'boolean', example: true },
            timeSpent: { type: 'number', example: 1800 },
            startedAt: { type: 'string', example: '2024-01-01T10:00:00.000Z' },
            completedAt: {
              type: 'string',
              example: '2024-01-01T10:30:00.000Z',
            },
            answers: {
              type: 'object',
              example: {
                'question-1-id': 'A',
                'question-2-id': 'B',
                'question-3-id': 'C',
                'question-4-id': 'A',
              },
            },
          },
        },
        results: {
          type: 'object',
          properties: {
            correctAnswers: { type: 'number', example: 3 },
            totalQuestions: { type: 'number', example: 4 },
            passingScore: { type: 'number', example: 70 },
            feedback: {
              type: 'string',
              example: 'Great job! You passed the quiz.',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or invalid answers',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid quiz answers provided' },
        error: { type: 'string', example: 'Bad Request' },
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
    description: 'Quiz not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Quiz not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @Post(':quizId/submit')
  async submitQuiz(
    @Param('quizId') quizId: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @Request() req,
  ) {
    return this.quizService.submitQuiz(req.user.id, quizId, submitQuizDto);
  }
}
