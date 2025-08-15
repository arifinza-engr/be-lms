// src/common/decorators/sanitization.decorator.ts
import { SetMetadata } from '@nestjs/common';
import {
  SanitizationOptions,
  SANITIZATION_OPTIONS_KEY,
} from '@/common/interceptors/sanitization.interceptor';

/**
 * Skip input sanitization for this endpoint
 */
export const SkipSanitization = () =>
  SetMetadata(SANITIZATION_OPTIONS_KEY, {
    skipSanitization: true,
  } as SanitizationOptions);

/**
 * Enable HTML sanitization for specific fields
 */
export const SanitizeHtml = (fieldsToSanitizeAsHtml?: string[]) =>
  SetMetadata(SANITIZATION_OPTIONS_KEY, {
    sanitizeHtml: true,
    fieldsToSanitizeAsHtml,
  } as SanitizationOptions);

/**
 * Skip sanitization for specific fields
 */
export const SkipSanitizationForFields = (fieldsToSkip: string[]) =>
  SetMetadata(SANITIZATION_OPTIONS_KEY, {
    fieldsToSkip,
  } as SanitizationOptions);

/**
 * Custom sanitization options
 */
export const CustomSanitization = (options: SanitizationOptions) =>
  SetMetadata(SANITIZATION_OPTIONS_KEY, options);
