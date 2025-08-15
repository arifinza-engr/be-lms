// src/content/dto/create-chapter.dto.ts
import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChapterDto {
  @ApiProperty({
    description: 'Chapter title',
    example: 'Aljabar',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Chapter description',
    example: 'Konsep dasar aljabar, persamaan, dan pertidaksamaan',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Chapter order',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({
    description: 'Subject ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  subjectId: string;
}
