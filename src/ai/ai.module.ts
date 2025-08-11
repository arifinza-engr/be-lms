import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenaiService } from './services/openai.service';
import { ElevenlabsService } from './services/elevenlabs.service';
import { DatabaseService } from '../config/database.config';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [ContentModule],
  controllers: [AiController],
  providers: [AiService, OpenaiService, ElevenlabsService, DatabaseService],
  exports: [AiService, OpenaiService],
})
export class AiModule {}
