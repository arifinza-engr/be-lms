import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { DatabaseService } from '../config/database.config';

@Module({
  controllers: [ProgressController],
  providers: [ProgressService, DatabaseService],
})
export class ProgressModule {}