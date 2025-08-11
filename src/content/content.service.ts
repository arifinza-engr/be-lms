// src/content/content.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../config/database.config';
import { CreateGradeDto } from './dto/create-grade.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateSubchapterDto } from './dto/create-subchapter.dto';
import { grades, subjects, chapters, subchapters } from '@/database/schema';

@Injectable()
export class ContentService {
  constructor(private readonly database: DatabaseService) {}

  // Grades
  async createGrade(createGradeDto: CreateGradeDto) {
    const [grade] = await this.database.db
      .insert(grades)
      .values(createGradeDto)
      .returning();
    return grade;
  }

  async getAllGrades() {
    return this.database.db.query.grades.findMany({
      with: {
        subjects: {
          with: {
            chapters: {
              with: {
                subchapters: true,
              },
            },
          },
        },
      },
    });
  }

  async getGradeById(id: string) {
    const grade = await this.database.db.query.grades.findFirst({
      where: eq(grades.id, id),
      with: {
        subjects: {
          with: {
            chapters: {
              with: {
                subchapters: true,
              },
            },
          },
        },
      },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    return grade;
  }

  // Subjects
  async createSubject(createSubjectDto: CreateSubjectDto) {
    const [subject] = await this.database.db
      .insert(subjects)
      .values(createSubjectDto)
      .returning();
    return subject;
  }

  async getSubjectsByGrade(gradeId: string) {
    return this.database.db.query.subjects.findMany({
      where: eq(subjects.gradeId, gradeId),
      with: {
        chapters: {
          with: {
            subchapters: true,
          },
        },
      },
    });
  }

  // Chapters
  async createChapter(createChapterDto: CreateChapterDto) {
    const [chapter] = await this.database.db
      .insert(chapters)
      .values(createChapterDto)
      .returning();
    return chapter;
  }

  async getChaptersBySubject(subjectId: string) {
    return this.database.db.query.chapters.findMany({
      where: eq(chapters.subjectId, subjectId),
      with: {
        subchapters: true,
      },
    });
  }

  // Subchapters
  async createSubchapter(createSubchapterDto: CreateSubchapterDto) {
    const [subchapter] = await this.database.db
      .insert(subchapters)
      .values(createSubchapterDto)
      .returning();
    return subchapter;
  }

  async getSubchaptersByChapter(chapterId: string) {
    return this.database.db.query.subchapters.findMany({
      where: eq(subchapters.chapterId, chapterId),
    });
  }

  async getSubchapterById(id: string) {
    const subchapter = await this.database.db.query.subchapters.findFirst({
      where: eq(subchapters.id, id),
      with: {
        chapter: {
          with: {
            subject: {
              with: {
                grade: true,
              },
            },
          },
        },
      },
    });

    if (!subchapter) {
      throw new NotFoundException('Subchapter not found');
    }

    return subchapter;
  }
}
