// src/ai/ai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { RedisService } from '@/common/services/redis.service';
import { OpenaiService } from './services/openai.service';
import { ElevenlabsService } from './services/elevenlabs.service';
import { AICacheService } from './services/ai-cache.service';
import { ContentService } from '../content/content.service';
import { TransactionService } from '@/common/services/transaction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AIContentGeneratedEvent,
  AIChatMessageEvent,
  AIErrorEvent,
  AICacheHitEvent,
  AICacheMissEvent,
} from '@/common/events/ai.events';
import { and, eq } from 'drizzle-orm';
import {
  aiGeneratedContent,
  aiChatLogs,
  userProgress,
  subchapters,
  chapters,
  subjects,
  grades,
} from '@/database/schema';
import { ExternalServiceException } from '@/common/exceptions/domain.exceptions';
import { InferSelectModel } from 'drizzle-orm';

export enum MessageType {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  AI = 'AI',
}

// Tipe untuk subchapter + relasi lengkap
type SubchapterWithRelations = InferSelectModel<typeof subchapters> & {
  chapter: InferSelectModel<typeof chapters> & {
    subject: InferSelectModel<typeof subjects> & {
      grade: InferSelectModel<typeof grades>;
    };
  };
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly redis: RedisService,
    private readonly openaiService: OpenaiService,
    private readonly elevenlabsService: ElevenlabsService,
    private readonly aiCacheService: AICacheService,
    private readonly contentService: ContentService,
    private readonly transactionService: TransactionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getOrGenerateSubchapterContent(subchapterId: string, userId: string) {
    // Check cache first
    const cachedContent =
      await this.aiCacheService.getCachedSubchapterContent(subchapterId);

    if (cachedContent) {
      this.eventEmitter.emit(
        'ai.cache_hit',
        new AICacheHitEvent(
          'content',
          `content:${subchapterId}`,
          userId,
          subchapterId,
        ),
      );

      await this.updateUserProgress(userId, subchapterId, 'IN_PROGRESS');
      return {
        content: cachedContent.content,
        metadata: cachedContent.metadata,
        fromCache: true,
      };
    }

    const existingContent =
      await this.database.db.query.aiGeneratedContent.findFirst({
        where: and(
          eq(aiGeneratedContent.subchapterId, subchapterId),
          eq(aiGeneratedContent.isInitial, true),
        ),
      });

    if (existingContent) {
      await this.aiCacheService.cacheSubchapterContent(
        subchapterId,
        existingContent.content,
        {
          audioUrl: existingContent.audioUrl,
          isInitial: existingContent.isInitial,
        },
      );
      await this.updateUserProgress(userId, subchapterId, 'IN_PROGRESS');
      return {
        content: existingContent.content,
        audioUrl: existingContent.audioUrl,
        fromCache: false,
        fromDatabase: true,
      };
    }

    this.eventEmitter.emit(
      'ai.cache_miss',
      new AICacheMissEvent(
        'content',
        `content:${subchapterId}`,
        userId,
        subchapterId,
      ),
    );

    try {
      const startTime = Date.now();

      const subchapter = (await this.contentService.getSubchapterById(
        subchapterId,
      )) as SubchapterWithRelations;

      const prompt = `Buatkan materi pembelajaran untuk topik "${subchapter.title}" 
dalam mata pelajaran ${subchapter.chapter.subject.title} 
kelas ${subchapter.chapter.subject.grade.title}.

Berikan penjelasan yang mudah dipahami, komprehensif, dan menarik untuk siswa.
Format dalam bahasa Indonesia yang baik dan benar.`;

      const gptResponse = await this.openaiService.generateContent(prompt);
      const audioUrl = await this.elevenlabsService.generateAudio(gptResponse);
      const generationTime = Date.now() - startTime;

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

      await this.aiCacheService.cacheSubchapterContent(
        subchapterId,
        gptResponse,
        {
          audioUrl,
          isInitial: true,
          tokens: gptResponse.length,
        },
      );

      await this.updateUserProgress(userId, subchapterId, 'IN_PROGRESS');

      this.eventEmitter.emit(
        'ai.content_generated',
        new AIContentGeneratedEvent(
          subchapterId,
          userId,
          gptResponse.length,
          'gpt-3.5-turbo',
          gptResponse.length,
          generationTime,
        ),
      );

      this.logger.log(
        `Generated new AI content for subchapter: ${subchapterId}`,
      );
      return {
        content: gptResponse,
        audioUrl,
        fromCache: false,
        fromDatabase: false,
        generated: true,
      };
    } catch (error) {
      this.eventEmitter.emit(
        'ai.error',
        new AIErrorEvent(
          'openai',
          'content_generation',
          error.message,
          userId,
          subchapterId,
        ),
      );

      this.logger.error(
        `Failed to generate AI content for subchapter ${subchapterId}`,
        error.stack,
      );
      throw new ExternalServiceException(
        'AI Content Generation',
        error.message,
      );
    }
  }

  async handleUserQuestion(
    userId: string,
    subchapterId: string,
    question: string,
  ) {
    try {
      const cachedResponse = await this.aiCacheService.getCachedChatResponse(
        userId,
        subchapterId,
        question,
      );

      if (cachedResponse) {
        this.eventEmitter.emit(
          'ai.cache_hit',
          new AICacheHitEvent(
            'chat',
            `chat:${userId}:${subchapterId}`,
            userId,
            subchapterId,
          ),
        );

        this.logger.log(
          `Using cached response for similar question in subchapter: ${subchapterId}`,
        );
        return {
          response: cachedResponse.content,
          metadata: cachedResponse.metadata,
          fromCache: true,
        };
      }

      await this.database.db.insert(aiChatLogs).values({
        userId,
        subchapterId,
        message: question,
        messageType: MessageType.USER,
      });

      const subchapter = (await this.contentService.getSubchapterById(
        subchapterId,
      )) as SubchapterWithRelations;

      const previousMessages = await this.database.db.query.aiChatLogs.findMany(
        {
          where: and(
            eq(aiChatLogs.userId, userId),
            eq(aiChatLogs.subchapterId, subchapterId),
          ),
          orderBy: (aiChatLogs, { asc }) => [asc(aiChatLogs.createdAt)],
          limit: 10,
        },
      );

      const conversationContext = previousMessages
        .map((msg) => `${msg.messageType}: ${msg.message}`)
        .join('\n');

      const prompt = `Konteks pembelajaran: ${subchapter.title} - ${subchapter.chapter.subject.title} kelas ${subchapter.chapter.subject.grade.title}

Percakapan sebelumnya:
${conversationContext}

Pertanyaan siswa: ${question}

Jawab pertanyaan siswa dengan penjelasan yang jelas, mudah dipahami, dan relevan dengan materi pembelajaran. Gunakan bahasa Indonesia yang baik dan benar.`;

      this.eventEmitter.emit(
        'ai.cache_miss',
        new AICacheMissEvent(
          'chat',
          `chat:${userId}:${subchapterId}`,
          userId,
          subchapterId,
        ),
      );

      const startTime = Date.now();
      const aiResponse = await this.openaiService.generateContent(prompt);
      const audioUrl = await this.elevenlabsService.generateAudio(aiResponse);
      const responseTime = Date.now() - startTime;

      await this.database.db.insert(aiChatLogs).values({
        userId,
        subchapterId,
        message: aiResponse,
        messageType: MessageType.AI,
        audioUrl,
      });

      await this.aiCacheService.cacheChatResponse(
        userId,
        subchapterId,
        question,
        aiResponse,
        {
          audioUrl,
          tokens: aiResponse.length,
        },
      );

      this.eventEmitter.emit(
        'ai.chat_message',
        new AIChatMessageEvent(
          userId,
          subchapterId,
          question,
          aiResponse,
          'gpt-3.5-turbo',
          aiResponse.length,
          responseTime,
        ),
      );

      this.logger.log(
        `Generated AI response for user question in subchapter: ${subchapterId}`,
      );
      return {
        response: aiResponse,
        audioUrl,
        fromCache: false,
        generated: true,
      };
    } catch (error) {
      this.eventEmitter.emit(
        'ai.error',
        new AIErrorEvent(
          'openai',
          'chat_response',
          error.message,
          userId,
          subchapterId,
        ),
      );

      this.logger.error(
        `Failed to handle user question for subchapter ${subchapterId}`,
        error.stack,
      );
      throw new ExternalServiceException('AI Question Handling', error.message);
    }
  }

  async getChatHistory(userId: string, subchapterId: string) {
    const cacheKey = `ai:chat:${userId}:${subchapterId}`;
    const cachedHistory = await this.redis.get(cacheKey);

    if (cachedHistory) {
      return cachedHistory;
    }

    const history = await this.database.db.query.aiChatLogs.findMany({
      where: and(
        eq(aiChatLogs.userId, userId),
        eq(aiChatLogs.subchapterId, subchapterId),
      ),
      orderBy: (aiChatLogs, { asc }) => [asc(aiChatLogs.createdAt)],
    });

    await this.redis.set(cacheKey, history, 300);

    return history;
  }

  private generateQuestionHash(question: string): string {
    const normalized = question
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '');
    const words = normalized.split(/\s+/).sort();
    const key = words.slice(0, 5).join('');
    return Buffer.from(key).toString('base64').slice(0, 10);
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
