import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/database/schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public db = drizzle(
    new Pool({ connectionString: process.env.DATABASE_URL }),
    { schema },
  );

  async onModuleInit() {
    // Optional: if you want to test connection
    await this.db.execute('SELECT 1');
  }

  async onModuleDestroy() {
    // Graceful shutdown
    await (this.db as any).client.end?.();
  }
}
