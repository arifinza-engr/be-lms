// src/common/listeners/user.listeners.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from '@/common/services/redis.service';
import {
  UserRegisteredEvent,
  UserLoggedInEvent,
  UserLoggedOutEvent,
  UserAccountLockedEvent,
  UserAccountUnlockedEvent,
  PasswordChangedEvent,
  UserProfileUpdatedEvent,
  UserProgressUpdatedEvent,
} from '@/common/events/user.events';

@Injectable()
export class UserEventListener {
  private readonly logger = new Logger(UserEventListener.name);

  constructor(private readonly redis: RedisService) {}

  @OnEvent('user.registered')
  async handleUserRegistered(event: UserRegisteredEvent) {
    this.logger.log(`User registered: ${event.email} (${event.userId})`);

    // Clear any cached user data
    await this.redis.del(`user:email:${event.email}`);
    await this.redis.del(`user:id:${event.userId}`);

    // You can add more logic here like:
    // - Send welcome email
    // - Create default user preferences
    // - Initialize user analytics
  }

  @OnEvent('user.logged-in')
  async handleUserLoggedIn(event: UserLoggedInEvent) {
    this.logger.log(`User logged in: ${event.email} at ${event.loginTime}`);

    // Update login statistics
    const loginKey = `stats:login:${new Date().toISOString().split('T')[0]}`;
    await this.redis.increment(loginKey, 86400); // 24 hours TTL

    // Track user activity
    const userActivityKey = `activity:${event.userId}`;
    await this.redis.set(userActivityKey, event.loginTime, 3600); // 1 hour TTL
  }

  @OnEvent('user.logged-out')
  async handleUserLoggedOut(event: UserLoggedOutEvent) {
    this.logger.log(`User logged out: ${event.email} at ${event.logoutTime}`);

    // Clear user activity
    await this.redis.del(`activity:${event.userId}`);

    // Clear user-specific cache
    await this.redis.del(`user:session:${event.userId}`);
  }

  @OnEvent('user.account-locked')
  async handleAccountLocked(event: UserAccountLockedEvent) {
    this.logger.warn(`Account locked: ${event.email} - ${event.reason}`);

    // Clear user cache to force fresh data on next login attempt
    await this.redis.del(`user:email:${event.email}`);
    await this.redis.del(`user:id:${event.userId}`);

    // You can add more logic here like:
    // - Send security alert email
    // - Log security event
    // - Notify administrators
  }

  @OnEvent('user.password-changed')
  async handlePasswordChanged(event: PasswordChangedEvent) {
    this.logger.log(`Password changed for user: ${event.email}`);

    // Invalidate all user sessions/tokens
    await this.redis.del(`user:refresh-tokens:${event.userId}`);
    await this.redis.del(`user:session:${event.userId}`);

    // Clear user cache
    await this.redis.del(`user:email:${event.email}`);
    await this.redis.del(`user:id:${event.userId}`);

    // Track password change metrics
    await this.redis.increment('metrics:users:password_changes:total');
  }

  @OnEvent('user.account_unlocked')
  async handleAccountUnlocked(event: UserAccountUnlockedEvent) {
    this.logger.log(`Account unlocked: ${event.email} at ${event.unlockTime}`);

    // Clear lock-related cache
    await this.redis.del(`user:locked:${event.userId}`);
    await this.redis.del(`failed_login_attempts:${event.userId}`);

    // Track unlock metrics
    await this.redis.increment('metrics:users:accounts_unlocked:total');
  }

  @OnEvent('user.profile_updated')
  async handleProfileUpdated(event: UserProfileUpdatedEvent) {
    this.logger.log(`Profile updated for user: ${event.email}`);

    // Invalidate user profile cache
    await this.redis.del(`user:profile:${event.userId}`);
    await this.redis.del(`user:email:${event.email}`);
    await this.redis.del(`user:id:${event.userId}`);

    // Track profile update metrics
    await this.redis.increment('metrics:users:profile_updates:total');
  }

  @OnEvent('user.progress_updated')
  async handleProgressUpdated(event: UserProgressUpdatedEvent) {
    this.logger.debug(
      `Progress updated for user: ${event.userId}, subchapter: ${event.subchapterId}, status: ${event.status}`,
    );

    // Update progress cache
    await this.redis.set(
      `user:progress:${event.userId}:${event.subchapterId}`,
      {
        status: event.status,
        updatedAt: event.timestamp,
      },
      3600 * 24 * 7, // 7 days
    );

    // Track progress metrics
    await this.redis.increment('metrics:progress:updates:total');
    await this.redis.increment(
      `metrics:progress:status:${event.status.toLowerCase()}`,
    );
  }

  private getDateKey(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }
}
