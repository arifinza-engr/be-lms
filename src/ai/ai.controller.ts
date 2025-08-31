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
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('AI Services')
@ApiBearerAuth('JWT-auth')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({
    summary: 'Get or generate AI content for subchapter',
    description:
      'Retrieve existing AI-generated content for a subchapter or generate new content if none exists. Content includes explanations, examples, and learning materials.',
  })
  @ApiParam({
    name: 'subchapterId',
    description: 'Subchapter ID to get or generate content for',
    example: 'uuid-subchapter-id',
  })
  @ApiResponse({
    status: 200,
    description:
      'AI generated content for the subchapter retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'AI content retrieved successfully',
        },
        content: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-ai-content-id' },
            subchapterId: { type: 'string', example: 'uuid-subchapter-id' },
            content: {
              type: 'string',
              example:
                'Persamaan linear adalah persamaan matematika yang memiliki bentuk ax + b = c, dimana a, b, dan c adalah konstanta dan x adalah variabel yang dicari...',
            },
            audioUrl: {
              type: 'string',
              example: 'https://example.com/audio/ai-content.mp3',
            },
            isGenerated: { type: 'boolean', example: true },
            generatedAt: {
              type: 'string',
              example: '2024-01-01T10:00:00.000Z',
            },
            createdAt: { type: 'string', example: '2024-01-01T10:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T10:00:00.000Z' },
          },
        },
        subchapter: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-subchapter-id' },
            title: {
              type: 'string',
              example: 'Persamaan Linear Satu Variabel',
            },
            description: {
              type: 'string',
              example: 'Mempelajari cara menyelesaikan persamaan linear',
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
  @ApiResponse({
    status: 404,
    description: 'Subchapter not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Subchapter not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too many AI requests',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: {
          type: 'string',
          example: 'Too many AI requests, please try again later',
        },
        error: { type: 'string', example: 'Too Many Requests' },
      },
    },
  })
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

  @ApiOperation({
    summary: 'Ask a question about the subchapter content',
    description:
      'Ask AI a question related to the subchapter content and get an intelligent response with audio support',
  })
  @ApiParam({
    name: 'subchapterId',
    description: 'Subchapter ID to ask question about',
    example: 'uuid-subchapter-id',
  })
  @ApiBody({
    type: AskQuestionDto,
    description: 'Question to ask the AI',
    examples: {
      mathQuestion: {
        summary: 'Mathematics Question',
        description: 'Ask about linear equations',
        value: {
          question: 'Bagaimana cara menyelesaikan persamaan 3x + 7 = 22?',
        },
      },
      physicsQuestion: {
        summary: 'Physics Question',
        description: 'Ask about motion physics',
        value: {
          question: 'Apa perbedaan antara kecepatan dan percepatan?',
        },
      },
      conceptQuestion: {
        summary: 'Concept Question',
        description: 'Ask for explanation of a concept',
        value: {
          question:
            'Bisakah Anda menjelaskan konsep ini dengan contoh yang lebih sederhana?',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'AI response to the question',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Question answered successfully' },
        response: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-chat-log-id' },
            question: {
              type: 'string',
              example: 'Bagaimana cara menyelesaikan persamaan 3x + 7 = 22?',
            },
            answer: {
              type: 'string',
              example:
                'Untuk menyelesaikan persamaan 3x + 7 = 22:\n1. Kurangi kedua ruas dengan 7: 3x = 22 - 7 = 15\n2. Bagi kedua ruas dengan 3: x = 15/3 = 5\n\nJadi, nilai x = 5.',
            },
            audioUrl: {
              type: 'string',
              example: 'https://example.com/audio/response.mp3',
            },
            createdAt: { type: 'string', example: '2024-01-01T10:00:00.000Z' },
          },
        },
        chatHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid-chat-id' },
              message: {
                type: 'string',
                example: 'User question or AI response',
              },
              messageType: {
                type: 'string',
                example: 'USER',
                enum: ['USER', 'AI'],
              },
              audioUrl: {
                type: 'string',
                example: 'https://example.com/audio.mp3',
              },
              createdAt: {
                type: 'string',
                example: '2024-01-01T10:00:00.000Z',
              },
            },
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
          example: [
            'question should not be empty',
            'question must be a string',
          ],
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
    status: 404,
    description: 'Subchapter not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Subchapter not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too many AI requests',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: {
          type: 'string',
          example: 'Too many AI requests, please try again later',
        },
        error: { type: 'string', example: 'Too Many Requests' },
      },
    },
  })
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
