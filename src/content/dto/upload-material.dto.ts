// src/content/dto/upload-material.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadMaterialDto {
  @ApiProperty({
    description: 'Title of the material',
    example: 'Video Penjelasan Aljabar',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Description of the material',
    example: 'Video pembelajaran tentang konsep dasar aljabar untuk kelas 10',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateMaterialDto {
  @ApiProperty({
    description: 'Updated title of the material',
    example: 'Video Penjelasan Aljabar - Updated',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'Updated description of the material',
    example:
      'Video pembelajaran yang telah diperbarui tentang konsep dasar aljabar',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
