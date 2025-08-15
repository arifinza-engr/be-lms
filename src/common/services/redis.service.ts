// src/common/services/redis.service.ts
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;
  private isConnected = false;
  private connectionAttempted = false;
  private lastErrorTime = 0;
  private readonly ERROR_THROTTLE_MS = 30000; // Only log errors every 30 seconds

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      this.logger.warn('Redis URL not configured, caching will be disabled');
      return;
    }

    this.connectionAttempted = true;

    try {
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              // Reduce retry attempts to avoid spam
              this.logThrottledError(
                'Redis reconnection failed after 3 attempts, giving up',
              );
              return false;
            }
            return Math.min(retries * 1000, 5000);
          },
        },
      });

      this.client.on('error', (err) => {
        this.logThrottledError('Redis Client Error: ' + err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('✅ Redis Client Connected');
        this.isConnected = true;
        this.lastErrorTime = 0; // Reset error throttling
      });

      this.client.on('disconnect', () => {
        this.logger.warn('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      this.logger.log('✅ Redis connected successfully');
    } catch (error) {
      this.logThrottledError('❌ Redis connection failed: ' + error.message);
      this.isConnected = false;
    }
  }

  private logThrottledError(message: string) {
    const now = Date.now();
    if (now - this.lastErrorTime > this.ERROR_THROTTLE_MS) {
      this.logger.error(message);
      this.lastErrorTime = now;
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.logger.log('✅ Redis disconnected');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value as string) : null;
    } catch (error) {
      this.logger.error(`Error getting key ${key}`, error.stack);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}`, error.stack);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}`, error.stack);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}`, error.stack);
      return false;
    }
  }

  async flushAll(): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      this.logger.error('Error flushing Redis', error.stack);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.isConnected) return [];

    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(
        `Error getting keys with pattern ${pattern}`,
        error.stack,
      );
      return [];
    }
  }

  async increment(
    key: string,
    value: number = 1,
    ttlSeconds?: number,
  ): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      const result = await this.client.incrBy(key, value);
      if (ttlSeconds && result === value) {
        await this.client.expire(key, ttlSeconds);
      }
      return result;
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}`, error.stack);
      return null;
    }
  }

  async lpush(key: string, value: any): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      const serializedValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      return await this.client.lPush(key, serializedValue);
    } catch (error) {
      this.logger.error(`Error lpush to key ${key}`, error.stack);
      return null;
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.lTrim(key, start, stop);
      return true;
    } catch (error) {
      this.logger.error(`Error ltrim key ${key}`, error.stack);
      return false;
    }
  }

  async zcard(key: string): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.zCard(key);
    } catch (error) {
      this.logger.error(`Error zcard key ${key}`, error.stack);
      return null;
    }
  }

  async zadd(
    key: string,
    score: number,
    member: string,
  ): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.zAdd(key, { score, value: member });
    } catch (error) {
      this.logger.error(`Error zadd to key ${key}`, error.stack);
      return null;
    }
  }

  async zremrangebyscore(
    key: string,
    min: number,
    max: number,
  ): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.zRemRangeByScore(key, min, max);
    } catch (error) {
      this.logger.error(`Error zremrangebyscore key ${key}`, error.stack);
      return null;
    }
  }

  async sadd(key: string, ...members: string[]): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.sAdd(key, members);
    } catch (error) {
      this.logger.error(`Error sadd to key ${key}`, error.stack);
      return null;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error expire key ${key}`, error.stack);
      return false;
    }
  }

  async zincrby(
    key: string,
    increment: number,
    member: string,
  ): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.zIncrBy(key, increment, member);
    } catch (error) {
      this.logger.error(`Error zincrby key ${key}`, error.stack);
      return null;
    }
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    if (!this.isConnected) return [];

    try {
      const result = await this.client.mGet(keys);
      return result.map((value) => value as string | null);
    } catch (error) {
      this.logger.error(`Error mget keys`, error.stack);
      return [];
    }
  }

  async pipeline() {
    if (!this.isConnected) return null;
    return this.client.multi();
  }

  async incr(key: string): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Error incr key ${key}`, error.stack);
      return null;
    }
  }

  async decr(key: string): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.decr(key);
    } catch (error) {
      this.logger.error(`Error decr key ${key}`, error.stack);
      return null;
    }
  }

  async ttl(key: string): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Error ttl key ${key}`, error.stack);
      return null;
    }
  }

  async info(section?: string): Promise<string | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.info(section);
    } catch (error) {
      this.logger.error(`Error info ${section}`, error.stack);
      return null;
    }
  }

  async smembers(key: string): Promise<string[]> {
    if (!this.isConnected) return [];

    try {
      return await this.client.sMembers(key);
    } catch (error) {
      this.logger.error(`Error smembers key ${key}`, error.stack);
      return [];
    }
  }

  async scard(key: string): Promise<number | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.sCard(key);
    } catch (error) {
      this.logger.error(`Error scard key ${key}`, error.stack);
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.isConnected) return [];

    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      this.logger.error(`Error lrange key ${key}`, error.stack);
      return [];
    }
  }

  async zrevrange(
    key: string,
    start: number,
    stop: number,
    withScores?: boolean,
  ): Promise<string[]> {
    if (!this.isConnected) return [];

    try {
      if (withScores) {
        const result = await this.client.zRangeWithScores(key, start, stop, {
          REV: true,
        });
        return result.map((item) => [item.value, item.score.toString()]).flat();
      }
      return await this.client.zRange(key, start, stop, { REV: true });
    } catch (error) {
      this.logger.error(`Error zrevrange key ${key}`, error.stack);
      return [];
    }
  }

  async ping(): Promise<string | null> {
    if (!this.isConnected) return null;

    try {
      return await this.client.ping();
    } catch (error) {
      this.logger.error(`Error ping`, error.stack);
      return null;
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  isAvailable(): boolean {
    return this.connectionAttempted && this.isConnected;
  }

  getStatus(): { available: boolean; connected: boolean; attempted: boolean } {
    return {
      available: this.isAvailable(),
      connected: this.isConnected,
      attempted: this.connectionAttempted,
    };
  }
}
