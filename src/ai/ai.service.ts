// src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../config/database.config';
import { OpenaiService } from './services/openai.service';
import { ElevenlabsService } from './services/elevenlabs.service';
import { ContentService } from '../content/content.service';
import { and, eq } from 'drizzle-orm';
import {
  aiGeneratedContent,
  aiChatLogs,
  userProgress,
} from '@/database/schema';

export enum MessageType {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  AI = 'AI',
}

@Injectable()
export class AiService {
  constructor(
    private readonly database: DatabaseService,
    private readonly openaiService: OpenaiService,
    private readonly elevenlabsService: ElevenlabsService,
    private readonly contentService: ContentService,
  ) {}

  async getOrGenerateSubchapterContent(subchapterId: string, userId: string) {
    const existingContent =
      await this.database.db.query.aiGeneratedContent.findFirst({
        where: and(
          eq(aiGeneratedContent.subchapterId, subchapterId),
          eq(aiGeneratedContent.isInitial, true),
        ),
      });

    if (existingContent) {
      await this.updateUserProgress(userId, subchapterId, 'IN_PROGRESS');
      return existingContent;
    }

    const subchapter =
      await this.contentService.getSubchapterById(subchapterId);

    const prompt = `Buatkan materi pembelajaran untuk topik "${subchapter.title}" 
dalam mata pelajaran ${subchapter.chapter.subject.title} 
kelas ${subchapter.chapter.subject.grade.title}.

Berikan penjelasan yang mudah dipahami, komprehensif, dan menarik untuk siswa.
Format dalam bahasa Indonesia yang baik dan benar.`;

    const gptResponse = await this.openaiService.generateContent(prompt);
    const audioUrl = await this.elevenlabsService.generateAudio(gptResponse);

    const [newContent] = await this.database.db
      .insert(aiGeneratedContent)
      .values({
        subchapterId,
        content: gptResponse,
        audioUrl,
        isInitial: true,
      })
      .returning();

    await this.database.db.insert(aiChatLogs).values({
      userId,
      subchapterId,
      message: gptResponse,
      messageType: MessageType.AI,
      audioUrl,
    });

    await this.updateUserProgress(userId, subchapterId, 'IN_PROGRESS');

    return newContent;
  }

  async handleUserQuestion(
    userId: string,
    subchapterId: string,
    question: string,
  ) {
    await this.database.db.insert(aiChatLogs).values({
      userId,
      subchapterId,
      message: question,
      messageType: MessageType.USER,
    });

    const subchapter =
      await this.contentService.getSubchapterById(subchapterId);

    const previousMessages = await this.database.db.query.aiChatLogs.findMany({
      where: and(
        eq(aiChatLogs.userId, userId),
        eq(aiChatLogs.subchapterId, subchapterId),
      ),
      orderBy: (aiChatLogs, { asc }) => [asc(aiChatLogs.createdAt)],
      limit: 10,
    });

    const conversationContext = previousMessages
      .map((msg) => `${msg.messageType}: ${msg.message}`)
      .join('\n');

    const prompt = `Konteks pembelajaran: ${subchapter.title} - ${subchapter.chapter.subject.title} kelas ${subchapter.chapter.subject.grade.title}

Percakapan sebelumnya:
${conversationContext}

Pertanyaan siswa: ${question}

Jawab pertanyaan siswa dengan penjelasan yang jelas, mudah dipahami, dan relevan dengan materi pembelajaran. Gunakan bahasa Indonesia yang baik dan benar.`;

    const aiResponse = await this.openaiService.generateContent(prompt);
    const audioUrl = await this.elevenlabsService.generateAudio(aiResponse);

    const [chatLog] = await this.database.db
      .insert(aiChatLogs)
      .values({
        userId,
        subchapterId,
        message: aiResponse,
        messageType: MessageType.AI,
        audioUrl,
      })
      .returning();

    return chatLog;
  }

  async getChatHistory(userId: string, subchapterId: string) {
    return this.database.db.query.aiChatLogs.findMany({
      where: and(
        eq(aiChatLogs.userId, userId),
        eq(aiChatLogs.subchapterId, subchapterId),
      ),
      orderBy: (aiChatLogs, { asc }) => [asc(aiChatLogs.createdAt)],
    });
  }

  private async updateUserProgress(
    userId: string,
    subchapterId: string,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
  ) {
    const existingProgress =
      await this.database.db.query.userProgress.findFirst({
        where: and(
          eq(userProgress.userId, userId),
          eq(userProgress.subchapterId, subchapterId),
        ),
      });

    if (existingProgress) {
      await this.database.db
        .update(userProgress)
        .set({
          status,
          ...(status === 'COMPLETED' && { completedAt: new Date() }),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.subchapterId, subchapterId),
          ),
        );
    } else {
      await this.database.db.insert(userProgress).values({
        userId,
        subchapterId,
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      });
    }
  }
}
