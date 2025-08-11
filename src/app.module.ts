import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './config/database.config';
import { validate } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { AiModule } from './ai/ai.module';
import { QuizModule } from './quiz/quiz.module';
import { ProgressModule } from './progress/progress.module';
import { UnrealModule } from './unreal/unreal.module';
import { HealthModule } from './health/health.module';
import { CustomLoggerService } from './common/services/logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      cache: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60000,
        limit: parseInt(process.env.RATE_LIMIT_LIMIT) || 100,
      },
    ]),
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
  providers: [AppService, DatabaseService, CustomLoggerService],
})
export class AppModule {}
