// src/config/database.test.config.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/database/schema';

@Injectable()
export class TestDatabaseService {
  private readonly logger = new Logger(TestDatabaseService.name);
  public db: ReturnType<typeof drizzle>;
  private client: postgres.Sql;

  constructor(private readonly configService: ConfigService) {
    this.connect();
  }

  async connect() {
    try {
      const connectionString = this.getTestConnectionString();

      this.client = postgres(connectionString, {
        max: 1, // Single connection for tests
        idle_timeout: 20,
        connect_timeout: 10,
      });

      this.db = drizzle(this.client, { schema });

      this.logger.log('Test database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to test database', error.stack);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.end();
        this.logger.log('Test database disconnected');
      }
    } catch (error) {
      this.logger.error('Error disconnecting from test database', error.stack);
    }
  }

  async cleanDatabase() {
    try {
      // Clean all tables in reverse order to respect foreign key constraints
      const tables = [
        'ai_chat_logs',
        'ai_generated_content',
        'quiz_attempts',
        'quiz_questions',
        'quizzes',
        'user_progress',
        'subchapters',
        'chapters',
        'subjects',
        'grades',
        'users',
      ];

      for (const table of tables) {
        await this
          .client`TRUNCATE TABLE ${this.client(table)} RESTART IDENTITY CASCADE`;
      }

      this.logger.log('Test database cleaned successfully');
    } catch (error) {
      this.logger.error('Failed to clean test database', error.stack);
      throw error;
    }
  }

  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }

  private getTestConnectionString(): string {
    const host = this.configService.get<string>('TEST_DB_HOST') || 'localhost';
    const port = this.configService.get<number>('TEST_DB_PORT') || 5432;
    const username =
      this.configService.get<string>('TEST_DB_USERNAME') || 'postgres';
    const password =
      this.configService.get<string>('TEST_DB_PASSWORD') || 'password';
    const database =
      this.configService.get<string>('TEST_DB_NAME') || 'lms_test';

    return `postgresql://${username}:${password}@${host}:${port}/${database}`;
  }

  // Helper methods for testing
  async createTestUser(userData: any) {
    const [user] = await this.db
      .insert(schema.users)
      .values({
        id: userData.id || crypto.randomUUID(),
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role || 'SISWA',
        isActive: userData.isActive ?? true,
        loginAttempts: userData.loginAttempts || 0,
        lockedUntil: userData.lockedUntil || null,
        refreshToken: userData.refreshToken || null,
        refreshTokenExpiresAt: userData.refreshTokenExpiresAt || null,
        passwordChangedAt: userData.passwordChangedAt || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return user;
  }

  async createTestGrade(gradeData: any) {
    const [grade] = await this.db
      .insert(schema.grades)
      .values({
        id: gradeData.id || crypto.randomUUID(),
        title: gradeData.title,
        description: gradeData.description || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return grade;
  }

  async createTestSubject(subjectData: any) {
    const [subject] = await this.db
      .insert(schema.subjects)
      .values({
        id: subjectData.id || crypto.randomUUID(),
        title: subjectData.title,
        description: subjectData.description || null,
        gradeId: subjectData.gradeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return subject;
  }

  async createTestChapter(chapterData: any) {
    const [chapter] = await this.db
      .insert(schema.chapters)
      .values({
        id: chapterData.id || crypto.randomUUID(),
        title: chapterData.title,
        description: chapterData.description || null,
        subjectId: chapterData.subjectId,
        order: chapterData.order || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return chapter;
  }

  async createTestSubchapter(subchapterData: any) {
    const [subchapter] = await this.db
      .insert(schema.subchapters)
      .values({
        id: subchapterData.id || crypto.randomUUID(),
        title: subchapterData.title,
        description: subchapterData.description || null,
        chapterId: subchapterData.chapterId,
        order: subchapterData.order || 1,
      })
      .returning();

    return subchapter;
  }
}
