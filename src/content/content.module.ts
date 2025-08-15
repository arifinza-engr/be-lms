// src/content/content.module.ts
import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentRepository } from './repositories/content.repository';
import { DatabaseService } from '@/database/database.service';
import { RedisService } from '@/common/services/redis.service';
import { TransactionService } from '@/common/services/transaction.service';

@Module({
  controllers: [ContentController],
  providers: [
    ContentService,
    ContentRepository,
    DatabaseService,
    RedisService,
    TransactionService,
  ],
  exports: [ContentService],
})
export class ContentModule {}
