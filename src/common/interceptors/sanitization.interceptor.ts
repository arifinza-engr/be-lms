// src/common/interceptors/sanitization.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { SanitizationService } from '@/common/services/sanitization.service';

export interface SanitizationOptions {
  skipSanitization?: boolean;
  sanitizeHtml?: boolean;
  sanitizeText?: boolean;
  fieldsToSkip?: string[];
  fieldsToSanitizeAsHtml?: string[];
}

export const SANITIZATION_OPTIONS_KEY = 'sanitization_options';

@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
  constructor(
    private readonly sanitizationService: SanitizationService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Get sanitization options from decorator
    const options =
      this.reflector.get<SanitizationOptions>(
        SANITIZATION_OPTIONS_KEY,
        context.getHandler(),
      ) || {};

    // Skip sanitization if explicitly disabled
    if (options.skipSanitization) {
      return next.handle();
    }

    // Sanitize request body
    if (request.body && typeof request.body === 'object') {
      this.sanitizeProperty(request, 'body', options);
    }

    // Sanitize query parameters
    if (request.query && typeof request.query === 'object') {
      this.sanitizeProperty(request, 'query', options);
    }

    // Sanitize route parameters
    if (request.params && typeof request.params === 'object') {
      this.sanitizeProperty(request, 'params', options);
    }

    return next.handle();
  }

  private sanitizeProperty(
    request: any,
    propertyName: string,
    options: SanitizationOptions,
  ): void {
    const originalValue = request[propertyName];
    const sanitizedValue = this.sanitizeRequestData(originalValue, options);

    try {
      // Try direct assignment first
      request[propertyName] = sanitizedValue;
    } catch (error) {
      // If property is read-only, use Object.defineProperty
      try {
        Object.defineProperty(request, propertyName, {
          value: sanitizedValue,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } catch (defineError) {
        // If we still can't modify it, log the error but don't crash
        console.warn(
          `Failed to sanitize ${propertyName}:`,
          defineError.message,
        );
      }
    }
  }

  private sanitizeRequestData(data: any, options: SanitizationOptions): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized: any = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      // Skip fields that should not be sanitized
      if (options.fieldsToSkip?.includes(key)) {
        sanitized[key] = value;
        continue;
      }

      // Handle nested objects and arrays
      if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeRequestData(value, options);
        continue;
      }

      // Handle string values
      if (typeof value === 'string') {
        // Check if this field should be sanitized as HTML
        if (
          options.fieldsToSanitizeAsHtml?.includes(key) ||
          options.sanitizeHtml
        ) {
          sanitized[key] = this.sanitizationService.sanitizeHtml(value);
        } else {
          // Default text sanitization
          sanitized[key] = this.sanitizationService.sanitizeText(value);
        }
        continue;
      }

      // For non-string, non-object values, keep as is
      sanitized[key] = value;
    }

    return sanitized;
  }
}
