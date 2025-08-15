// src/ai/services/ai-cache.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/common/services/redis.service';
import { createHash } from 'crypto';

export interface CachedAIResponse {
  content: string;
  metadata: {
    model: string;
    tokens: number;
    timestamp: number;
    version: string;
  };
}

@Injectable()
export class AICacheService {
  private readonly logger = new Logger(AICacheService.name);
  private readonly CACHE_PREFIX = 'ai:';
  private readonly DEFAULT_TTL = 3600 * 24; // 24 hours
  private readonly CONTENT_TTL = 3600 * 24 * 7; // 7 days for generated content
  private readonly CHAT_TTL = 3600 * 2; // 2 hours for chat responses

  constructor(private readonly redis: RedisService) {}

  /**
   * Generate cache key for AI content
   */
  private generateCacheKey(
    type: string,
    identifier: string,
    prompt?: string,
  ): string {
    let key = `${this.CACHE_PREFIX}${type}:${identifier}`;

    if (prompt) {
      const promptHash = createHash('sha256')
        .update(prompt)
        .digest('hex')
        .substring(0, 16);
      key += `:${promptHash}`;
    }

    return key;
  }

  /**
   * Cache generated subchapter content
   */
  async cacheSubchapterContent(
    subchapterId: string,
    content: string,
    metadata: any = {},
  ): Promise<void> {
    try {
      const key = this.generateCacheKey('content', subchapterId);
      const cachedData: CachedAIResponse = {
        content,
        metadata: {
          model: metadata.model || 'gpt-3.5-turbo',
          tokens: metadata.tokens || 0,
          timestamp: Date.now(),
          version: '1.0',
          ...metadata,
        },
      };

      await this.redis.set(key, cachedData, this.CONTENT_TTL);
      this.logger.debug(`Cached subchapter content for ${subchapterId}`);
    } catch (error) {
      this.logger.error(`Failed to cache subchapter content: ${error.message}`);
    }
  }

  /**
   * Get cached subchapter content
   */
  async getCachedSubchapterContent(
    subchapterId: string,
  ): Promise<CachedAIResponse | null> {
    try {
      const key = this.generateCacheKey('content', subchapterId);
      const cached = await this.redis.get(key);

      if (cached) {
        this.logger.debug(`Cache hit for subchapter content ${subchapterId}`);
        return cached as CachedAIResponse;
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to get cached subchapter content: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Cache chat response
   */
  async cacheChatResponse(
    userId: string,
    subchapterId: string,
    question: string,
    response: string,
    metadata: any = {},
  ): Promise<void> {
    try {
      const key = this.generateCacheKey(
        'chat',
        `${userId}:${subchapterId}`,
        question,
      );
      const cachedData: CachedAIResponse = {
        content: response,
        metadata: {
          model: metadata.model || 'gpt-3.5-turbo',
          tokens: metadata.tokens || 0,
          timestamp: Date.now(),
          version: '1.0',
          userId,
          subchapterId,
          question,
          ...metadata,
        },
      };

      await this.redis.set(key, cachedData, this.CHAT_TTL);
      this.logger.debug(
        `Cached chat response for user ${userId}, subchapter ${subchapterId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to cache chat response: ${error.message}`);
    }
  }

  /**
   * Get cached chat response
   */
  async getCachedChatResponse(
    userId: string,
    subchapterId: string,
    question: string,
  ): Promise<CachedAIResponse | null> {
    try {
      const key = this.generateCacheKey(
        'chat',
        `${userId}:${subchapterId}`,
        question,
      );
      const cached = await this.redis.get(key);

      if (cached) {
        this.logger.debug(
          `Cache hit for chat response ${userId}:${subchapterId}`,
        );
        return cached as CachedAIResponse;
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to get cached chat response: ${error.message}`);
      return null;
    }
  }

  /**
   * Cache quiz questions
   */
  async cacheQuizQuestions(
    subchapterId: string,
    difficulty: string,
    questions: any[],
    metadata: any = {},
  ): Promise<void> {
    try {
      const key = this.generateCacheKey(
        'quiz',
        `${subchapterId}:${difficulty}`,
      );
      const cachedData = {
        questions,
        metadata: {
          model: metadata.model || 'gpt-3.5-turbo',
          tokens: metadata.tokens || 0,
          timestamp: Date.now(),
          version: '1.0',
          difficulty,
          count: questions.length,
          ...metadata,
        },
      };

      await this.redis.set(key, cachedData, this.DEFAULT_TTL);
      this.logger.debug(
        `Cached quiz questions for ${subchapterId}:${difficulty}`,
      );
    } catch (error) {
      this.logger.error(`Failed to cache quiz questions: ${error.message}`);
    }
  }

  /**
   * Get cached quiz questions
   */
  async getCachedQuizQuestions(
    subchapterId: string,
    difficulty: string,
  ): Promise<any | null> {
    try {
      const key = this.generateCacheKey(
        'quiz',
        `${subchapterId}:${difficulty}`,
      );
      const cached = await this.redis.get(key);

      if (cached) {
        this.logger.debug(
          `Cache hit for quiz questions ${subchapterId}:${difficulty}`,
        );
        return cached;
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to get cached quiz questions: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Invalidate cache for specific subchapter
   */
  async invalidateSubchapterCache(subchapterId: string): Promise<void> {
    try {
      const patterns = [
        this.generateCacheKey('content', subchapterId),
        `${this.generateCacheKey('chat', '*')}:${subchapterId}*`,
        `${this.generateCacheKey('quiz', subchapterId)}*`,
      ];

      for (const pattern of patterns) {
        if (pattern.includes('*')) {
          // Use Redis SCAN for pattern matching
          const keys = await this.redis.keys(pattern);
          if (keys.length > 0) {
            // RedisService.del accepts a single key, delete sequentially
            for (const key of keys) {
              await this.redis.del(key);
            }
          }
        } else {
          await this.redis.del(pattern);
        }
      }

      this.logger.debug(`Invalidated cache for subchapter ${subchapterId}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate subchapter cache: ${error.message}`,
      );
    }
  }

  /**
   * Invalidate user's chat cache
   */
  async invalidateUserChatCache(userId: string): Promise<void> {
    try {
      const pattern = `${this.generateCacheKey('chat', userId)}*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        for (const key of keys) {
          await this.redis.del(key);
        }
        this.logger.debug(`Invalidated chat cache for user ${userId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to invalidate user chat cache: ${error.message}`,
      );
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    try {
      const patterns = ['content', 'chat', 'quiz'];
      const stats = {};

      for (const pattern of patterns) {
        const keys = await this.redis.keys(`${this.CACHE_PREFIX}${pattern}:*`);
        stats[pattern] = {
          count: keys.length,
          keys: keys.slice(0, 10), // Sample of keys
        };
      }

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get cache stats: ${error.message}`);
      return {};
    }
  }

  /**
   * Warm up cache with frequently accessed content
   */
  async warmUpCache(subchapterIds: string[]): Promise<void> {
    try {
      this.logger.log(
        `Warming up cache for ${subchapterIds.length} subchapters`,
      );

      // This would typically be called during application startup
      // or as a scheduled job to pre-generate content for popular subchapters

      for (const subchapterId of subchapterIds) {
        const cached = await this.getCachedSubchapterContent(subchapterId);
        if (!cached) {
          this.logger.debug(
            `Subchapter ${subchapterId} not in cache, consider pre-generating`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to warm up cache: ${error.message}`);
    }
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpiredCache(): Promise<void> {
    try {
      const allKeys = await this.redis.keys(`${this.CACHE_PREFIX}*`);
      let cleanedCount = 0;

      for (const key of allKeys) {
        // Our RedisService doesn't expose TTL/EXPIRE currently; as a fallback, skip TTL checks.
        // If needed, extend RedisService to support ttl/expire.
        // Here we just count keys that are missing (none in this loop) and ensure keys have some TTL by re-setting.
        const value = await this.redis.get(key);
        if (value) {
          await this.redis.set(key, value, this.DEFAULT_TTL);
        }
      }

      this.logger.log(`Cleaned ${cleanedCount} expired cache entries`);
    } catch (error) {
      this.logger.error(`Failed to clean expired cache: ${error.message}`);
    }
  }
}
