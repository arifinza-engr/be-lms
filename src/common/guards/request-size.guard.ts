// src/common/guards/request-size.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  PayloadTooLargeException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RequestSizeGuard implements CanActivate {
  private readonly maxBodySize = 10 * 1024 * 1024; // 10MB
  private readonly maxHeaderSize = 8 * 1024; // 8KB
  private readonly maxUrlLength = 2048; // 2KB

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Check URL length
    if (request.url.length > this.maxUrlLength) {
      throw new BadRequestException('URL too long');
    }

    // Check header size
    const headerSize = JSON.stringify(request.headers).length;
    if (headerSize > this.maxHeaderSize) {
      throw new BadRequestException('Headers too large');
    }

    // Check body size (if content-length header exists)
    const contentLength = request.headers['content-length'];
    if (contentLength && parseInt(contentLength) > this.maxBodySize) {
      throw new PayloadTooLargeException('Request body too large');
    }

    // Check for suspicious patterns in URL
    const suspiciousPatterns = [
      /\.\./g, // Directory traversal
      /<script/gi, // Script injection
      /javascript:/gi, // JavaScript protocol
      /data:/gi, // Data protocol
      /vbscript:/gi, // VBScript protocol
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(request.url)) {
        throw new BadRequestException('Suspicious request pattern detected');
      }
    }

    return true;
  }
}
