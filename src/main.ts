import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CustomLoggerService } from './common/services/logger.service';
import * as swaggerUi from 'swagger-ui-express';
import * as YAML from 'yamljs';
import * as path from 'path';
import compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // ✅ no manual logger

  // Compression middleware
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-request-id',
    ],
  });

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Swagger YAML setup
  if (process.env.NODE_ENV !== 'production') {
    const swaggerDocument = YAML.load(
      path.resolve(process.cwd(), 'swagger.yaml'),
    );
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  // Run app
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  // ✅ ambil dari Nest container
  const logger = app.get(CustomLoggerService);
  logger.log(`🚀 LMS Backend is running on http://localhost:${port}`);
  logger.log(`📚 API Docs available at http://localhost:${port}/docs`);
  logger.log(`🏥 Health check available at http://localhost:${port}/health`);
}
bootstrap();
