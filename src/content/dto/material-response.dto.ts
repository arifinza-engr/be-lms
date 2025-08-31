// src/content/dto/material-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MaterialUploadedByDto {
  @ApiProperty({
    description: 'User ID who uploaded the material',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the user who uploaded',
    example: 'Pak Budi Santoso',
  })
  name: string;

  @ApiProperty({
    description: 'Email of the user who uploaded',
    example: 'budi.santoso@school.com',
  })
  email: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'GURU',
    enum: ['ADMIN', 'GURU', 'SISWA'],
  })
  role: string;
}

export class MaterialResponseDto {
  @ApiProperty({
    description: 'Material ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'Subchapter ID this material belongs to',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  })
  subchapterId: string;

  @ApiProperty({
    description: 'Title of the material',
    example: 'Video Penjelasan Aljabar',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the material',
    example: 'Video pembelajaran tentang konsep dasar aljabar',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Original filename',
    example: '1703123456789-f47ac10b-58cc-4372-a567-0e02b2c3d480.mp4',
  })
  fileName: string;

  @ApiProperty({
    description: 'URL to access the file',
    example:
      '/uploads/videos/1703123456789-f47ac10b-58cc-4372-a567-0e02b2c3d480.mp4',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'Type of file',
    example: 'video',
    enum: ['video', 'pdf', 'image', 'document'],
  })
  fileType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 15728640,
    nullable: true,
  })
  fileSize: number | null;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'video/mp4',
    nullable: true,
  })
  mimeType: string | null;

  @ApiProperty({
    description: 'Thumbnail URL for video files',
    example:
      '/uploads/thumbnails/1703123456789-f47ac10b-58cc-4372-a567-0e02b2c3d480.jpg',
    nullable: true,
  })
  thumbnailUrl: string | null;

  @ApiProperty({
    description: 'Duration in seconds for video files',
    example: 480,
    nullable: true,
  })
  duration: number | null;

  @ApiProperty({
    description: 'User who uploaded this material',
    type: MaterialUploadedByDto,
  })
  uploadedBy: MaterialUploadedByDto;

  @ApiProperty({
    description: 'Whether the material is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-12-19T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-12-19T10:30:00.000Z',
  })
  updatedAt: string;
}

export class SubchapterCompleteResponseDto {
  @ApiProperty({
    description: 'Subchapter ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  })
  id: string;

  @ApiProperty({
    description: 'Subchapter title',
    example: 'Pengenalan Aljabar',
  })
  title: string;

  @ApiProperty({
    description: 'Subchapter description',
    example: 'Bab tentang dasar-dasar aljabar',
  })
  description: string;

  @ApiProperty({
    description: 'AI generated content for this subchapter',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d481' },
        content: {
          type: 'string',
          example: 'AI-generated explanation about algebra...',
        },
        audioUrl: {
          type: 'string',
          example: 'https://elevenlabs.com/audio/xyz.mp3',
        },
        isInitial: { type: 'boolean', example: true },
        version: { type: 'number', example: 1 },
        createdAt: { type: 'string', example: '2024-12-19T10:00:00.000Z' },
      },
    },
  })
  aiGeneratedContent: any[];

  @ApiProperty({
    description: 'Uploaded materials for this subchapter',
    type: [MaterialResponseDto],
  })
  materials: MaterialResponseDto[];
}

export class MaterialsStatsDto {
  @ApiProperty({
    description: 'Video files statistics',
    example: { count: 5, totalSize: 104857600 },
    required: false,
  })
  video?: {
    count: number;
    totalSize: number;
  };

  @ApiProperty({
    description: 'PDF files statistics',
    example: { count: 3, totalSize: 6291456 },
    required: false,
  })
  pdf?: {
    count: number;
    totalSize: number;
  };

  @ApiProperty({
    description: 'Image files statistics',
    example: { count: 8, totalSize: 2097152 },
    required: false,
  })
  image?: {
    count: number;
    totalSize: number;
  };

  @ApiProperty({
    description: 'Document files statistics',
    example: { count: 2, totalSize: 1048576 },
    required: false,
  })
  document?: {
    count: number;
    totalSize: number;
  };
}
