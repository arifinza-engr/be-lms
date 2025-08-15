// src/content/dto/create-subject.dto.ts
import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({
    description: 'Subject title',
    example: 'Matematika',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Subject description',
    example: 'Matematika Kelas 10 - Aljabar, Geometri, Trigonometri',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Grade ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  gradeId: string;
}
