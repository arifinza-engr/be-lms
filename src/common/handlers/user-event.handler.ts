// src/common/handlers/user-event.handler.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CacheService } from '@/common/services/cache.service';
import { CustomLoggerService } from '@/common/services/logger.service';
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
export class UserEventHandler {
  private readonly logger = new Logger(UserEventHandler.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly customLogger: CustomLoggerService,
  ) {}

  @OnEvent('user.registered')
  async handleUserRegistered(event: UserRegisteredEvent) {
    try {
      // Log the registration
      this.customLogger.log(
        {
          message: `User registered: ${event.email} (${event.userId})`,
          userId: event.userId,
          email: event.email,
          name: event.name,
          role: event.role,
          timestamp: event.timestamp,
        },
        'UserRegistration',
      );

      // Clear any cached user data
      await this.invalidateUserCache(event.userId);

      // You can add more actions here:
      // - Send welcome email
      // - Create user profile
      // - Initialize user settings
      // - Track analytics
    } catch (error) {
      this.logger.error(
        `Failed to handle user registered event for user ${event.userId}`,
        error.stack,
      );
    }
  }

  @OnEvent('user.logged_in')
  async handleUserLoggedIn(event: UserLoggedInEvent) {
    try {
      // Log the login
      this.customLogger.log(
        {
          message: `User logged in: ${event.email} from ${event.ipAddress}`,
          userId: event.userId,
          email: event.email,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          loginTime: event.loginTime,
        },
        'UserLogin',
      );

      // Update last login cache
      await this.cacheService.set(
        `user:${event.userId}:last_login`,
        {
          timestamp: event.loginTime,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
        },
        { ttl: 86400 }, // 24 hours
      );

      // Track login statistics
      await this.updateLoginStats(event.userId);

      // You can add more actions here:
      // - Update user activity status
      // - Send login notification
      // - Track user behavior analytics
    } catch (error) {
      this.logger.error(
        `Failed to handle user logged in event for user ${event.userId}`,
        error.stack,
      );
    }
  }

  @OnEvent('user.logged_out')
  async handleUserLoggedOut(event: UserLoggedOutEvent) {
    try {
      // Log the logout
      this.customLogger.log(
        {
          message: `User logged out: ${event.email}`,
          userId: event.userId,
          email: event.email,
          logoutTime: event.logoutTime,
        },
        'UserLogout',
      );

      // Clear user session cache
      await this.cacheService.del(`user:${event.userId}:session`);

      // Update last activity
      await this.cacheService.set(
        `user:${event.userId}:last_activity`,
        event.logoutTime,
        { ttl: 86400 }, // 24 hours
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle user logged out event for user ${event.userId}`,
        error.stack,
      );
    }
  }

  @OnEvent('user.account_locked')
  async handleUserAccountLocked(event: UserAccountLockedEvent) {
    try {
      // Log the account lock
      this.customLogger.warn(
        {
          message: `User account locked: ${event.email} - ${event.reason}`,
          userId: event.userId,
          email: event.email,
          reason: event.reason,
          lockedUntil: event.lockedUntil,
          lockTime: event.lockTime,
        },
        'UserAccountLocked',
      );

      // Cache the lock status
      await this.cacheService.set(
        `user:${event.userId}:locked`,
        {
          reason: event.reason,
          lockedUntil: event.lockedUntil,
          lockTime: event.lockTime,
        },
        { ttl: Math.floor((event.lockedUntil.getTime() - Date.now()) / 1000) },
      );

      // Clear user sessions
      await this.invalidateUserSessions(event.userId);

      // You can add more actions here:
      // - Send account locked notification
      // - Alert administrators
      // - Log security event
    } catch (error) {
      this.logger.error(
        `Failed to handle user account locked event for user ${event.userId}`,
        error.stack,
      );
    }
  }

  @OnEvent('user.account_unlocked')
  async handleUserAccountUnlocked(event: UserAccountUnlockedEvent) {
    try {
      // Log the account unlock
      this.customLogger.log(
        {
          message: `User account unlocked: ${event.email}`,
          userId: event.userId,
          email: event.email,
          unlockTime: event.unlockTime,
        },
        'UserAccountUnlocked',
      );

      // Remove lock status from cache
      await this.cacheService.del(`user:${event.userId}:locked`);

      // You can add more actions here:
      // - Send account unlocked notification
      // - Reset login attempts
    } catch (error) {
      this.logger.error(
        `Failed to handle user account unlocked event for user ${event.userId}`,
        error.stack,
      );
    }
  }

  @OnEvent('user.password_changed')
  async handlePasswordChanged(event: PasswordChangedEvent) {
    try {
      // Log the password change
      this.customLogger.log(
        {
          message: `Password changed for user: ${event.email}`,
          userId: event.userId,
          email: event.email,
          changeTime: event.changeTime,
        },
        'PasswordChanged',
      );

      // Clear all user sessions (force re-login)
      await this.invalidateUserSessions(event.userId);

      // Update password change timestamp in cache
      await this.cacheService.set(
        `user:${event.userId}:password_changed`,
        event.changeTime,
        { ttl: 86400 * 30 }, // 30 days
      );

      // You can add more actions here:
      // - Send password changed notification
      // - Log security event
      // - Update password history
    } catch (error) {
      this.logger.error(
        `Failed to handle password changed event for user ${event.userId}`,
        error.stack,
      );
    }
  }

  @OnEvent('user.profile_updated')
  async handleUserProfileUpdated(event: UserProfileUpdatedEvent) {
    try {
      // Log the profile update
      this.customLogger.log(
        {
          message: `Profile updated for user: ${event.email}`,
          userId: event.userId,
          email: event.email,
          updatedFields: event.updatedFields,
          updateTime: event.updateTime,
        },
        'UserProfileUpdated',
      );

      // Clear user profile cache
      await this.invalidateUserCache(event.userId);

      // You can add more actions here:
      // - Send profile update notification
      // - Update search index
      // - Sync with external services
    } catch (error) {
      this.logger.error(
        `Failed to handle user profile updated event for user ${event.userId}`,
        error.stack,
      );
    }
  }

  @OnEvent('user.progress_updated')
  async handleUserProgressUpdated(event: UserProgressUpdatedEvent) {
    try {
      // Log the progress update
      this.customLogger.log(
        {
          message: `Progress updated for user: ${event.userId}`,
          userId: event.userId,
          subchapterId: event.subchapterId,
          status: event.status,
          timestamp: event.timestamp,
        },
        'UserProgressUpdated',
      );

      // Clear user progress cache
      await this.cacheService.invalidateByTags([
        `user:${event.userId}:progress`,
        `subchapter:${event.subchapterId}:progress`,
      ]);

      // Update progress statistics
      await this.updateProgressStats(event.userId, event.subchapterId);

      // You can add more actions here:
      // - Update completion badges
      // - Send progress notifications
      // - Update leaderboards
    } catch (error) {
      this.logger.error(
        `Failed to handle user progress updated event for user ${event.userId}`,
        error.stack,
      );
    }
  }

  /**
   * Helper method to invalidate user cache
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    await this.cacheService.invalidateByTags([
      `user:${userId}`,
      `user:${userId}:profile`,
      `user:${userId}:settings`,
    ]);
  }

  /**
   * Helper method to invalidate user sessions
   */
  private async invalidateUserSessions(userId: string): Promise<void> {
    await this.cacheService.invalidateByTags([
      `user:${userId}:session`,
      `user:${userId}:tokens`,
    ]);
  }

  /**
   * Helper method to update login statistics
   */
  private async updateLoginStats(userId: string): Promise<void> {
    try {
      // Increment daily login count
      const today = new Date().toISOString().split('T')[0];
      await this.cacheService.incr(`stats:login:daily:${today}`);
      await this.cacheService.incr(`stats:login:user:${userId}:daily:${today}`);

      // Update monthly stats
      const month = new Date().toISOString().substring(0, 7);
      await this.cacheService.incr(`stats:login:monthly:${month}`);
      await this.cacheService.incr(
        `stats:login:user:${userId}:monthly:${month}`,
      );
    } catch (error) {
      this.logger.error('Failed to update login stats', error.stack);
    }
  }

  /**
   * Helper method to update progress statistics
   */
  private async updateProgressStats(
    userId: string,
    subchapterId: string,
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Update daily progress stats
      await this.cacheService.incr(`stats:progress:daily:${today}`);
      await this.cacheService.incr(
        `stats:progress:user:${userId}:daily:${today}`,
      );
      await this.cacheService.incr(
        `stats:progress:subchapter:${subchapterId}:daily:${today}`,
      );
    } catch (error) {
      this.logger.error('Failed to update progress stats', error.stack);
    }
  }
}
