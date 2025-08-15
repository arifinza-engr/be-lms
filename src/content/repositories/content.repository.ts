// src/content/repositories/content.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { RedisService } from '@/common/services/redis.service';
import { grades, subjects, chapters, subchapters } from '@/database/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import {
  ResourceNotFoundException,
  DatabaseException,
} from '@/common/exceptions/domain.exceptions';

@Injectable()
export class ContentRepository {
  private readonly logger = new Logger(ContentRepository.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  // Grades
  async findAllGrades() {
    const cacheKey = 'content:grades:all';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.database.db
        .select()
        .from(grades)
        .orderBy(asc(grades.title));

      await this.redis.set(cacheKey, result, 3600); // 1 hour
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch grades', error.stack);
      throw new DatabaseException('Failed to fetch grades');
    }
  }

  async findGradeById(id: string) {
    const cacheKey = `content:grade:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const [grade] = await this.database.db
        .select()
        .from(grades)
        .where(eq(grades.id, id))
        .limit(1);

      if (!grade) {
        throw new ResourceNotFoundException('Grade', id);
      }

      await this.redis.set(cacheKey, grade, 3600); // 1 hour
      return grade;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch grade ${id}`, error.stack);
      throw new DatabaseException('Failed to fetch grade');
    }
  }

  // Subjects
  async findSubjectsByGradeId(gradeId: string) {
    const cacheKey = `content:subjects:grade:${gradeId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.database.db.query.subjects.findMany({
        where: eq(subjects.gradeId, gradeId),
        with: {
          grade: true,
        },
        orderBy: [asc(subjects.title)],
      });

      await this.redis.set(cacheKey, result, 3600); // 1 hour
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch subjects for grade ${gradeId}`,
        error.stack,
      );
      throw new DatabaseException('Failed to fetch subjects');
    }
  }

  async findSubjectById(id: string) {
    const cacheKey = `content:subject:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const subject = await this.database.db.query.subjects.findFirst({
        where: eq(subjects.id, id),
        with: {
          grade: true,
        },
      });

      if (!subject) {
        throw new ResourceNotFoundException('Subject', id);
      }

      await this.redis.set(cacheKey, subject, 3600); // 1 hour
      return subject;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch subject ${id}`, error.stack);
      throw new DatabaseException('Failed to fetch subject');
    }
  }

  // Chapters
  async findChaptersBySubjectId(subjectId: string) {
    const cacheKey = `content:chapters:subject:${subjectId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.database.db.query.chapters.findMany({
        where: eq(chapters.subjectId, subjectId),
        with: {
          subject: {
            with: {
              grade: true,
            },
          },
        },
        orderBy: [asc(chapters.order), asc(chapters.title)],
      });

      await this.redis.set(cacheKey, result, 3600); // 1 hour
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch chapters for subject ${subjectId}`,
        error.stack,
      );
      throw new DatabaseException('Failed to fetch chapters');
    }
  }

  async findChapterById(id: string) {
    const cacheKey = `content:chapter:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const chapter = await this.database.db.query.chapters.findFirst({
        where: eq(chapters.id, id),
        with: {
          subject: {
            with: {
              grade: true,
            },
          },
        },
      });

      if (!chapter) {
        throw new ResourceNotFoundException('Chapter', id);
      }

      await this.redis.set(cacheKey, chapter, 3600); // 1 hour
      return chapter;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch chapter ${id}`, error.stack);
      throw new DatabaseException('Failed to fetch chapter');
    }
  }

  // Subchapters
  async findSubchaptersByChapterId(chapterId: string) {
    const cacheKey = `content:subchapters:chapter:${chapterId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.database.db.query.subchapters.findMany({
        where: eq(subchapters.chapterId, chapterId),
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
        orderBy: [asc(subchapters.order), asc(subchapters.title)],
      });

      await this.redis.set(cacheKey, result, 3600); // 1 hour
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch subchapters for chapter ${chapterId}`,
        error.stack,
      );
      throw new DatabaseException('Failed to fetch subchapters');
    }
  }

  async findSubchapterById(id: string) {
    const cacheKey = `content:subchapter:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
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
        throw new ResourceNotFoundException('Subchapter', id);
      }

      await this.redis.set(cacheKey, subchapter, 3600); // 1 hour
      return subchapter;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch subchapter ${id}`, error.stack);
      throw new DatabaseException('Failed to fetch subchapter');
    }
  }

  // Cache invalidation methods
  async invalidateGradeCache(gradeId?: string) {
    const keys = ['content:grades:all'];

    if (gradeId) {
      keys.push(`content:grade:${gradeId}`);
      keys.push(`content:subjects:grade:${gradeId}`);
    }

    await Promise.all(keys.map((key) => this.redis.del(key)));
  }

  async invalidateSubjectCache(subjectId?: string, gradeId?: string) {
    const keys = [];

    if (gradeId) {
      keys.push(`content:subjects:grade:${gradeId}`);
    }

    if (subjectId) {
      keys.push(`content:subject:${subjectId}`);
      keys.push(`content:chapters:subject:${subjectId}`);
    }

    await Promise.all(keys.map((key) => this.redis.del(key)));
  }

  async invalidateChapterCache(chapterId?: string, subjectId?: string) {
    const keys = [];

    if (subjectId) {
      keys.push(`content:chapters:subject:${subjectId}`);
    }

    if (chapterId) {
      keys.push(`content:chapter:${chapterId}`);
      keys.push(`content:subchapters:chapter:${chapterId}`);
    }

    await Promise.all(keys.map((key) => this.redis.del(key)));
  }

  async invalidateSubchapterCache(subchapterId?: string, chapterId?: string) {
    const keys = [];

    if (chapterId) {
      keys.push(`content:subchapters:chapter:${chapterId}`);
    }

    if (subchapterId) {
      keys.push(`content:subchapter:${subchapterId}`);
    }

    await Promise.all(keys.map((key) => this.redis.del(key)));
  }
}
