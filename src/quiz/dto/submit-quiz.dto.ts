import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
