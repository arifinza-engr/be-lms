// src/common/listeners/ai.listeners.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AIContentGeneratedEvent,
  AIChatMessageEvent,
  AIQuizGeneratedEvent,
  AIAudioGeneratedEvent,
  AIErrorEvent,
  AIUsageThresholdEvent,
  AICacheHitEvent,
  AICacheMissEvent,
} from '@/common/events/ai.events';
import { RedisService } from '@/common/services/redis.service';

@Injectable()
export class AIEventListeners {
  private readonly logger = new Logger(AIEventListeners.name);

  constructor(private readonly redis: RedisService) {}

  @OnEvent('ai.content_generated')
  async handleContentGenerated(event: AIContentGeneratedEvent) {
    this.logger.log(
      `AI content generated for subchapter: ${event.subchapterId} by user: ${event.userId}`,
    );

    try {
      // Track content generation metrics
      await this.redis.increment('metrics:ai:content_generated:total');
      await this.redis.increment(
        `metrics:ai:content_generated:daily:${this.getDateKey()}`,
      );
      await this.redis.increment(
        `metrics:ai:model:${event.model}:content_generated`,
      );

      // Track token usage
      await this.redis.increment('metrics:ai:tokens:total', event.tokensUsed);
      await this.redis.increment(
        `metrics:ai:tokens:daily:${this.getDateKey()}`,
        event.tokensUsed,
      );
      await this.redis.increment(
        `metrics:ai:tokens:user:${event.userId}`,
        event.tokensUsed,
      );

      // Track generation time metrics
      await this.redis.lpush(
        'metrics:ai:generation_times:content',
        event.generationTime,
      );
      await this.redis.ltrim('metrics:ai:generation_times:content', 0, 999); // Keep last 1000

      // Track user AI usage
      await this.redis.increment(
        `user:ai_usage:${event.userId}:content_generated`,
      );
      await this.redis.increment(
        `user:ai_usage:${event.userId}:tokens_used`,
        event.tokensUsed,
      );

      // Store content metadata for analytics
      await this.redis.set(
        `ai:content:metadata:${event.subchapterId}`,
        {
          generatedAt: event.timestamp,
          userId: event.userId,
          model: event.model,
          tokensUsed: event.tokensUsed,
          contentLength: event.contentLength,
          generationTime: event.generationTime,
        },
        3600 * 24 * 30, // 30 days
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle AI content generated event: ${error.message}`,
      );
    }
  }

  @OnEvent('ai.chat_message')
  async handleChatMessage(event: AIChatMessageEvent) {
    this.logger.debug(
      `AI chat message for user: ${event.userId}, subchapter: ${event.subchapterId}`,
    );

    try {
      // Track chat metrics
      await this.redis.increment('metrics:ai:chat_messages:total');
      await this.redis.increment(
        `metrics:ai:chat_messages:daily:${this.getDateKey()}`,
      );
      await this.redis.increment(
        `metrics:ai:model:${event.model}:chat_messages`,
      );

      // Track token usage
      await this.redis.increment('metrics:ai:tokens:total', event.tokensUsed);
      await this.redis.increment(
        `metrics:ai:tokens:chat:daily:${this.getDateKey()}`,
        event.tokensUsed,
      );
      await this.redis.increment(
        `metrics:ai:tokens:user:${event.userId}`,
        event.tokensUsed,
      );

      // Track response time metrics
      await this.redis.lpush(
        'metrics:ai:response_times:chat',
        event.responseTime,
      );
      await this.redis.ltrim('metrics:ai:response_times:chat', 0, 999); // Keep last 1000

      // Track user chat activity
      await this.redis.increment(`user:ai_usage:${event.userId}:chat_messages`);
      await this.redis.sadd(
        `users:ai_chat_active:${this.getDateKey()}`,
        event.userId,
      );
      await this.redis.expire(
        `users:ai_chat_active:${this.getDateKey()}`,
        3600 * 24,
      );

      // Track popular subchapters for AI chat
      await this.redis.zincrby(
        'metrics:ai:popular_subchapters:chat',
        1,
        event.subchapterId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle AI chat message event: ${error.message}`,
      );
    }
  }

  @OnEvent('ai.quiz_generated')
  async handleQuizGenerated(event: AIQuizGeneratedEvent) {
    this.logger.log(
      `AI quiz generated for subchapter: ${event.subchapterId}, difficulty: ${event.difficulty}`,
    );

    try {
      // Track quiz generation metrics
      await this.redis.increment('metrics:ai:quizzes_generated:total');
      await this.redis.increment(
        `metrics:ai:quizzes_generated:daily:${this.getDateKey()}`,
      );
      await this.redis.increment(
        `metrics:ai:quizzes_generated:difficulty:${event.difficulty}`,
      );

      // Track token usage
      await this.redis.increment('metrics:ai:tokens:total', event.tokensUsed);
      await this.redis.increment(
        `metrics:ai:tokens:quiz:daily:${this.getDateKey()}`,
        event.tokensUsed,
      );

      // Track user quiz generation
      await this.redis.increment(
        `user:ai_usage:${event.userId}:quizzes_generated`,
      );

      // Track popular subchapters for quiz generation
      await this.redis.zincrby(
        'metrics:ai:popular_subchapters:quiz',
        1,
        event.subchapterId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle AI quiz generated event: ${error.message}`,
      );
    }
  }

  @OnEvent('ai.audio_generated')
  async handleAudioGenerated(event: AIAudioGeneratedEvent) {
    this.logger.log(`AI audio generated for content: ${event.contentId}`);

    try {
      // Track audio generation metrics
      await this.redis.increment('metrics:ai:audio_generated:total');
      await this.redis.increment(
        `metrics:ai:audio_generated:daily:${this.getDateKey()}`,
      );
      await this.redis.increment(
        `metrics:ai:audio_generated:service:${event.service}`,
      );

      // Track audio length metrics
      await this.redis.lpush('metrics:ai:audio_lengths', event.audioLength);
      await this.redis.ltrim('metrics:ai:audio_lengths', 0, 999); // Keep last 1000

      // Store audio metadata
      await this.redis.set(
        `ai:audio:metadata:${event.contentId}`,
        {
          audioUrl: event.audioUrl,
          textLength: event.textLength,
          audioLength: event.audioLength,
          service: event.service,
          generatedAt: event.timestamp,
        },
        3600 * 24 * 30, // 30 days
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle AI audio generated event: ${error.message}`,
      );
    }
  }

  @OnEvent('ai.error')
  async handleAIError(event: AIErrorEvent) {
    this.logger.error(
      `AI service error - Service: ${event.service}, Operation: ${event.operation}, Error: ${event.error}`,
    );

    try {
      // Track error metrics
      await this.redis.increment('metrics:ai:errors:total');
      await this.redis.increment(
        `metrics:ai:errors:daily:${this.getDateKey()}`,
      );
      await this.redis.increment(`metrics:ai:errors:service:${event.service}`);
      await this.redis.increment(
        `metrics:ai:errors:operation:${event.operation}`,
      );

      // Store recent errors for monitoring
      await this.redis.lpush('ai:recent_errors', {
        service: event.service,
        operation: event.operation,
        error: event.error,
        userId: event.userId,
        subchapterId: event.subchapterId,
        timestamp: event.timestamp,
      });
      await this.redis.ltrim('ai:recent_errors', 0, 99); // Keep last 100 errors

      // Alert if error rate is high
      const errorCount = await this.redis.get(
        `metrics:ai:errors:daily:${this.getDateKey()}`,
      );
      if (errorCount && parseInt(errorCount as string) > 50) {
        // Threshold: 50 errors per day
        this.logger.warn(
          `High AI error rate detected: ${errorCount} errors today`,
        );
        // Could trigger alert to monitoring system
      }
    } catch (error) {
      this.logger.error(`Failed to handle AI error event: ${error.message}`);
    }
  }

  @OnEvent('ai.usage_threshold')
  async handleUsageThreshold(event: AIUsageThresholdEvent) {
    this.logger.warn(
      `AI usage threshold reached - User: ${event.userId}, Type: ${event.usageType}, Usage: ${event.currentUsage}/${event.threshold}`,
    );

    try {
      // Track threshold events
      await this.redis.increment('metrics:ai:threshold_events:total');
      await this.redis.increment(
        `metrics:ai:threshold_events:type:${event.usageType}`,
      );

      // Store threshold event for user
      await this.redis.set(
        `user:ai_threshold:${event.userId}:${event.usageType}`,
        {
          currentUsage: event.currentUsage,
          threshold: event.threshold,
          period: event.period,
          timestamp: event.timestamp,
        },
        3600 * 24, // 24 hours
      );

      // Could trigger notification to user or admin
      this.logger.debug(
        `Usage threshold notification queued for user: ${event.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle AI usage threshold event: ${error.message}`,
      );
    }
  }

  @OnEvent('ai.cache_hit')
  async handleCacheHit(event: AICacheHitEvent) {
    this.logger.debug(
      `AI cache hit - Type: ${event.cacheType}, Key: ${event.cacheKey}`,
    );

    try {
      // Track cache hit metrics
      await this.redis.increment('metrics:ai:cache_hits:total');
      await this.redis.increment(
        `metrics:ai:cache_hits:type:${event.cacheType}`,
      );
      await this.redis.increment(
        `metrics:ai:cache_hits:daily:${this.getDateKey()}`,
      );

      // Track cache efficiency
      await this.redis.increment(`metrics:ai:cache:${event.cacheType}:hits`);
    } catch (error) {
      this.logger.error(
        `Failed to handle AI cache hit event: ${error.message}`,
      );
    }
  }

  @OnEvent('ai.cache_miss')
  async handleCacheMiss(event: AICacheMissEvent) {
    this.logger.debug(
      `AI cache miss - Type: ${event.cacheType}, Key: ${event.cacheKey}`,
    );

    try {
      // Track cache miss metrics
      await this.redis.increment('metrics:ai:cache_misses:total');
      await this.redis.increment(
        `metrics:ai:cache_misses:type:${event.cacheType}`,
      );
      await this.redis.increment(
        `metrics:ai:cache_misses:daily:${this.getDateKey()}`,
      );

      // Track cache efficiency
      await this.redis.increment(`metrics:ai:cache:${event.cacheType}:misses`);
    } catch (error) {
      this.logger.error(
        `Failed to handle AI cache miss event: ${error.message}`,
      );
    }
  }

  private getDateKey(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }
}
