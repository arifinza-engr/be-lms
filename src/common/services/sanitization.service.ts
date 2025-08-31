// src/common/services/sanitization.service.ts
import { Injectable } from '@nestjs/common';
import * as DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class SanitizationService {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  sanitizeHtml(html: string): string {
    if (!html) return '';

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'ol',
        'ul',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'a',
        'img',
        'code',
        'pre',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target'],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    });
  }

  /**
   * Sanitize plain text input
   */
  sanitizeText(text: string): string {
    if (!text) return '';

    return text
      .trim()
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 10000); // Limit length
  }

  /**
   * Sanitize email input
   */
  sanitizeEmail(email: string): string {
    if (!email) return '';

    return email
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, '') // Only allow word chars, @, ., -
      .substring(0, 254); // RFC 5321 limit
  }

  /**
   * Sanitize search query
   */
  sanitizeSearchQuery(query: string): string {
    if (!query) return '';

    return query
      .trim()
      .replace(/[<>\"'&]/g, '') // Remove potentially dangerous chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 100); // Reasonable search limit
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename: string): string {
    if (!filename) return '';

    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace unsafe chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^[._-]+|[._-]+$/g, '') // Remove leading/trailing special chars
      .substring(0, 255); // Filesystem limit
  }

  /**
   * Sanitize URL
   */
  sanitizeUrl(url: string): string {
    if (!url) return '';

    // Only allow http and https protocols
    const allowedProtocols = ['http:', 'https:'];

    try {
      const urlObj = new URL(url);

      if (!allowedProtocols.includes(urlObj.protocol)) {
        return '';
      }

      return urlObj.toString();
    } catch {
      return '';
    }
  }

  /**
   * Sanitize SQL-like input (for search, etc.)
   */
  sanitizeSqlInput(input: string): string {
    if (!input) return '';

    return input
      .replace(/[';-]/g, '') // Remove SQL comment and statement terminators
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove SQL block comments
      .replace(/--.*$/gm, '') // Remove SQL line comments
      .replace(
        /\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror)\b/gi,
        '',
      ) // Remove SQL keywords and script-related terms
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim()
      .substring(0, 1000);
  }

  /**
   * Sanitize object recursively
   */
  sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeText(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};

      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeText(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }

      return sanitized;
    }

    return obj;
  }

  /**
   * Validate and sanitize JSON input
   */
  sanitizeJson(jsonString: string): any {
    if (!jsonString) return null;

    try {
      const parsed = JSON.parse(jsonString);
      return this.sanitizeObject(parsed);
    } catch {
      return null;
    }
  }

  /**
   * Remove or escape potentially dangerous characters for logging
   */
  sanitizeForLogging(input: string): string {
    if (!input) return '';

    return input
      .replace(/[\r\n]/g, ' ') // Replace newlines with spaces
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .substring(0, 500); // Limit log entry length
  }
}
