import { Module } from '@nestjs/common';
import { UnrealController } from './unreal.controller';
import { UnrealService } from './unreal.service';
import { UnrealGateway } from './unreal.gateway';
import { DatabaseService } from '../config/database.config';

@Module({
  controllers: [UnrealController],
  providers: [UnrealService, UnrealGateway, DatabaseService],
})
export class UnrealModule {}