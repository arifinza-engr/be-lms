// src/unreal/unreal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../config/database.config';
import { and, eq } from 'drizzle-orm';
import {
  aiGeneratedContent,
  aiChatLogs,
  metahumanSessions,
  subchapters,
} from '@/database/schema';

@Injectable()
export class UnrealService {
  constructor(private readonly database: DatabaseService) {}

  async getMetahumanSessionData(subchapterId: string, userId: string) {
    const aiContent = await this.database.db.query.aiGeneratedContent.findFirst(
      {
        where: and(
          eq(aiGeneratedContent.subchapterId, subchapterId),
          eq(aiGeneratedContent.isInitial, true),
        ),
      },
    );

    if (!aiContent) {
      throw new NotFoundException('No AI content found for this subchapter');
    }

    const chatHistory = await this.database.db.query.aiChatLogs.findMany({
      where: and(
        eq(aiChatLogs.userId, userId),
        eq(aiChatLogs.subchapterId, subchapterId),
      ),
      orderBy: (aiChatLogs, { desc }) => [desc(aiChatLogs.createdAt)],
      limit: 5,
    });

    const subchapter = await this.database.db.query.subchapters.findFirst({
      where: eq(subchapters.id, subchapterId),
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

    const sessionData = {
      subchapter: {
        id: subchapter.id,
        title: subchapter.title,
        subject: subchapter.chapter.subject.title,
        grade: subchapter.chapter.subject.grade.title,
      },
      content: {
        text: aiContent.content,
        audioUrl: aiContent.audioUrl,
      },
      character: {
        name: 'AI Teacher',
        expression: 'friendly',
        animation: 'explaining',
      },
      chatHistory: chatHistory.map((chat) => ({
        type: chat.messageType.toLowerCase(),
        message: chat.message,
        audioUrl: chat.audioUrl,
        timestamp: chat.createdAt,
      })),
      metadata: {
        sessionId: `${userId}-${subchapterId}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        duration: this.estimateContentDuration(aiContent.content),
      },
    };

    await this.database.db.insert(metahumanSessions).values({
      userId,
      subchapterId,
      sessionData,
    });

    return sessionData;
  }

  async updateSessionDuration(sessionId: string, duration: number) {
    const [userId, subchapterId] = sessionId.split('-');

    await this.database.db
      .update(metahumanSessions)
      .set({
        duration,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(metahumanSessions.userId, userId),
          eq(metahumanSessions.subchapterId, subchapterId),
        ),
      );
  }

  async getSessionHistory(userId: string, subchapterId?: string) {
    return this.database.db.query.metahumanSessions.findMany({
      where: subchapterId
        ? and(
            eq(metahumanSessions.userId, userId),
            eq(metahumanSessions.subchapterId, subchapterId),
          )
        : eq(metahumanSessions.userId, userId),
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
      orderBy: (metahumanSessions, { desc }) => [
        desc(metahumanSessions.createdAt),
      ],
    });
  }

  private estimateContentDuration(content: string): number {
    const words = content.split(' ').length;
    const readingTimeMinutes = words / 200;
    return Math.ceil(readingTimeMinutes * 60 * 1.5);
  }
}
