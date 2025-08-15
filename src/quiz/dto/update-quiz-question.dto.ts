// src/quiz/dto/update-quiz-question.dto.ts
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuizQuestionDto {
  @ApiPropertyOptional({
    description: 'Quiz ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  quizId?: string;

  @ApiPropertyOptional({
    description: 'Question text',
    example: 'Nilai x dari persamaan 3x + 7 = 22 adalah...',
  })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({
    description: 'Answer options',
    example: ['A. 5', 'B. 4', 'C. 6', 'D. 3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({
    description: 'Correct answer',
    example: 'A',
  })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

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
