// src/content/content.module.ts
import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { MaterialsService } from './materials.service';
import { ContentRepository } from './repositories/content.repository';
import { DatabaseService } from '@/database/database.service';
import { RedisService } from '@/common/services/redis.service';
import { TransactionService } from '@/common/services/transaction.service';
import { FileUploadService } from '@/common/services/file-upload.service';

@Module({
  controllers: [ContentController],
  providers: [
    ContentService,
    MaterialsService,
    ContentRepository,
    DatabaseService,
    RedisService,
    TransactionService,
    FileUploadService,
  ],
  exports: [ContentService, MaterialsService],
})
export class ContentModule {}
