// src/common/exceptions/domain.exceptions.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, statusCode);
  }
}

export class AuthenticationException extends DomainException {
  constructor(message: string = 'Authentication failed') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class AuthorizationException extends DomainException {
  constructor(message: string = 'Access denied') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ValidationException extends DomainException {
  constructor(message: string = 'Validation failed') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ResourceNotFoundException extends DomainException {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class ResourceConflictException extends DomainException {
  constructor(message: string = 'Resource conflict') {
    super(message, HttpStatus.CONFLICT);
  }
}

export class RateLimitException extends DomainException {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class ExternalServiceException extends DomainException {
  constructor(service: string, message?: string) {
    const errorMessage = message
      ? `${service} service error: ${message}`
      : `${service} service is unavailable`;
    super(errorMessage, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class DatabaseException extends DomainException {
  constructor(message: string = 'Database operation failed') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class CacheException extends DomainException {
  constructor(message: string = 'Cache operation failed') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
