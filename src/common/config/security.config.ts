// src/common/config/security.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SecurityConfig {
  helmet: {
    contentSecurityPolicy: {
      directives: Record<string, string[]>;
    };
    crossOriginEmbedderPolicy: boolean;
    crossOriginOpenerPolicy: { policy: string };
    crossOriginResourcePolicy: { policy: string };
    dnsPrefetchControl: { allow: boolean };
    frameguard: { action: string };
    hidePoweredBy: boolean;
    hsts: {
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
    ieNoOpen: boolean;
    noSniff: boolean;
    originAgentCluster: boolean;
    permittedCrossDomainPolicies: boolean;
    referrerPolicy: { policy: string[] };
    xssFilter: boolean;
  };
  cors: {
    origin: string[] | boolean;
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
    maxAge: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
    message: string | object;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
}

@Injectable()
export class SecurityConfigService {
  constructor(private readonly configService: ConfigService) {}

  getSecurityConfig(): SecurityConfig {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const isDevelopment = nodeEnv === 'development';

    // 🔑 Ambil daftar origin dari .env
    const corsEnv = this.configService.get<string>('CORS_ORIGIN', '');
    const frontendEnv = this.configService.get<string>('FRONTEND_URL', '');
    const origins = (corsEnv || frontendEnv || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    return {
      helmet: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
              "'self'",
              "'unsafe-inline'",
              'https://fonts.googleapis.com',
              'https://cdn.jsdelivr.net',
            ],
            fontSrc: [
              "'self'",
              'https://fonts.gstatic.com',
              'https://cdn.jsdelivr.net',
            ],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
            scriptSrc: [
              "'self'",
              ...(isDevelopment ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
            ],
            connectSrc: [
              "'self'",
              'https://api.openai.com',
              'https://api.elevenlabs.io',
              ...origins,
              ...(isDevelopment ? ['ws:', 'wss:'] : ['wss:']),
            ],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", 'https:'],
            workerSrc: ["'self'", 'blob:'],
            childSrc: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: isDevelopment ? [] : ["'true'"],
          },
        },
        crossOriginEmbedderPolicy: !isDevelopment,
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        dnsPrefetchControl: { allow: false },
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        hsts: {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true,
        },
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: false,
        referrerPolicy: {
          policy: ['no-referrer', 'strict-origin-when-cross-origin'],
        },
        xssFilter: true,
      },
      cors: {
        origin: origins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
          'X-API-Key',
          'X-Client-Version',
          'X-Request-ID',
        ],
        credentials: true,
        maxAge: 86400, // 24 hours
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: isDevelopment ? 1000 : 100,
        message: {
          error: 'Too many requests from this IP, please try again later',
          statusCode: 429,
          timestamp: new Date().toISOString(),
        },
        standardHeaders: true,
        legacyHeaders: false,
      },
    };
  }

  private getAllowedOrigins(): string[] | boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const allowedOrigins = this.configService.get<string>('ALLOWED_ORIGINS');

    if (nodeEnv === 'development') {
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        frontendUrl,
      ].filter(Boolean);
    }

    if (allowedOrigins) {
      return allowedOrigins.split(',').map((origin) => origin.trim());
    }

    return frontendUrl ? [frontendUrl] : false;
  }

  getWebSocketCorsConfig() {
    const allowedOrigins = this.getAllowedOrigins();

    return {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    };
  }

  getTrustedProxies(): string[] {
    const trustedProxies = this.configService.get<string>('TRUSTED_PROXIES');

    if (trustedProxies) {
      return trustedProxies.split(',').map((proxy) => proxy.trim());
    }

    // Default trusted proxies for common cloud providers
    return [
      'loopback', // 127.0.0.1/8, ::1/128
      'linklocal', // 169.254.0.0/16, fe80::/10
      'uniquelocal', // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
    ];
  }

  getSessionConfig() {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const sessionSecret = this.configService.get<string>('SESSION_SECRET');

    return {
      secret: sessionSecret || 'your-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: nodeEnv === 'production', // HTTPS only in production
        httpOnly: true, // Prevent XSS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict' as const, // CSRF protection
      },
      name: 'lms.sid', // Change default session name
    };
  }

  getUploadLimits() {
    return {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5, // Maximum 5 files per request
      fieldSize: 1024 * 1024, // 1MB for form fields
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    };
  }

  getApiKeyConfig() {
    return {
      headerName: 'X-API-Key',
      queryParam: 'api_key',
      allowInQuery: false, // Only allow in headers for security
    };
  }

  getPasswordPolicy() {
    return {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      forbidCommonPasswords: true,
      maxRepeatingChars: 3,
      preventPasswordReuse: 5, // Last 5 passwords
      maxAge: 90, // Days before password expires
    };
  }

  getJwtConfig() {
    return {
      accessTokenExpiry: '15m',
      refreshTokenExpiry: '7d',
      issuer: 'lms-backend',
      audience: 'lms-frontend',
      algorithm: 'HS256' as const,
    };
  }

  getEncryptionConfig() {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');

    return {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16,
      tagLength: 16,
      key: encryptionKey || 'your-32-char-encryption-key-here!',
    };
  }
}
