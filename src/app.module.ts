import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from '@/database/database.service';
import { validate } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { AiModule } from './ai/ai.module';
import { QuizModule } from './quiz/quiz.module';
import { ProgressModule } from './progress/progress.module';
import { UnrealModule } from './unreal/unreal.module';
import { HealthModule } from './health/health.module';
import { CustomLoggerService } from './common/services/logger.service';
import { RedisService } from './common/services/redis.service';
import { CacheService } from './common/services/cache.service';
import { RateLimitService } from './common/services/rate-limit.service';
import { SanitizationService } from './common/services/sanitization.service';
import { PasswordService } from './common/services/password.service';
import { SecurityConfigService } from './common/config/security.config';
import { SanitizationInterceptor } from './common/interceptors/sanitization.interceptor';
import { UserEventHandler } from './common/handlers/user-event.handler';
import {
  SecurityMiddleware,
  RequestIdMiddleware,
} from './common/middleware/security.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      cache: true,
    }),

    // ✅ Tambahkan ServeStaticModule
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), // folder uploads di root project
      serveRoot: '/uploads', // URL prefix
    }),

    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    TerminusModule,
    AuthModule,
    ContentModule,
    AiModule,
    QuizModule,
    ProgressModule,
    UnrealModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseService,
    CustomLoggerService,
    RedisService,
    CacheService,
    RateLimitService,
    SanitizationService,
    PasswordService,
    SecurityConfigService,
    UserEventHandler,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SanitizationInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, SecurityMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
