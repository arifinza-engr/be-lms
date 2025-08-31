// src/common/services/file-upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class FileUploadService {
  private readonly uploadPath: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadPath = path.join(process.cwd(), 'uploads');
    this.maxFileSize = 100 * 1024 * 1024; // 100MB
    this.allowedMimeTypes = [
      // Videos
      'video/mp4',
      'video/webm',
      'video/avi',
      'video/mov',
      'video/wmv',

      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',

      // Text files
      'text/plain',

      // Audio
      'audio/mpeg', // .mp3
      'audio/wav', // .wav
      'audio/ogg', // .ogg
      'audio/webm', // .webm
      'audio/aac', // .aac
      'audio/flac', // .flac
    ];

    // Ensure upload directories exist
    this.ensureUploadDirectories();
  }

  private async ensureUploadDirectories() {
    const directories = [
      'videos',
      'documents',
      'images',
      'thumbnails',
      'audios',
    ];

    try {
      await mkdir(this.uploadPath, { recursive: true });

      for (const dir of directories) {
        await mkdir(path.join(this.uploadPath, dir), { recursive: true });
      }
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    subchapterId: string,
  ): Promise<{ fileUrl: string; fileName: string }> {
    // Validate file
    this.validateFile(file);

    // Determine file type and folder
    const fileType = this.getFileType(file.mimetype);
    const folder = this.getUploadFolder(fileType);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const fileName = `${timestamp}-${subchapterId}${extension}`;

    // Full file path
    const filePath = path.join(this.uploadPath, folder, fileName);
    const fileUrl = `/uploads/${folder}/${fileName}`;

    try {
      // Write file to disk
      await writeFile(filePath, file.buffer);

      return {
        fileUrl,
        fileName,
      };
    } catch (error) {
      throw new BadRequestException('Failed to save file');
    }
  }

  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    // Check mime type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  getFileType(mimeType: string): string {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'document';
  }

  private getUploadFolder(fileType: string): string {
    switch (fileType) {
      case 'video':
        return 'videos';
      case 'image':
        return 'images';
      case 'audio':
        return 'audios';
      case 'pdf':
      case 'document':
        return 'documents';
      default:
        return 'documents';
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error, just log it
    }
  }

  getFileStats(filePath: string) {
    try {
      return fs.statSync(filePath);
    } catch (error) {
      return null;
    }
  }
}
