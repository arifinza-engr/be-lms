// src/content/content.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@/types/enums';
import { CreateGradeDto } from './dto/create-grade.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateSubchapterDto } from './dto/create-subchapter.dto';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // Grades
  @Post('grades')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createGrade(@Body() createGradeDto: CreateGradeDto) {
    return this.contentService.createGrade(createGradeDto);
  }

  @Get('grades')
  async getAllGrades() {
    return this.contentService.getAllGrades();
  }

  @Get('grades/:id')
  async getGradeById(@Param('id') id: string) {
    return this.contentService.getGradeById(id);
  }

  // Subjects
  @Post('subjects')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createSubject(@Body() createSubjectDto: CreateSubjectDto) {
    return this.contentService.createSubject(createSubjectDto);
  }

  @Get('grades/:gradeId/subjects')
  async getSubjectsByGrade(@Param('gradeId') gradeId: string) {
    return this.contentService.getSubjectsByGrade(gradeId);
  }

  // Chapters
  @Post('chapters')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createChapter(@Body() createChapterDto: CreateChapterDto) {
    return this.contentService.createChapter(createChapterDto);
  }

  @Get('subjects/:subjectId/chapters')
  async getChaptersBySubject(@Param('subjectId') subjectId: string) {
    return this.contentService.getChaptersBySubject(subjectId);
  }

  // Subchapters
  @Post('subchapters')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createSubchapter(@Body() createSubchapterDto: CreateSubchapterDto) {
    return this.contentService.createSubchapter(createSubchapterDto);
  }

  @Get('chapters/:chapterId/subchapters')
  async getSubchaptersByChapter(@Param('chapterId') chapterId: string) {
    return this.contentService.getSubchaptersByChapter(chapterId);
  }

  @Get('subchapters/:id')
  async getSubchapterById(@Param('id') id: string) {
    return this.contentService.getSubchapterById(id);
  }
}
