// src/common/decorators/rate-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';
import {
  RateLimitOptions,
  RATE_LIMIT_KEY,
} from '@/common/guards/rate-limit.guard';

/**
 * Rate limiting decorator for authentication endpoints
 */
export const AuthRateLimit = (customConfig?: Partial<RateLimitOptions>) =>
  SetMetadata(RATE_LIMIT_KEY, {
    configName: 'auth',
    message: 'Too many authentication attempts, please try again later',
    ...customConfig,
  } as RateLimitOptions);

/**
 * Rate limiting decorator for password reset endpoints
 */
export const PasswordResetRateLimit = (
  customConfig?: Partial<RateLimitOptions>,
) =>
  SetMetadata(RATE_LIMIT_KEY, {
    configName: 'passwordReset',
    message: 'Too many password reset attempts, please try again later',
    ...customConfig,
  } as RateLimitOptions);

/**
 * Rate limiting decorator for AI content generation
 */
export const AIGenerationRateLimit = (
  customConfig?: Partial<RateLimitOptions>,
) =>
  SetMetadata(RATE_LIMIT_KEY, {
    configName: 'aiGeneration',
    message: 'Too many AI generation requests, please slow down',
    ...customConfig,
  } as RateLimitOptions);

/**
 * Rate limiting decorator for AI chat
 */
export const AIChatRateLimit = (customConfig?: Partial<RateLimitOptions>) =>
  SetMetadata(RATE_LIMIT_KEY, {
    configName: 'aiChat',
    message: 'Too many chat messages, please slow down',
    ...customConfig,
  } as RateLimitOptions);

/**
 * Rate limiting decorator for file uploads
 */
export const UploadRateLimit = (customConfig?: Partial<RateLimitOptions>) =>
  SetMetadata(RATE_LIMIT_KEY, {
    configName: 'upload',
    message: 'Too many upload attempts, please try again later',
    ...customConfig,
  } as RateLimitOptions);

/**
 * General rate limiting decorator
 */
export const GeneralRateLimit = (customConfig?: Partial<RateLimitOptions>) =>
  SetMetadata(RATE_LIMIT_KEY, {
    configName: 'general',
    message: 'Too many requests, please try again later',
    ...customConfig,
  } as RateLimitOptions);

/**
 * Custom rate limiting decorator
 */
export const CustomRateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
