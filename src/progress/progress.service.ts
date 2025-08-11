// src/progress/progress.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../config/database.config';
import { eq, and, count } from 'drizzle-orm';
import { userProgress, subchapters } from '@/database/schema'; // pastikan schema ini sesuai

@Injectable()
export class ProgressService {
  constructor(private readonly database: DatabaseService) {}

  async getUserProgress(userId: string, gradeId?: string) {
    const progressList = await this.database.db.query.userProgress.findMany({
      where: eq(userProgress.userId, userId),
      with: {
        subchapter: {
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
        },
      },
      orderBy: (userProgress, { desc }) => [desc(userProgress.updatedAt)],
    });

    // Jika gradeId disediakan, filter manual karena Drizzle belum support nested where
    if (gradeId) {
      return progressList.filter(
        (p) => p.subchapter.chapter.subject.gradeId === gradeId,
      );
    }

    return progressList;
  }

  async getProgressSummary(userId: string) {
    // Get total subchapters
    const [{ count: totalSubchapters }] = await this.database.db
      .select({ count: count() })
      .from(subchapters);

    // Get user progress counts grouped by status
    const progressCounts = await this.database.db
      .select({
        status: userProgress.status,
        count: count(),
      })
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .groupBy(userProgress.status);

    const summary = {
      total: totalSubchapters,
      notStarted: totalSubchapters,
      inProgress: 0,
      completed: 0,
    };

    for (const item of progressCounts) {
      if (item.status === 'IN_PROGRESS') {
        summary.inProgress = item.count;
        summary.notStarted -= item.count;
      } else if (item.status === 'COMPLETED') {
        summary.completed = item.count;
        summary.notStarted -= item.count;
      }
    }

    const completionPercentage =
      totalSubchapters > 0
        ? Math.round((summary.completed / totalSubchapters) * 100)
        : 0;

    return {
      ...summary,
      completionPercentage,
    };
  }

  async getSubjectProgress(userId: string, subjectId: string) {
    // Ambil semua subchapter dan progress milik user berdasarkan subjectId
    const subchaptersList = await this.database.db.query.subchapters.findMany({
      with: {
        chapter: true,
        progress: {
          where: eq(userProgress.userId, userId),
        },
      },
    });

    // Filter manual berdasarkan subjectId karena Drizzle tidak support nested where di sub-relation
    const filtered = subchaptersList.filter(
      (s) => s.chapter.subjectId === subjectId,
    );

    return filtered.map((subchapter) => ({
      id: subchapter.id,
      title: subchapter.title,
      chapterTitle: subchapter.chapter.title,
      status: subchapter.progress[0]?.status || 'NOT_STARTED',
      completedAt: subchapter.progress[0]?.completedAt || null,
    }));
  }
}
