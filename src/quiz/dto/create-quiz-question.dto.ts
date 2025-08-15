// src/quiz/dto/create-quiz-question.dto.ts
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizQuestionDto {
  @ApiProperty({
    description: 'Quiz ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  quizId: string;

  @ApiProperty({
    description: 'Question text',
    example: 'Nilai x dari persamaan 3x + 7 = 22 adalah...',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Answer options',
    example: ['A. 5', 'B. 4', 'C. 6', 'D. 3'],
  })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({
    description: 'Correct answer',
    example: 'A',
  })
  @IsString()
  correctAnswer: string;

  @ApiPropertyOptional({
    description: 'Explanation for the answer',
    example: 'Langkah penyelesaian: 3x + 7 = 22, 3x = 15, x = 5',
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({
    description: 'Question order',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({
    description: 'Points for this question',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  points?: number;
}
