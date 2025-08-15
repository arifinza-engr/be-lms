// src/common/services/monitoring.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { DatabaseService } from '@/database/database.service';

export interface SystemMetrics {
  users: {
    total: number;
    active_today: number;
    registered_today: number;
    logins_today: number;
  };
  ai: {
    content_generated_today: number;
    chat_messages_today: number;
    tokens_used_today: number;
    errors_today: number;
    cache_hit_rate: number;
  };
  performance: {
    avg_response_time: number;
    avg_generation_time: number;
    error_rate: number;
  };
  database: {
    connection_count: number;
    query_count: number;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    openai: 'up' | 'down';
    elevenlabs: 'up' | 'down';
  };
  uptime: number;
  memory_usage: number;
  cpu_usage?: number;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly redis: RedisService,
    private readonly database: DatabaseService,
  ) {}

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const dateKey = this.getDateKey();

    try {
      const [
        totalUsers,
        activeUsersToday,
        registeredToday,
        loginsToday,
        contentGeneratedToday,
        chatMessagesToday,
        tokensUsedToday,
        errorsToday,
        cacheHits,
        cacheMisses,
        responseTimes,
        generationTimes,
      ] = await Promise.all([
        this.getTotalUsers(),
        this.redis.scard(`active_users:${dateKey}`),
        this.redis.get(`metrics:users:registered:daily:${dateKey}`),
        this.redis.get(`metrics:users:logins:daily:${dateKey}`),
        this.redis.get(`metrics:ai:content_generated:daily:${dateKey}`),
        this.redis.get(`metrics:ai:chat_messages:daily:${dateKey}`),
        this.redis.get(`metrics:ai:tokens:daily:${dateKey}`),
        this.redis.get(`metrics:ai:errors:daily:${dateKey}`),
        this.redis.get('metrics:ai:cache_hits:total'),
        this.redis.get('metrics:ai:cache_misses:total'),
        this.redis.lrange('metrics:ai:response_times:chat', 0, 99),
        this.redis.lrange('metrics:ai:generation_times:content', 0, 99),
      ]);

      // Calculate cache hit rate
      const totalCacheRequests =
        (parseInt(cacheHits as string) || 0) +
        (parseInt(cacheMisses as string) || 0);
      const cacheHitRate =
        totalCacheRequests > 0
          ? (parseInt(cacheHits as string) || 0) / totalCacheRequests
          : 0;

      // Calculate average response times
      const avgResponseTime = this.calculateAverage(responseTimes);
      const avgGenerationTime = this.calculateAverage(generationTimes);

      return {
        users: {
          total: totalUsers,
          active_today: (activeUsersToday as number) || 0,
          registered_today: parseInt(registeredToday as string) || 0,
          logins_today: parseInt(loginsToday as string) || 0,
        },
        ai: {
          content_generated_today:
            parseInt(contentGeneratedToday as string) || 0,
          chat_messages_today: parseInt(chatMessagesToday as string) || 0,
          tokens_used_today: parseInt(tokensUsedToday as string) || 0,
          errors_today: parseInt(errorsToday as string) || 0,
          cache_hit_rate: Math.round(cacheHitRate * 100) / 100,
        },
        performance: {
          avg_response_time: Math.round(avgResponseTime),
          avg_generation_time: Math.round(avgGenerationTime),
          error_rate: this.calculateErrorRate(
            errorsToday as string,
            contentGeneratedToday as string,
            chatMessagesToday as string,
          ),
        },
        database: {
          connection_count: await this.getDatabaseConnectionCount(),
          query_count: await this.getDatabaseQueryCount(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get system metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const services = await this.checkServices();
    const memoryUsage = this.getMemoryUsage();
    const uptime = Date.now() - this.startTime;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    const downServices = Object.values(services).filter(
      (s) => s === 'down',
    ).length;
    if (downServices > 0) {
      status = downServices >= 2 ? 'unhealthy' : 'degraded';
    }

    // Check memory usage
    if (memoryUsage > 0.9) {
      // 90% memory usage
      status = 'unhealthy';
    } else if (memoryUsage > 0.8) {
      // 80% memory usage
      status = status === 'healthy' ? 'degraded' : status;
    }

    return {
      status,
      services,
      uptime,
      memory_usage: Math.round(memoryUsage * 100) / 100,
    };
  }

  /**
   * Get AI usage statistics for a user
   */
  async getUserAIUsage(userId: string): Promise<any> {
    try {
      const [contentGenerated, chatMessages, tokensUsed, quizzesGenerated] =
        await Promise.all([
          this.redis.get(`user:ai_usage:${userId}:content_generated`),
          this.redis.get(`user:ai_usage:${userId}:chat_messages`),
          this.redis.get(`user:ai_usage:${userId}:tokens_used`),
          this.redis.get(`user:ai_usage:${userId}:quizzes_generated`),
        ]);

      return {
        content_generated: parseInt(contentGenerated as string) || 0,
        chat_messages: parseInt(chatMessages as string) || 0,
        tokens_used: parseInt(tokensUsed as string) || 0,
        quizzes_generated: parseInt(quizzesGenerated as string) || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get user AI usage: ${error.message}`);
      return {
        content_generated: 0,
        chat_messages: 0,
        tokens_used: 0,
        quizzes_generated: 0,
      };
    }
  }

  /**
   * Get popular content analytics
   */
  async getPopularContent(): Promise<any> {
    try {
      const [popularSubchaptersChat, popularSubchaptersQuiz] =
        await Promise.all([
          this.redis.zrevrange(
            'metrics:ai:popular_subchapters:chat',
            0,
            9,
            true,
          ),
          this.redis.zrevrange(
            'metrics:ai:popular_subchapters:quiz',
            0,
            9,
            true,
          ),
        ]);

      return {
        chat: this.formatZsetResults(popularSubchaptersChat),
        quiz: this.formatZsetResults(popularSubchaptersQuiz),
      };
    } catch (error) {
      this.logger.error(`Failed to get popular content: ${error.message}`);
      return { chat: [], quiz: [] };
    }
  }

  /**
   * Get recent errors
   */
  async getRecentErrors(limit: number = 10): Promise<any[]> {
    try {
      const errors = await this.redis.lrange('ai:recent_errors', 0, limit - 1);
      return errors || [];
    } catch (error) {
      this.logger.error(`Failed to get recent errors: ${error.message}`);
      return [];
    }
  }

  /**
   * Clear old metrics (cleanup job)
   */
  async cleanupOldMetrics(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep 30 days

      const patterns = [
        'metrics:*:daily:*',
        'active_users:*',
        'users:ai_chat_active:*',
      ];

      for (const pattern of patterns) {
        const keys = await this.redis.keys(pattern);
        const oldKeys = keys.filter((key) => {
          const dateMatch = key.match(/(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            const keyDate = new Date(dateMatch[1]);
            return keyDate < cutoffDate;
          }
          return false;
        });

        if (oldKeys.length > 0) {
          for (const key of oldKeys) {
            await this.redis.del(key);
          }
          this.logger.log(`Cleaned up ${oldKeys.length} old metric keys`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup old metrics: ${error.message}`);
    }
  }

  /**
   * Generate daily report
   */
  async generateDailyReport(): Promise<any> {
    const metrics = await this.getSystemMetrics();
    const health = await this.getHealthStatus();
    const popularContent = await this.getPopularContent();
    const recentErrors = await this.getRecentErrors(5);

    return {
      date: new Date().toISOString().split('T')[0],
      metrics,
      health,
      popular_content: popularContent,
      recent_errors: recentErrors,
      generated_at: new Date().toISOString(),
    };
  }

  private async checkServices(): Promise<HealthStatus['services']> {
    const services: HealthStatus['services'] = {
      database: 'down',
      redis: 'down',
      openai: 'up', // Assume up unless we can ping
      elevenlabs: 'up', // Assume up unless we can ping
    };

    try {
      // Check database
      await this.database.db.execute('SELECT 1');
      services.database = 'up';
    } catch (error) {
      this.logger.error(`Database health check failed: ${error.message}`);
    }

    try {
      // Check Redis
      await this.redis.ping();
      services.redis = 'up';
    } catch (error) {
      this.logger.error(`Redis health check failed: ${error.message}`);
    }

    return services;
  }

  private getMemoryUsage(): number {
    const used = process.memoryUsage();
    const total = used.heapTotal;
    return used.heapUsed / total;
  }

  private async getTotalUsers(): Promise<number> {
    try {
      const result = await this.database.db.execute(
        'SELECT COUNT(*) as count FROM users',
      );
      return (result[0] as any)?.count || 0;
    } catch (error) {
      this.logger.error(`Failed to get total users: ${error.message}`);
      return 0;
    }
  }

  private async getDatabaseConnectionCount(): Promise<number> {
    try {
      // This would depend on your database type
      // For PostgreSQL: SELECT count(*) FROM pg_stat_activity;
      return 0; // Placeholder
    } catch (error) {
      return 0;
    }
  }

  private async getDatabaseQueryCount(): Promise<number> {
    try {
      // This would depend on your monitoring setup
      return 0; // Placeholder
    } catch (error) {
      return 0;
    }
  }

  private calculateAverage(values: string[]): number {
    if (!values || values.length === 0) return 0;
    const numbers = values.map((v) => parseFloat(v)).filter((n) => !isNaN(n));
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
  }

  private calculateErrorRate(errors: string, ...totals: string[]): number {
    const errorCount = parseInt(errors) || 0;
    const totalRequests = totals.reduce(
      (sum, total) => sum + (parseInt(total) || 0),
      0,
    );
    return totalRequests > 0
      ? Math.round((errorCount / totalRequests) * 100) / 100
      : 0;
  }

  private formatZsetResults(
    results: string[],
  ): Array<{ id: string; score: number }> {
    const formatted = [];
    for (let i = 0; i < results.length; i += 2) {
      if (results[i] && results[i + 1]) {
        formatted.push({
          id: results[i],
          score: parseFloat(results[i + 1]),
        });
      }
    }
    return formatted;
  }

  private getDateKey(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }
}
