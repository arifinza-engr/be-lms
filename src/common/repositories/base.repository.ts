// src/common/repositories/base.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { RedisService } from '@/common/services/redis.service';

@Injectable()
export abstract class BaseRepository {
  constructor(
    protected readonly database: DatabaseService,
    protected readonly redis: RedisService,
  ) {}

  protected async withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300, // 5 minutes default
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch from database
    const result = await fetcher();

    // Store in cache
    await this.redis.set(key, result, ttlSeconds);

    return result;
  }

  protected async invalidateCache(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    for (const key of keys) {
      await this.redis.del(key);
    }
  }

  protected generateCacheKey(
    prefix: string,
    ...params: (string | number)[]
  ): string {
    return `${prefix}:${params.join(':')}`;
  }
}
