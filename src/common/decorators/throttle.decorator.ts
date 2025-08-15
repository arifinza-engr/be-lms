// src/common/decorators/throttle.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Throttle as NestThrottle } from '@nestjs/throttler';

// Custom throttle configurations for different endpoint types
export const AuthThrottle = () =>
  NestThrottle({
    default: { limit: 3, ttl: 1000 }, // 3 requests per second
    medium: { limit: 10, ttl: 60000 }, // 10 requests per minute
  });

export const ApiThrottle = () =>
  NestThrottle({
    default: { limit: 10, ttl: 1000 }, // 10 requests per second
    medium: { limit: 100, ttl: 60000 }, // 100 requests per minute
  });

export const UploadThrottle = () =>
  NestThrottle({
    default: { limit: 1, ttl: 1000 }, // 1 request per second
    medium: { limit: 5, ttl: 60000 }, // 5 requests per minute
  });

export const AIThrottle = () =>
  NestThrottle({
    default: { limit: 1, ttl: 2000 }, // 1 request per 2 seconds
    medium: { limit: 10, ttl: 60000 }, // 10 requests per minute
  });

export const PublicThrottle = () =>
  NestThrottle({
    default: { limit: 20, ttl: 1000 }, // 20 requests per second
    medium: { limit: 200, ttl: 60000 }, // 200 requests per minute
  });

// Skip throttling for certain conditions
export const SKIP_THROTTLE_KEY = 'skipThrottle';
export const SkipThrottle = (skip = true) =>
  SetMetadata(SKIP_THROTTLE_KEY, skip);
