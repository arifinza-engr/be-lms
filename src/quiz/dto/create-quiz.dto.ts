// src/quiz/dto/create-quiz.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuizQuestionDto {
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

export class CreateQuizDto {
  @ApiProperty({
    description: 'Subchapter ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  subchapterId: string;

  @ApiProperty({
    description: 'Quiz title',
    example: 'Quiz: Persamaan Linear',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Quiz description',
    example: 'Quiz untuk menguji pemahaman tentang persamaan linear',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the quiz is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Time limit in minutes',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @ApiPropertyOptional({
    description: 'Passing score percentage',
    example: 75,
  })
  @IsOptional()
  @IsNumber()
  passingScore?: number;

  @ApiPropertyOptional({
    description: 'Quiz questions',
    type: [QuizQuestionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions?: QuizQuestionDto[];
}
