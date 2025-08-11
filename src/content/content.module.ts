// src/content/content.module.ts
import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { DatabaseService } from '../config/database.config';

@Module({
  controllers: [ContentController],
  providers: [ContentService, DatabaseService],
  exports: [ContentService],
})
export class ContentModule {}
