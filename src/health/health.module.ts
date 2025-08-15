import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { DatabaseService } from '@/database/database.service';
import { RedisService } from '@/common/services/redis.service';
import { CacheService } from '@/common/services/cache.service';
import { RateLimitService } from '@/common/services/rate-limit.service';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [DatabaseService, RedisService, CacheService, RateLimitService],
})
export class HealthModule {}
