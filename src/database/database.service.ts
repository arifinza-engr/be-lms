// src/database/database.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private client!: Sql;
  public db!: PostgresJsDatabase<typeof schema>;
  private retryAttempts = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 5000; // 5 seconds

  constructor(private readonly configService: ConfigService) {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    const config = this.getDatabaseConfig(nodeEnv);

    // Create postgres client. Keep options conservative to match typings.
    this.client = postgres(databaseUrl!, {
      ...config,
      transform: postgres.camel, // keep camelCase mapping
      onnotice: nodeEnv === 'production' ? () => {} : undefined,
      debug: nodeEnv === 'development',
      connection: {
        application_name: `lms-backend-${nodeEnv}`,
      },
      onclose: () => {
        this.logger.warn('Database connection closed');
      },
      // NOTE: removed `onconnect` because it's not a recognized option in current typings.
    });

    // Initialize Drizzle with schema so `db.query.<table>` is typed
    this.db = drizzle(this.client, {
      schema,
      logger: nodeEnv === 'development',
    });
  }

  private getDatabaseConfig(nodeEnv: string) {
    // keep_alive expects a number (ms) in current postgres typings
    const keepAliveMs = nodeEnv === 'production' ? 60_000 : 0;

    const baseConfig = {
      // Connection pool settings
      max: nodeEnv === 'production' ? 25 : 10,
      idle_timeout: nodeEnv === 'production' ? 30 : 20, // seconds
      connect_timeout: nodeEnv === 'production' ? 30 : 10, // seconds

      // Performance settings
      prepare: nodeEnv === 'production', // Use prepared statements in production

      // SSL configuration for production
      ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined,

      // Connection management
      max_lifetime: nodeEnv === 'production' ? 60 * 60 : 30 * 60, // seconds

      // Timeout settings
      statement_timeout: 30_000, // ms
      query_timeout: 25_000, // ms

      // Keep alive (ms)
      keep_alive: keepAliveMs,
    } as const;

    if (nodeEnv === 'test') {
      return {
        ...baseConfig,
        max: 5,
        idle_timeout: 10,
        connect_timeout: 5,
        prepare: false,
      };
    }

    return baseConfig;
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(): Promise<void> {
    try {
      // test simple query to verify connectivity
      await this.client`SELECT 1`;
      this.logger.log('✅ Database connected successfully');
      this.retryAttempts = 0;
    } catch (error: any) {
      this.retryAttempts++;
      this.logger.error(
        `❌ Database connection failed (attempt ${this.retryAttempts}/${this.maxRetries})`,
        error?.stack ?? String(error),
      );

      if (this.retryAttempts < this.maxRetries) {
        this.logger.log(
          `Retrying database connection in ${this.retryDelay / 1000} seconds...`,
        );
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.connectWithRetry();
      } else {
        this.logger.error('❌ Max database connection retries exceeded');
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    this.logger.log('🔌 Closing DB connection...');
    try {
      await this.client.end();
      this.logger.log('✅ DB connection closed.');
    } catch (error: any) {
      this.logger.error(
        '❌ Error closing database connection',
        error?.stack ?? String(error),
      );
    }
  }

  // Transaction helper (tx is typed with schema-aware PostgresJsDatabase)
  async transaction<T>(
    callback: (tx: PostgresJsDatabase<typeof schema>) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(callback);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client`SELECT 1`;
      return true;
    } catch (error: any) {
      this.logger.error(
        'Database health check failed',
        error?.stack ?? String(error),
      );
      return false;
    }
  }

  // Optional: expose access to raw postgres client if needed
  getRawClient(): Sql {
    return this.client;
  }

  // Database performance monitoring
  async getConnectionStats(): Promise<any> {
    try {
      const stats = await this.client`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;
      return stats[0];
    } catch (error: any) {
      this.logger.error(
        'Failed to get connection stats',
        error?.stack ?? String(error),
      );
      return null;
    }
  }

  async getDatabaseSize(): Promise<any> {
    try {
      const size = await this.client`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `;
      return size[0];
    } catch (error: any) {
      this.logger.error(
        'Failed to get database size',
        error?.stack ?? String(error),
      );
      return null;
    }
  }

  async getSlowQueries(limit: number = 10): Promise<any[]> {
    try {
      const queries = await this.client`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements 
        ORDER BY mean_time DESC 
        LIMIT ${limit}
      `;
      return queries;
    } catch (error: any) {
      this.logger.warn(
        'pg_stat_statements extension not available or query failed',
      );
      return [];
    }
  }

  // Graceful shutdown helper
  async gracefulShutdown(): Promise<void> {
    this.logger.log('Initiating graceful database shutdown...');

    try {
      const timeout = 30_000; // 30 seconds
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        const stats = await this.getConnectionStats();
        if (!stats || Number(stats.active_connections) <= 1) {
          break;
        }

        this.logger.log(
          `Waiting for ${stats.active_connections} active connections to finish...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await this.client.end();
      this.logger.log('✅ Database shutdown completed');
    } catch (error: any) {
      this.logger.error(
        '❌ Error during graceful shutdown',
        error?.stack ?? String(error),
      );
      throw error;
    }
  }
}
