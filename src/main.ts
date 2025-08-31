// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SanitizationInterceptor } from './common/interceptors/sanitization.interceptor';
import { CustomLoggerService } from './common/services/logger.service';
import { SecurityConfigService } from './common/config/security.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import compression = require('compression');
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable class-validator to use NestJS DI container
  // This allows custom validators to inject services
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Get security configuration
  const securityConfig = app.get(SecurityConfigService);
  const config = securityConfig.getSecurityConfig();

  // Trust proxy (important for rate limiting and IP detection)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', securityConfig.getTrustedProxies());

  // Security headers with Helmet
  app.use(helmet(config.helmet as any));

  // Compression middleware
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      threshold: 1024, // Only compress responses larger than 1KB
    }),
  );

  // Rate limiting
  app.use(rateLimit(config.rateLimit));

  // Enable CORS
  app.enableCors(config.cors);

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable validation pipes with enhanced security
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
      validateCustomDecorators: true,
      forbidUnknownValues: true,
    }),
  );

  // Serve static files for uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    maxAge: '1d', // Cache for 1 day
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Swagger setup with NestJS Swagger module
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('LMS Backend API')
      .setDescription('Learning Management System Backend API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and authorization')
      .addTag(
        'Content Management',
        'Manage grades, subjects, chapters, subchapters, and materials',
      )
      .addTag(
        'File Upload & Materials',
        '🚀 Upload and manage learning materials (videos, PDFs, images)',
      )
      .addTag('Quiz Management', 'Create and manage quizzes and questions')
      .addTag('AI Services', 'AI-powered content generation and chat')
      .addTag('Progress Tracking', 'Track user learning progress')
      .addTag(
        'Unreal Engine Integration',
        'Metahuman and Unreal Engine features',
      )
      .addServer('http://localhost:3000', 'Development server')
      .addServer('https://api.zonaajar.com', 'Production server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'LMS Backend API Documentation',
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #3b82f6 }
      `,
    });

    // Add endpoint for Swagger JSON
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/api-json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(document);
    });
  }

  // Graceful shutdown handlers
  const logger = app.get(CustomLoggerService);

  const gracefulShutdown = async (signal: string) => {
    logger.log(`${signal} received, shutting down gracefully`);

    try {
      await app.close();
      logger.log('✅ Application closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown', error.stack);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
    process.exit(1);
  });

  // Run app
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);

  logger.log(`🚀 LMS Backend is running on http://${host}:${port}`);
  logger.log(`📚 API Docs available at http://${host}:${port}/api/docs`);
  logger.log(`🏥 Health check available at http://${host}:${port}/api/health`);
  logger.log(`🔒 Security headers enabled`);
  logger.log(`⚡ Compression enabled`);
  logger.log(`🛡️ Rate limiting enabled`);
}
bootstrap();
