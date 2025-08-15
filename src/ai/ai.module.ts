import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenaiService } from './services/openai.service';
import { ElevenlabsService } from './services/elevenlabs.service';
import { AICacheService } from './services/ai-cache.service';
import { DatabaseService } from '@/database/database.service';
import { RedisService } from '@/common/services/redis.service';
import { TransactionService } from '@/common/services/transaction.service';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [ContentModule],
  controllers: [AiController],
  providers: [
    AiService,
    OpenaiService,
    ElevenlabsService,
    AICacheService,
    DatabaseService,
    RedisService,
    TransactionService,
  ],
  exports: [AiService, OpenaiService],
})
export class AiModule {}
