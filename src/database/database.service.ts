// src/database/database.service.ts

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private client: Sql;
  public db = drizzle(postgres(process.env.DATABASE_URL!), { schema }); // Init fallback

  constructor() {
    this.client = postgres(process.env.DATABASE_URL!, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    this.db = drizzle(this.client, { schema });
  }

  async onModuleInit() {
    try {
      await this.client`SELECT 1`;
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Database connection failed', error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('🔌 Closing DB connection...');
    await this.client.end();
    this.logger.log('✅ DB connection closed.');
  }

  // Optional: expose access to raw postgres client if needed
  getRawClient(): Sql {
    return this.client;
  }
}
