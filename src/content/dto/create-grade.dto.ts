// src/content/dto/create-grade.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({
    description: 'Grade title',
    example: 'Kelas 10 SMA',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Grade description',
    example: 'Kelas X - Semester 1 & 2',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
