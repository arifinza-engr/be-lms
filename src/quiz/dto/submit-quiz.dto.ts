import { IsObject, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Quiz answers mapped by question ID',
    example: {
      '123e4567-e89b-12d3-a456-426614174001': 'A',
      '123e4567-e89b-12d3-a456-426614174002': 'B',
      '123e4567-e89b-12d3-a456-426614174003': 'C',
    },
  })
  @IsObject()
  answers: Record<string, string>; // questionId -> answer

  @ApiPropertyOptional({
    description: 'Time spent on the quiz in seconds',
    example: 1800,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number; // in seconds
}
