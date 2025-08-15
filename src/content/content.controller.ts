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
} from '@nestjs/common';
import { ContentService } from './content.service';
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Content Management')
@ApiBearerAuth('JWT-auth')
@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // Grades
  @ApiOperation({ summary: 'Create a new grade' })
  @ApiResponse({ status: 201, description: 'Grade created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Post('grades')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createGrade(@Body() createGradeDto: CreateGradeDto) {
    return this.contentService.createGrade(createGradeDto);
  }

  @ApiOperation({ summary: 'Get all grades' })
  @ApiResponse({ status: 200, description: 'List of all grades' })
  @Get('grades')
  async getAllGrades() {
    return this.contentService.getAllGrades();
  }

  @ApiOperation({ summary: 'Get grade by ID' })
  @ApiResponse({ status: 200, description: 'Grade details' })
  @ApiResponse({ status: 404, description: 'Grade not found' })
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
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'Subject created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Post('subjects')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createSubject(@Body() createSubjectDto: CreateSubjectDto) {
    return this.contentService.createSubject(createSubjectDto);
  }

  @ApiOperation({ summary: 'Get subjects by grade' })
  @ApiResponse({ status: 200, description: 'List of subjects for the grade' })
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
}
