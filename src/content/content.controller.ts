// src/content/content.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@/types/enums';
import { CreateGradeDto } from './dto/create-grade.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateSubchapterDto } from './dto/create-subchapter.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { UpdateSubchapterDto } from './dto/update-subchapter.dto';
import { UpdateMaterialDto } from './dto/upload-material.dto';
import {
  MaterialResponseDto,
  SubchapterCompleteResponseDto,
  MaterialsStatsDto,
} from './dto/material-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Content Management')
@ApiBearerAuth('JWT-auth')
@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly materialsService: MaterialsService,
  ) {}

  // Grades
  @ApiOperation({
    summary: 'Create a new grade',
    description:
      'Create a new grade/class level. Only admins can create grades.',
  })
  @ApiBody({
    type: CreateGradeDto,
    description: 'Grade creation data',
    examples: {
      grade10: {
        summary: 'Grade 10',
        description: 'Create Grade 10 (Kelas 10)',
        value: {
          title: 'Kelas 10 SMA',
          description: 'Kelas X - Semester 1 & 2',
        },
      },
      grade11: {
        summary: 'Grade 11',
        description: 'Create Grade 11 (Kelas 11)',
        value: {
          title: 'Kelas 11 SMA',
          description: 'Kelas XI - Semester 1 & 2',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Grade created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Grade created successfully' },
        grade: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-string' },
            title: { type: 'string', example: 'Kelas 10 SMA' },
            description: {
              type: 'string',
              example: 'Kelas X - Semester 1 & 2',
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['title should not be empty', 'title must be a string'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Insufficient permissions' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Grade already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example: 'Grade with this title already exists',
        },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  @Post('grades')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createGrade(@Body() createGradeDto: CreateGradeDto) {
    return this.contentService.createGrade(createGradeDto);
  }

  @ApiOperation({
    summary: 'Get all grades',
    description:
      'Retrieve all active grades/class levels available in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all grades',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Grades retrieved successfully' },
        grades: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid-string' },
              title: { type: 'string', example: 'Kelas 10 SMA' },
              description: {
                type: 'string',
                example: 'Kelas X - Semester 1 & 2',
              },
              isActive: { type: 'boolean', example: true },
              createdAt: {
                type: 'string',
                example: '2024-01-01T00:00:00.000Z',
              },
              updatedAt: {
                type: 'string',
                example: '2024-01-01T00:00:00.000Z',
              },
              _count: {
                type: 'object',
                properties: {
                  subjects: { type: 'number', example: 5 },
                },
              },
            },
          },
        },
        total: { type: 'number', example: 3 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @Get('grades')
  async getAllGrades() {
    return this.contentService.getAllGrades();
  }

  @ApiOperation({
    summary: 'Get grade by ID',
    description:
      'Retrieve detailed information about a specific grade including its subjects count',
  })
  @ApiParam({
    name: 'id',
    description: 'Grade ID',
    example: 'uuid-grade-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Grade details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Grade retrieved successfully' },
        grade: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-grade-id' },
            title: { type: 'string', example: 'Kelas 10 SMA' },
            description: {
              type: 'string',
              example: 'Kelas X - Semester 1 & 2',
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            _count: {
              type: 'object',
              properties: {
                subjects: { type: 'number', example: 5 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Grade not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Grade not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @Get('grades/:id')
  async getGradeById(@Param('id') id: string) {
    return this.contentService.getGradeById(id);
  }

  @ApiOperation({ summary: 'Update grade' })
  @ApiResponse({ status: 200, description: 'Grade updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Grade not found' })
  @Put('grades/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateGrade(
    @Param('id') id: string,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    return this.contentService.updateGrade(id, updateGradeDto);
  }

  @ApiOperation({ summary: 'Delete grade (soft delete)' })
  @ApiResponse({ status: 200, description: 'Grade deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Grade not found' })
  @Delete('grades/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteGrade(@Param('id') id: string) {
    return this.contentService.deleteGrade(id);
  }

  // Subjects
  @ApiOperation({
    summary: 'Create a new subject',
    description:
      'Create a new subject for a specific grade. Only admins can create subjects.',
  })
  @ApiBody({
    type: CreateSubjectDto,
    description: 'Subject creation data',
    examples: {
      mathematics: {
        summary: 'Mathematics Subject',
        description: 'Create Mathematics subject for Grade 10',
        value: {
          gradeId: 'uuid-grade-id',
          title: 'Matematika',
          description: 'Mata pelajaran Matematika untuk Kelas 10 SMA',
        },
      },
      physics: {
        summary: 'Physics Subject',
        description: 'Create Physics subject for Grade 11',
        value: {
          gradeId: 'uuid-grade-id',
          title: 'Fisika',
          description: 'Mata pelajaran Fisika untuk Kelas 11 SMA',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Subject created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Subject created successfully' },
        subject: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-subject-id' },
            gradeId: { type: 'string', example: 'uuid-grade-id' },
            title: { type: 'string', example: 'Matematika' },
            description: {
              type: 'string',
              example: 'Mata pelajaran Matematika untuk Kelas 10 SMA',
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'title should not be empty',
            'gradeId must be a valid UUID',
          ],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Insufficient permissions' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Grade not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Grade not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Subject already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example: 'Subject with this title already exists for this grade',
        },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  @Post('subjects')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createSubject(@Body() createSubjectDto: CreateSubjectDto) {
    return this.contentService.createSubject(createSubjectDto);
  }

  @ApiOperation({
    summary: 'Get subjects by grade',
    description:
      'Retrieve all subjects available for a specific grade/class level',
  })
  @ApiParam({
    name: 'gradeId',
    description: 'Grade ID to get subjects for',
    example: 'uuid-grade-id',
  })
  @ApiResponse({
    status: 200,
    description: 'List of subjects for the grade retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Subjects retrieved successfully' },
        subjects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid-subject-id' },
              gradeId: { type: 'string', example: 'uuid-grade-id' },
              title: { type: 'string', example: 'Matematika' },
              description: {
                type: 'string',
                example: 'Mata pelajaran Matematika untuk Kelas 10',
              },
              isActive: { type: 'boolean', example: true },
              createdAt: {
                type: 'string',
                example: '2024-01-01T00:00:00.000Z',
              },
              updatedAt: {
                type: 'string',
                example: '2024-01-01T00:00:00.000Z',
              },
              _count: {
                type: 'object',
                properties: {
                  chapters: { type: 'number', example: 8 },
                },
              },
            },
          },
        },
        total: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Grade not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Grade not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @Get('grades/:gradeId/subjects')
  async getSubjectsByGrade(@Param('gradeId') gradeId: string) {
    return this.contentService.getSubjectsByGrade(gradeId);
  }

  @ApiOperation({ summary: 'Get subject by ID' })
  @ApiResponse({ status: 200, description: 'Subject details' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @Get('subjects/:id')
  async getSubjectById(@Param('id') id: string) {
    return this.contentService.getSubjectById(id);
  }

  @ApiOperation({ summary: 'Update subject' })
  @ApiResponse({ status: 200, description: 'Subject updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @Put('subjects/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateSubject(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.contentService.updateSubject(id, updateSubjectDto);
  }

  @ApiOperation({ summary: 'Delete subject (soft delete)' })
  @ApiResponse({ status: 200, description: 'Subject deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @Delete('subjects/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteSubject(@Param('id') id: string) {
    return this.contentService.deleteSubject(id);
  }

  // Chapters
  @ApiOperation({ summary: 'Create a new chapter' })
  @ApiResponse({ status: 201, description: 'Chapter created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Post('chapters')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createChapter(@Body() createChapterDto: CreateChapterDto) {
    return this.contentService.createChapter(createChapterDto);
  }

  @ApiOperation({ summary: 'Get chapters by subject' })
  @ApiResponse({ status: 200, description: 'List of chapters for the subject' })
  @Get('subjects/:subjectId/chapters')
  async getChaptersBySubject(@Param('subjectId') subjectId: string) {
    return this.contentService.getChaptersBySubject(subjectId);
  }

  @ApiOperation({ summary: 'Get chapter by ID' })
  @ApiResponse({ status: 200, description: 'Chapter details' })
  @ApiResponse({ status: 404, description: 'Chapter not found' })
  @Get('chapters/:id')
  async getChapterById(@Param('id') id: string) {
    return this.contentService.getChapterById(id);
  }

  @ApiOperation({ summary: 'Update chapter' })
  @ApiResponse({ status: 200, description: 'Chapter updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Chapter not found' })
  @Put('chapters/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateChapter(
    @Param('id') id: string,
    @Body() updateChapterDto: UpdateChapterDto,
  ) {
    return this.contentService.updateChapter(id, updateChapterDto);
  }

  @ApiOperation({ summary: 'Delete chapter (soft delete)' })
  @ApiResponse({ status: 200, description: 'Chapter deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Chapter not found' })
  @Delete('chapters/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteChapter(@Param('id') id: string) {
    return this.contentService.deleteChapter(id);
  }

  // Subchapters
  @ApiOperation({ summary: 'Create a new subchapter' })
  @ApiResponse({ status: 201, description: 'Subchapter created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Post('subchapters')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createSubchapter(@Body() createSubchapterDto: CreateSubchapterDto) {
    return this.contentService.createSubchapter(createSubchapterDto);
  }

  @ApiOperation({ summary: 'Get subchapters by chapter' })
  @ApiResponse({
    status: 200,
    description: 'List of subchapters for the chapter',
  })
  @Get('chapters/:chapterId/subchapters')
  async getSubchaptersByChapter(@Param('chapterId') chapterId: string) {
    return this.contentService.getSubchaptersByChapter(chapterId);
  }

  @ApiOperation({ summary: 'Get subchapter by ID' })
  @ApiResponse({ status: 200, description: 'Subchapter details' })
  @ApiResponse({ status: 404, description: 'Subchapter not found' })
  @Get('subchapters/:id')
  async getSubchapterById(@Param('id') id: string) {
    return this.contentService.getSubchapterById(id);
  }

  @ApiOperation({ summary: 'Update subchapter' })
  @ApiResponse({ status: 200, description: 'Subchapter updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Subchapter not found' })
  @Put('subchapters/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateSubchapter(
    @Param('id') id: string,
    @Body() updateSubchapterDto: UpdateSubchapterDto,
  ) {
    return this.contentService.updateSubchapter(id, updateSubchapterDto);
  }

  @ApiOperation({ summary: 'Delete subchapter (soft delete)' })
  @ApiResponse({ status: 200, description: 'Subchapter deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Subchapter not found' })
  @Delete('subchapters/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteSubchapter(@Param('id') id: string) {
    return this.contentService.deleteSubchapter(id);
  }

  // ==================== MATERIALS ENDPOINTS ====================

  @ApiTags('File Upload & Materials')
  @ApiOperation({
    summary: 'Upload material to subchapter',
    description:
      'Upload a file (video, PDF, image, document) to a specific subchapter. Only admins and teachers can upload materials.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Material upload data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 100MB)',
        },
        title: {
          type: 'string',
          description: 'Title of the material',
          example: 'Video Penjelasan Aljabar',
          maxLength: 255,
        },
        description: {
          type: 'string',
          description: 'Description of the material',
          example: 'Video pembelajaran tentang konsep dasar aljabar',
        },
      },
      required: ['file', 'title'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Material uploaded successfully',
    type: MaterialResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid file type, size too large, or missing required fields',
    schema: {
      example: {
        statusCode: 400,
        message: 'File size too large. Maximum size is 100MB',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Teacher access required',
    schema: {
      example: {
        statusCode: 403,
        message: 'Insufficient permissions',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Subchapter not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Subchapter not found',
        error: 'Not Found',
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Subchapter ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  })
  @Post('subchapters/:id/materials')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GURU)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMaterial(
    @Param('id') subchapterId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('description') description: string,
    @Request() req,
  ) {
    return this.materialsService.uploadMaterial(
      subchapterId,
      file,
      { title, description },
      req.user.id,
    );
  }

  @ApiTags('File Upload & Materials')
  @ApiOperation({
    summary: 'Get materials for subchapter',
    description:
      'Retrieve all active materials (videos, PDFs, images, documents) for a specific subchapter.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of materials for subchapter',
    type: [MaterialResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Subchapter not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Subchapter not found',
        error: 'Not Found',
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Subchapter ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  })
  @Get('subchapters/:id/materials')
  async getSubchapterMaterials(@Param('id') subchapterId: string) {
    return this.materialsService.getMaterialsBySubchapter(subchapterId);
  }

  @ApiTags('File Upload & Materials')
  @ApiOperation({
    summary: 'Get subchapter with complete content (AI + materials)',
    description:
      '🚀 **HYBRID CONTENT ENDPOINT** - Get both AI-generated content and uploaded materials for a subchapter in one response. This is the main endpoint for the enhanced learning experience.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Complete subchapter content with AI-generated content and uploaded materials',
    type: SubchapterCompleteResponseDto,
    examples: {
      'Complete Learning Content': {
        summary: 'Complete subchapter with AI content and materials',
        value: {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
          title: 'Pengenalan Aljabar',
          description: 'Bab tentang dasar-dasar aljabar',
          aiGeneratedContent: [
            {
              id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
              content:
                'Aljabar adalah cabang matematika yang menggunakan huruf dan simbol untuk mewakili angka...',
              audioUrl: 'https://elevenlabs.com/audio/xyz.mp3',
              isInitial: true,
              version: 1,
              createdAt: '2024-12-19T10:00:00.000Z',
            },
          ],
          materials: [
            {
              id: 'f47ac10b-58cc-4372-a567-0e02b2c3d482',
              title: 'Video Penjelasan Aljabar',
              fileType: 'video',
              fileUrl:
                '/uploads/videos/1703123456789-f47ac10b-58cc-4372-a567-0e02b2c3d480.mp4',
              duration: 480,
              uploadedBy: {
                name: 'Pak Budi Santoso',
                role: 'GURU',
              },
            },
            {
              id: 'f47ac10b-58cc-4372-a567-0e02b2c3d483',
              title: 'Buku Matematika PDF',
              fileType: 'pdf',
              fileUrl:
                '/uploads/documents/1703123456790-f47ac10b-58cc-4372-a567-0e02b2c3d480.pdf',
              fileSize: 2048000,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Subchapter not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Subchapter not found',
        error: 'Not Found',
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Subchapter ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  })
  @Get('subchapters/:id/complete')
  async getSubchapterComplete(@Param('id') subchapterId: string) {
    return this.materialsService.getSubchapterWithMaterials(subchapterId);
  }

  @ApiTags('File Upload & Materials')
  @ApiOperation({
    summary: 'Get materials by type',
    description:
      'Filter materials by file type (video, pdf, image, document) for a specific subchapter.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of materials filtered by type',
    type: [MaterialResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Subchapter not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Subchapter ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  })
  @ApiParam({
    name: 'type',
    description: 'File type to filter by',
    example: 'video',
    enum: ['video', 'pdf', 'image', 'document'],
  })
  @Get('subchapters/:id/materials/type/:type')
  async getMaterialsByType(
    @Param('id') subchapterId: string,
    @Param('type') fileType: string,
  ) {
    return this.materialsService.getMaterialsByType(subchapterId, fileType);
  }

  @ApiTags('File Upload & Materials')
  @ApiOperation({
    summary: 'Get materials statistics',
    description:
      'Get statistics about materials including count and total size by file type. Admin only endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Materials statistics by file type',
    type: MaterialsStatsDto,
    examples: {
      'Materials Statistics': {
        summary: 'Statistics showing count and size by file type',
        value: {
          video: { count: 15, totalSize: 157286400 },
          pdf: { count: 8, totalSize: 16777216 },
          image: { count: 12, totalSize: 4194304 },
          document: { count: 5, totalSize: 8388608 },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiParam({
    name: 'subchapterId',
    description: 'Optional: Filter statistics by specific subchapter',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    required: false,
  })
  @Get('materials/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getMaterialsStats(@Query('subchapterId') subchapterId?: string) {
    return this.materialsService.getMaterialsStats(subchapterId);
  }

  @ApiTags('File Upload & Materials')
  @ApiOperation({
    summary: 'Get material by ID',
    description:
      'Get detailed information about a specific material including metadata and uploader info.',
  })
  @ApiResponse({
    status: 200,
    description: 'Material details',
    type: MaterialResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Material not found',
        error: 'Not Found',
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Material ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d482',
  })
  @Get('materials/:id')
  async getMaterialById(@Param('id') id: string) {
    return this.materialsService.getMaterialById(id);
  }

  @ApiTags('File Upload & Materials')
  @ApiOperation({
    summary: 'Update material metadata',
    description:
      'Update title and description of a material. Only the uploader (teacher) or admin can update materials.',
  })
  @ApiBody({
    description: 'Material update data',
    type: UpdateMaterialDto,
    examples: {
      'Update Material': {
        value: {
          title: 'Video Penjelasan Aljabar - Updated',
          description:
            'Video pembelajaran yang telah diperbarui tentang konsep dasar aljabar',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Material updated successfully',
    type: MaterialResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to update this material',
    schema: {
      example: {
        statusCode: 403,
        message: 'Not authorized to update this material',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Material ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d482',
  })
  @Put('materials/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GURU)
  async updateMaterial(
    @Param('id') id: string,
    @Body() updateData: UpdateMaterialDto,
    @Request() req,
  ) {
    return this.materialsService.updateMaterial(id, updateData, req.user.id);
  }

  @ApiTags('File Upload & Materials')
  @ApiOperation({
    summary: 'Delete material',
    description:
      'Soft delete a material (marks as inactive and removes physical file). Only the uploader (teacher) or admin can delete materials.',
  })
  @ApiResponse({
    status: 200,
    description: 'Material deleted successfully',
    schema: {
      example: {
        message: 'Material deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to delete this material',
    schema: {
      example: {
        statusCode: 403,
        message: 'Not authorized to delete this material',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Material ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d482',
  })
  @Delete('materials/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GURU)
  async deleteMaterial(@Param('id') id: string, @Request() req) {
    return this.materialsService.deleteMaterial(id, req.user.id);
  }
}
