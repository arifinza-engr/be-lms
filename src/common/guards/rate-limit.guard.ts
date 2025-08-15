// src/common/guards/rate-limit.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import {
  RateLimitService,
  RateLimitConfig,
} from '@/common/services/rate-limit.service';

export interface RateLimitOptions {
  configName:
    | 'auth'
    | 'passwordReset'
    | 'aiGeneration'
    | 'aiChat'
    | 'general'
    | 'upload';
  customConfig?: Partial<RateLimitConfig>;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

export const RATE_LIMIT_KEY = 'rate_limit';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Get rate limit options from decorator
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!options) {
      return true; // No rate limiting configured
    }

    // Generate rate limit key
    const key = this.generateKey(request, options);

    // Check rate limit
    const result = await this.rateLimitService.checkRateLimit(
      key,
      options.configName,
      options.customConfig,
    );

    // Set rate limit headers
    this.setRateLimitHeaders(response, result);

    if (!result.allowed) {
      const message =
        options.message || 'Too many requests, please try again later';

      this.logger.warn(
        `Rate limit exceeded for ${key} on ${request.method} ${request.url}`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message,
          error: 'Too Many Requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private generateKey(request: Request, options: RateLimitOptions): string {
    if (options.keyGenerator) {
      return options.keyGenerator(request);
    }

    // Default key generation strategy
    const ip = this.getClientIP(request);
    const user = (request as any).user;

    if (user?.id) {
      return `${ip}:${user.id}`;
    }

    return ip;
  }

  private getClientIP(request: Request): string {
    // Check various headers for the real IP
    const forwarded = request.headers['x-forwarded-for'];
    const realIP = request.headers['x-real-ip'];
    const cfConnectingIP = request.headers['cf-connecting-ip'];

    if (forwarded) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return ips.split(',')[0].trim();
    }

    if (realIP) {
      return Array.isArray(realIP) ? realIP[0] : realIP;
    }

    if (cfConnectingIP) {
      return Array.isArray(cfConnectingIP) ? cfConnectingIP[0] : cfConnectingIP;
    }

    return request.ip || request.connection.remoteAddress || 'unknown';
  }

  private setRateLimitHeaders(response: Response, result: any): void {
    response.setHeader('X-RateLimit-Limit', result.totalHits || 0);
    response.setHeader('X-RateLimit-Remaining', result.remaining || 0);
    response.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

    if (!result.allowed) {
      response.setHeader(
        'Retry-After',
        Math.ceil((result.resetTime - Date.now()) / 1000),
      );
    }
  }
}
