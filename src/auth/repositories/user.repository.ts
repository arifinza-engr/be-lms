// src/auth/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { BaseRepository } from '@/common/repositories/base.repository';
import { users, User, NewUser } from '@/database/schema';

@Injectable()
export class UserRepository extends BaseRepository {
  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = this.generateCacheKey('user', 'email', email);

    return this.withCache(
      cacheKey,
      async () => {
        const [user] = await this.database.db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);

        return user || null;
      },
      300, // 5 minutes
    );
  }

  async findById(id: string): Promise<User | null> {
    const cacheKey = this.generateCacheKey('user', 'id', id);

    return this.withCache(
      cacheKey,
      async () => {
        const [user] = await this.database.db
          .select()
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        return user || null;
      },
      300, // 5 minutes
    );
  }

  async create(userData: NewUser): Promise<User> {
    const [newUser] = await this.database.db
      .insert(users)
      .values(userData)
      .returning();

    // Invalidate related cache
    await this.invalidateCache('user:email:*');

    return newUser;
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const [updatedUser] = await this.database.db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (updatedUser) {
      // Invalidate cache for this user
      await this.invalidateCache(`user:*:${id}`);
      await this.invalidateCache(`user:email:${updatedUser.email}`);
    }

    return updatedUser || null;
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const [user] = await this.database.db
      .select()
      .from(users)
      .where(
        and(eq(users.refreshToken, refreshToken), eq(users.isActive, true)),
      )
      .limit(1);

    return user || null;
  }

  async incrementLoginAttempts(id: string): Promise<void> {
    await this.database.db
      .update(users)
      .set({
        loginAttempts: sql`${users.loginAttempts} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    // Invalidate cache
    await this.invalidateCache(`user:*:${id}`);
  }

  async lockAccount(id: string, lockUntil: Date): Promise<void> {
    await this.database.db
      .update(users)
      .set({
        lockedUntil: lockUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    // Invalidate cache
    await this.invalidateCache(`user:*:${id}`);
  }

  async resetLoginAttempts(id: string): Promise<void> {
    await this.database.db
      .update(users)
      .set({
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    // Invalidate cache
    await this.invalidateCache(`user:*:${id}`);
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
    expiresAt: Date | null,
  ): Promise<void> {
    await this.database.db
      .update(users)
      .set({
        refreshToken,
        refreshTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    // Invalidate cache
    await this.invalidateCache(`user:*:${id}`);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.database.db
      .update(users)
      .set({
        password: hashedPassword,
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    // Invalidate cache
    await this.invalidateCache(`user:*:${id}`);
  }

  async updateResetToken(
    id: string,
    resetToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.database.db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    // Invalidate cache
    await this.invalidateCache(`user:*:${id}`);
  }

  async clearResetToken(id: string): Promise<void> {
    await this.database.db
      .update(users)
      .set({
        resetToken: null,
        resetTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    // Invalidate cache
    await this.invalidateCache(`user:*:${id}`);
  }
}
