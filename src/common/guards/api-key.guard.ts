// src/common/guards/api-key.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RateLimitService } from '../services/rate-limit.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  private readonly validApiKeys: Set<string>;

  constructor(
    private readonly configService: ConfigService,
    private readonly rateLimitService: RateLimitService,
  ) {
    // Load API keys from environment
    const apiKeysEnv = this.configService.get<string>('API_KEYS', '');
    this.validApiKeys = new Set(
      apiKeysEnv
        .split(',')
        .map((key) => key.trim())
        .filter(Boolean),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      this.logger.warn(`API key missing from ${request.ip}`);
      throw new UnauthorizedException('API key required');
    }

    // Validate API key format (should be at least 32 characters)
    if (apiKey.length < 32) {
      this.logger.warn(`Invalid API key format from ${request.ip}`);
      throw new UnauthorizedException('Invalid API key format');
    }

    // Check rate limiting for API key usage
    const rateLimitResult = await this.rateLimitService.checkRateLimit(
      `api_key:${apiKey}`,
      'general',
    );

    if (!rateLimitResult.allowed) {
      this.logger.warn(
        `API key rate limit exceeded: ${apiKey.substring(0, 8)}...`,
      );
      throw new UnauthorizedException('API key rate limit exceeded');
    }

    // Validate API key
    if (!this.validApiKeys.has(apiKey)) {
      this.logger.warn(
        `Invalid API key attempt from ${request.ip}: ${apiKey.substring(0, 8)}...`,
      );
      throw new UnauthorizedException('Invalid API key');
    }

    // Add API key info to request for logging
    (request as any).apiKey = apiKey.substring(0, 8) + '...';

    return true;
  }

  private extractApiKey(request: Request): string | null {
    // Check header first (preferred)
    const headerKey = request.headers['x-api-key'] as string;
    if (headerKey) {
      return headerKey;
    }

    // Check Authorization header as Bearer token
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Don't check query params for security reasons
    return null;
  }
}
