// src/common/services/rate-limit.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  blockDurationMs?: number; // How long to block after limit exceeded
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  // Predefined rate limit configurations
  private readonly configs = {
    // Authentication endpoints - stricter limits
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 attempts per 15 minutes
      blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes after limit
    },

    // Password reset - very strict
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 attempts per hour
      blockDurationMs: 2 * 60 * 60 * 1000, // Block for 2 hours
    },

    // AI content generation - moderate limits
    aiGeneration: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 requests per minute
      blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
    },

    // AI chat - more lenient
    aiChat: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30, // 30 messages per minute
      blockDurationMs: 2 * 60 * 1000, // Block for 2 minutes
    },

    // General API - lenient
    general: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100, // 100 requests per minute
      blockDurationMs: 60 * 1000, // Block for 1 minute
    },

    // File upload - strict
    upload: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5, // 5 uploads per minute
      blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
    },
  };

  constructor(private readonly redis: RedisService) {}

  /**
   * Check rate limit for a specific key and configuration
   */
  async checkRateLimit(
    key: string,
    configName: keyof typeof this.configs,
    customConfig?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    const config = { ...this.configs[configName], ...customConfig };
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Check if currently blocked
    const blockKey = `rate_limit:block:${key}`;
    const blockUntil = await this.redis.get(blockKey);

    if (blockUntil && parseInt(blockUntil as string) > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: parseInt(blockUntil as string),
        totalHits: config.maxRequests,
      };
    }

    // Use sliding window log approach
    const requestKey = `rate_limit:requests:${key}`;

    // Remove old requests outside the window
    await this.redis.zremrangebyscore(requestKey, 0, windowStart);

    // Count current requests in window
    const currentRequests = await this.redis.zcard(requestKey);

    if (currentRequests >= config.maxRequests) {
      // Limit exceeded, set block if configured
      if (config.blockDurationMs) {
        const blockUntil = now + config.blockDurationMs;
        await this.redis.set(
          blockKey,
          blockUntil.toString(),
          Math.ceil(config.blockDurationMs / 1000),
        );

        this.logger.warn(
          `Rate limit exceeded for key: ${key}, blocked until: ${new Date(blockUntil)}`,
        );
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: windowStart + config.windowMs,
        totalHits: currentRequests,
      };
    }

    // Add current request
    await this.redis.zadd(requestKey, now, `${now}-${Math.random()}`);
    await this.redis.expire(requestKey, Math.ceil(config.windowMs / 1000));

    return {
      allowed: true,
      remaining: config.maxRequests - currentRequests - 1,
      resetTime: windowStart + config.windowMs,
      totalHits: currentRequests + 1,
    };
  }

  /**
   * Check rate limit by IP address
   */
  async checkByIP(
    ip: string,
    configName: keyof typeof this.configs,
    customConfig?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    return this.checkRateLimit(`ip:${ip}`, configName, customConfig);
  }

  /**
   * Check rate limit by user ID
   */
  async checkByUser(
    userId: string,
    configName: keyof typeof this.configs,
    customConfig?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    return this.checkRateLimit(`user:${userId}`, configName, customConfig);
  }

  /**
   * Check rate limit by IP and user (combined)
   */
  async checkByIPAndUser(
    ip: string,
    userId: string,
    configName: keyof typeof this.configs,
    customConfig?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    const [ipResult, userResult] = await Promise.all([
      this.checkByIP(ip, configName, customConfig),
      this.checkByUser(userId, configName, customConfig),
    ]);

    // Return the more restrictive result
    if (!ipResult.allowed || !userResult.allowed) {
      return {
        allowed: false,
        remaining: Math.min(ipResult.remaining, userResult.remaining),
        resetTime: Math.max(ipResult.resetTime, userResult.resetTime),
        totalHits: Math.max(ipResult.totalHits, userResult.totalHits),
      };
    }

    return {
      allowed: true,
      remaining: Math.min(ipResult.remaining, userResult.remaining),
      resetTime: Math.max(ipResult.resetTime, userResult.resetTime),
      totalHits: Math.max(ipResult.totalHits, userResult.totalHits),
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  async resetRateLimit(key: string): Promise<void> {
    const requestKey = `rate_limit:requests:${key}`;
    const blockKey = `rate_limit:block:${key}`;

    await Promise.all([this.redis.del(requestKey), this.redis.del(blockKey)]);

    this.logger.log(`Rate limit reset for key: ${key}`);
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getRateLimitStatus(
    key: string,
    configName: keyof typeof this.configs,
  ): Promise<Omit<RateLimitResult, 'allowed'>> {
    const config = this.configs[configName];
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Check if currently blocked
    const blockKey = `rate_limit:block:${key}`;
    const blockUntil = await this.redis.get(blockKey);

    if (blockUntil && parseInt(blockUntil as string) > now) {
      return {
        remaining: 0,
        resetTime: parseInt(blockUntil as string),
        totalHits: config.maxRequests,
      };
    }

    const requestKey = `rate_limit:requests:${key}`;
    const currentRequests = await this.redis.zcard(requestKey);

    return {
      remaining: Math.max(0, config.maxRequests - currentRequests),
      resetTime: windowStart + config.windowMs,
      totalHits: currentRequests,
    };
  }

  /**
   * Get rate limit statistics for monitoring
   */
  async getRateLimitStats(): Promise<any> {
    try {
      const patterns = ['rate_limit:requests:*', 'rate_limit:block:*'];

      const stats = {
        activeWindows: 0,
        blockedKeys: 0,
        totalRequests: 0,
      };

      for (const pattern of patterns) {
        const keys = await this.redis.keys(pattern);

        if (pattern.includes('requests')) {
          stats.activeWindows = keys.length;

          // Count total requests across all windows
          for (const key of keys) {
            const count = await this.redis.zcard(key);
            stats.totalRequests += count;
          }
        } else if (pattern.includes('block')) {
          stats.blockedKeys = keys.length;
        }
      }

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get rate limit stats: ${error.message}`);
      return {
        activeWindows: 0,
        blockedKeys: 0,
        totalRequests: 0,
      };
    }
  }

  /**
   * Clean up expired rate limit data
   */
  async cleanupExpiredData(): Promise<void> {
    try {
      const now = Date.now();
      const patterns = ['rate_limit:requests:*', 'rate_limit:block:*'];

      let cleanedKeys = 0;

      for (const pattern of patterns) {
        const keys = await this.redis.keys(pattern);

        for (const key of keys) {
          if (pattern.includes('block')) {
            const blockUntil = await this.redis.get(key);
            if (blockUntil && parseInt(blockUntil as string) <= now) {
              await this.redis.del(key);
              cleanedKeys++;
            }
          } else if (pattern.includes('requests')) {
            // Check if the sorted set is empty or expired
            const count = await this.redis.zcard(key);
            if (count === 0) {
              await this.redis.del(key);
              cleanedKeys++;
            }
          }
        }
      }

      if (cleanedKeys > 0) {
        this.logger.log(`Cleaned up ${cleanedKeys} expired rate limit keys`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to cleanup expired rate limit data: ${error.message}`,
      );
    }
  }
}
