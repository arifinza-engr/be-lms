// src/content/content.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '@/database/database.service';
import { ContentRepository } from './repositories/content.repository';
import { TransactionService } from '@/common/services/transaction.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateSubchapterDto } from './dto/create-subchapter.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { UpdateSubchapterDto } from './dto/update-subchapter.dto';
import { grades, subjects, chapters, subchapters } from '@/database/schema';
import {
  ResourceNotFoundException,
  ValidationException,
} from '@/common/exceptions/domain.exceptions';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly contentRepository: ContentRepository,
    private readonly transactionService: TransactionService,
  ) {}

  // Grades
  async createGrade(createGradeDto: CreateGradeDto) {
    return this.transactionService.executeInTransaction(async (tx) => {
      const [grade] = await tx
        .insert(grades)
        .values(createGradeDto)
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateGradeCache();

      this.logger.log(`Created new grade: ${grade.title} (${grade.id})`);
      return grade;
    });
  }

  async getAllGrades() {
    return this.contentRepository.findAllGrades();
  }

  async getGradeById(id: string) {
    return this.contentRepository.findGradeById(id);
  }

  async updateGrade(id: string, updateGradeDto: UpdateGradeDto) {
    return this.transactionService.executeInTransaction(async (tx) => {
      // Check if grade exists
      await this.contentRepository.findGradeById(id);

      const [updatedGrade] = await tx
        .update(grades)
        .set({ ...updateGradeDto, updatedAt: new Date() })
        .where(eq(grades.id, id))
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateGradeCache();

      this.logger.log(
        `Updated grade: ${updatedGrade.title} (${updatedGrade.id})`,
      );
      return updatedGrade;
    });
  }

  async deleteGrade(id: string) {
    return this.transactionService.executeInTransaction(async (tx) => {
      // Check if grade exists
      await this.contentRepository.findGradeById(id);

      // Soft delete by setting isActive to false
      const [deletedGrade] = await tx
        .update(grades)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(grades.id, id))
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateGradeCache();

      this.logger.log(
        `Deleted grade: ${deletedGrade.title} (${deletedGrade.id})`,
      );
      return { message: 'Grade deleted successfully' };
    });
  }

  // Subjects
  async createSubject(createSubjectDto: CreateSubjectDto) {
    return this.transactionService.executeInTransaction(async (tx) => {
      // Validate grade exists
      await this.contentRepository.findGradeById(createSubjectDto.gradeId);

      const [subject] = await tx
        .insert(subjects)
        .values(createSubjectDto)
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateSubjectCache(
        undefined,
        createSubjectDto.gradeId,
      );

      this.logger.log(`Created new subject: ${subject.title} (${subject.id})`);
      return subject;
    });
  }

  async getSubjectsByGrade(gradeId: string) {
    return this.contentRepository.findSubjectsByGradeId(gradeId);
  }

  async getSubjectById(id: string) {
    return this.contentRepository.findSubjectById(id);
  }

  async updateSubject(id: string, updateSubjectDto: UpdateSubjectDto) {
    return this.transactionService.executeInTransaction(async (tx) => {
      // Check if subject exists
      await this.contentRepository.findSubjectById(id);

      // If gradeId is being updated, validate the new grade exists
      if (updateSubjectDto.gradeId) {
        await this.contentRepository.findGradeById(updateSubjectDto.gradeId);
      }

      const [updatedSubject] = await tx
        .update(subjects)
        .set({ ...updateSubjectDto, updatedAt: new Date() })
        .where(eq(subjects.id, id))
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateSubjectCache(id);

      this.logger.log(
        `Updated subject: ${updatedSubject.title} (${updatedSubject.id})`,
      );
      return updatedSubject;
    });
  }

  async deleteSubject(id: string) {
    return this.transactionService.executeInTransaction(async (tx) => {
      // Check if subject exists
      await this.contentRepository.findSubjectById(id);

      // Soft delete by setting isActive to false
      const [deletedSubject] = await tx
        .update(subjects)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(subjects.id, id))
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateSubjectCache(id);

      this.logger.log(
        `Deleted subject: ${deletedSubject.title} (${deletedSubject.id})`,
      );
      return { message: 'Subject deleted successfully' };
    });
  }

  // Chapters
  async createChapter(createChapterDto: CreateChapterDto) {
    return this.transactionService.executeInTransaction(async (tx) => {
      // Validate subject exists
      await this.contentRepository.findSubjectById(createChapterDto.subjectId);

      const [chapter] = await tx
        .insert(chapters)
        .values(createChapterDto)
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateChapterCache(
        undefined,
        createChapterDto.subjectId,
      );

      this.logger.log(`Created new chapter: ${chapter.title} (${chapter.id})`);
      return chapter;
    });
  }

  async getChaptersBySubject(subjectId: string) {
    return this.contentRepository.findChaptersBySubjectId(subjectId);
  }

  async getChapterById(id: string) {
    return this.contentRepository.findChapterById(id);
  }

  async updateChapter(id: string, updateChapterDto: UpdateChapterDto) {
    return this.transactionService.executeInTransaction(async (tx) => {
      // Check if chapter exists
      await this.contentRepository.findChapterById(id);

      // If subjectId is being updated, validate the new subject exists
      if (updateChapterDto.subjectId) {
        await this.contentRepository.findSubjectById(
          updateChapterDto.subjectId,
        );
      }

      const [updatedChapter] = await tx
        .update(chapters)
        .set({ ...updateChapterDto, updatedAt: new Date() })
        .where(eq(chapters.id, id))
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateChapterCache(id);

      this.logger.log(
        `Updated chapter: ${updatedChapter.title} (${updatedChapter.id})`,
      );
      return updatedChapter;
    });
  }

  async deleteChapter(id: string) {
    return this.transactionService.executeInTransaction(async (tx) => {
      // Check if chapter exists
      await this.contentRepository.findChapterById(id);

      // Soft delete by setting isActive to false
      const [deletedChapter] = await tx
        .update(chapters)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(chapters.id, id))
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateChapterCache(id);

      this.logger.log(
        `Deleted chapter: ${deletedChapter.title} (${deletedChapter.id})`,
      );
      return { message: 'Chapter deleted successfully' };
    });
  }

  // Subchapters
  async createSubchapter(createSubchapterDto: CreateSubchapterDto) {
    return this.transactionService.executeInTransaction(async (tx) => {
      // Validate chapter exists
      await this.contentRepository.findChapterById(
        createSubchapterDto.chapterId,
      );

      const [subchapter] = await tx
        .insert(subchapters)
        .values(createSubchapterDto)
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateSubchapterCache(
        undefined,
        createSubchapterDto.chapterId,
      );

      this.logger.log(
        `Created new subchapter: ${subchapter.title} (${subchapter.id})`,
      );
      return subchapter;
    });
  }

  async getSubchaptersByChapter(chapterId: string) {
    return this.contentRepository.findSubchaptersByChapterId(chapterId);
  }

  async getSubchapterById(id: string) {
    return this.contentRepository.findSubchapterById(id);
  }

  async updateSubchapter(id: string, updateSubchapterDto: UpdateSubchapterDto) {
    return this.transactionService.executeInTransaction(async (tx) => {
      // Check if subchapter exists
      await this.contentRepository.findSubchapterById(id);

      // If chapterId is being updated, validate the new chapter exists
      if (updateSubchapterDto.chapterId) {
        await this.contentRepository.findChapterById(
          updateSubchapterDto.chapterId,
        );
      }

      const [updatedSubchapter] = await tx
        .update(subchapters)
        .set({ ...updateSubchapterDto, updatedAt: new Date() })
        .where(eq(subchapters.id, id))
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateSubchapterCache(id);

      this.logger.log(
        `Updated subchapter: ${updatedSubchapter.title} (${updatedSubchapter.id})`,
      );
      return updatedSubchapter;
    });
  }

  async deleteSubchapter(id: string) {
    return this.transactionService.executeInTransaction(async (tx) => {
      // Check if subchapter exists
      await this.contentRepository.findSubchapterById(id);

      // Soft delete by setting isActive to false
      const [deletedSubchapter] = await tx
        .update(subchapters)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(subchapters.id, id))
        .returning();

      // Invalidate cache
      await this.contentRepository.invalidateSubchapterCache(id);

      this.logger.log(
        `Deleted subchapter: ${deletedSubchapter.title} (${deletedSubchapter.id})`,
      );
      return { message: 'Subchapter deleted successfully' };
    });
  }
}
