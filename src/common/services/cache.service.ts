// src/common/services/cache.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  compress?: boolean;
  serialize?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: string;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL: number;
  private readonly defaultPrefix: string;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.defaultTTL = this.configService.get<number>('CACHE_TTL', 3600); // 1 hour
    this.defaultPrefix = this.configService.get<string>(
      'CACHE_PREFIX',
      'lms:cache',
    );
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const value = await this.redis.get(fullKey);

      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;

      if (options?.serialize !== false) {
        try {
          return JSON.parse(value as string);
        } catch (error) {
          this.logger.warn(`Failed to parse cached value for key: ${fullKey}`);
          return value as T;
        }
      }

      return value as T;
    } catch (error) {
      this.logger.error(`Cache get error for key: ${key}`, error.stack);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions,
  ): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const ttl = options?.ttl || this.defaultTTL;

      let serializedValue: string;
      if (options?.serialize !== false) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = value as string;
      }

      const result = await this.redis.set(fullKey, serializedValue, ttl);
      return result;
    } catch (error) {
      this.logger.error(`Cache set error for key: ${key}`, error.stack);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const result = await this.redis.del(fullKey);
      return result;
    } catch (error) {
      this.logger.error(`Cache delete error for key: ${key}`, error.stack);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const result = await this.redis.exists(fullKey);
      return result;
    } catch (error) {
      this.logger.error(`Cache exists error for key: ${key}`, error.stack);
      return false;
    }
  }

  /**
   * Get multiple values from cache
   */
  async mget<T>(keys: string[], options?: CacheOptions): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map((key) => this.buildKey(key, options?.prefix));
      const values = await this.redis.mget(...fullKeys);

      return values.map((value, index) => {
        if (value === null) {
          this.stats.misses++;
          return null;
        }

        this.stats.hits++;

        if (options?.serialize !== false) {
          try {
            return JSON.parse(value as string);
          } catch (error) {
            this.logger.warn(
              `Failed to parse cached value for key: ${fullKeys[index]}`,
            );
            return value as T;
          }
        }

        return value as T;
      });
    } catch (error) {
      this.logger.error(
        `Cache mget error for keys: ${keys.join(', ')}`,
        error.stack,
      );
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values in cache
   */
  async mset<T>(
    keyValuePairs: Array<{ key: string; value: T; ttl?: number }>,
    options?: CacheOptions,
  ): Promise<boolean> {
    try {
      const promises = keyValuePairs.map(async ({ key, value, ttl }) => {
        const fullKey = this.buildKey(key, options?.prefix);
        const cacheTTL = ttl || options?.ttl || this.defaultTTL;

        let serializedValue: string;
        if (options?.serialize !== false) {
          serializedValue = JSON.stringify(value);
        } else {
          serializedValue = value as string;
        }

        return await this.redis.set(fullKey, serializedValue, cacheTTL);
      });

      const results = await Promise.all(promises);
      return results.every((result) => result === true);
    } catch (error) {
      this.logger.error(`Cache mset error`, error.stack);
      return false;
    }
  }

  /**
   * Increment a numeric value in cache
   */
  async incr(key: string, options?: CacheOptions): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      return (await this.redis.incr(fullKey)) || 0;
    } catch (error) {
      this.logger.error(`Cache incr error for key: ${key}`, error.stack);
      return 0;
    }
  }

  /**
   * Decrement a numeric value in cache
   */
  async decr(key: string, options?: CacheOptions): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      return (await this.redis.decr(fullKey)) || 0;
    } catch (error) {
      this.logger.error(`Cache decr error for key: ${key}`, error.stack);
      return 0;
    }
  }

  /**
   * Set expiration time for a key
   */
  async expire(
    key: string,
    ttl: number,
    options?: CacheOptions,
  ): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const result = await this.redis.expire(fullKey, ttl);
      return result;
    } catch (error) {
      this.logger.error(`Cache expire error for key: ${key}`, error.stack);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string, options?: CacheOptions): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      return (await this.redis.ttl(fullKey)) || -1;
    } catch (error) {
      this.logger.error(`Cache TTL error for key: ${key}`, error.stack);
      return -1;
    }
  }

  /**
   * Clear all cache with specific prefix
   */
  async clear(prefix?: string): Promise<number> {
    try {
      const pattern = this.buildKey('*', prefix);
      const keys = await this.redis.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      let totalDeleted = 0;
      for (const key of keys) {
        const deleted = await this.redis.del(key);
        if (deleted) totalDeleted++;
      }
      this.logger.log(
        `Cleared ${totalDeleted} cache keys with pattern: ${pattern}`,
      );
      return totalDeleted;
    } catch (error) {
      this.logger.error(`Cache clear error`, error.stack);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info('memory');
      const memoryUsage = this.extractMemoryUsage(info || '');

      const pattern = this.buildKey('*');
      const keys = await this.redis.keys(pattern);

      const hitRate =
        this.stats.hits + this.stats.misses > 0
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
          : 0;

      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: Math.round(hitRate * 100) / 100,
        totalKeys: keys.length,
        memoryUsage,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats', error.stack);
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: 0,
        totalKeys: 0,
        memoryUsage: 'unknown',
      };
    }
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Cache with fallback function
   */
  async remember<T>(
    key: string,
    fallback: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key, options);

    if (cached !== null) {
      return cached;
    }

    const value = await fallback();
    await this.set(key, value, options);

    return value;
  }

  /**
   * Cache with tags for group invalidation
   */
  async setWithTags<T>(
    key: string,
    value: T,
    tags: string[],
    options?: CacheOptions,
  ): Promise<boolean> {
    const success = await this.set(key, value, options);

    if (success && tags.length > 0) {
      // Store tag associations
      const fullKey = this.buildKey(key, options?.prefix);

      for (const tag of tags) {
        const tagKey = this.buildKey(`tag:${tag}`, options?.prefix);
        await this.redis.sadd(tagKey, fullKey);
        await this.redis.expire(
          tagKey,
          (options?.ttl || this.defaultTTL) + 300,
        ); // Tag expires 5 minutes after cache
      }
    }

    return success;
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(
    tags: string[],
    options?: CacheOptions,
  ): Promise<number> {
    try {
      let totalDeleted = 0;

      for (const tag of tags) {
        const tagKey = this.buildKey(`tag:${tag}`, options?.prefix);
        const keys = await this.redis.smembers(tagKey);

        if (keys.length > 0) {
          for (const key of keys) {
            const deleted = await this.redis.del(key);
            if (deleted) totalDeleted++;
          }
        }

        // Remove the tag set itself
        await this.redis.del(tagKey);
      }

      this.logger.log(
        `Invalidated ${totalDeleted} cache keys by tags: ${tags.join(', ')}`,
      );
      return totalDeleted;
    } catch (error) {
      this.logger.error(`Cache invalidation by tags error`, error.stack);
      return 0;
    }
  }

  /**
   * Build full cache key with prefix
   */
  private buildKey(key: string, prefix?: string): string {
    const cachePrefix = prefix || this.defaultPrefix;
    return `${cachePrefix}:${key}`;
  }

  /**
   * Extract memory usage from Redis info
   */
  private extractMemoryUsage(info: string): string {
    const match = info.match(/used_memory_human:(.+)/);
    return match ? match[1].trim() : 'unknown';
  }

  async onModuleDestroy() {
    this.logger.log('Cache service shutting down...');
    // Redis connection will be closed by RedisService
  }
}
