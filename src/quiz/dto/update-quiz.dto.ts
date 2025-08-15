// src/quiz/dto/update-quiz.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuizDto {
  @ApiPropertyOptional({
    description: 'Subchapter ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  subchapterId?: string;

  @ApiPropertyOptional({
    description: 'Quiz title',
    example: 'Quiz: Persamaan Linear',
  })
  @IsOptional()
  @IsString()
  title?: string;

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
}
