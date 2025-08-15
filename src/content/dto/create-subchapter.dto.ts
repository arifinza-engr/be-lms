// src/content/dto/create-subchapter.dto.ts
import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubchapterDto {
  @ApiProperty({
    description: 'Subchapter title',
    example: 'Persamaan Linear',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Subchapter description',
    example: 'Persamaan linear satu variabel dan sistem persamaan linear',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Subchapter order',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({
    description: 'Chapter ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  chapterId: string;
}
