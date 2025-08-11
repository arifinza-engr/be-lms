// src/config/env.validation.ts
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  validateSync,
  Min,
  Max,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  readonly NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @Max(65535)
  readonly PORT: number = 3000;

  @IsString()
  readonly DATABASE_URL: string;

  @IsString()
  readonly JWT_SECRET: string;

  @IsOptional()
  @IsString()
  readonly JWT_EXPIRES_IN?: string = '7d';

  @IsOptional()
  @IsString()
  readonly OPENAI_API_KEY?: string;

  @IsOptional()
  @IsString()
  readonly ELEVENLABS_API_KEY?: string;

  @IsOptional()
  @IsString()
  readonly ELEVENLABS_VOICE_ID?: string;

  @IsOptional()
  @IsString()
  readonly CORS_ORIGIN?: string = '*';

  @IsOptional()
  @IsNumber()
  @Min(1000)
  readonly RATE_LIMIT_TTL?: number = 60000;

  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly RATE_LIMIT_LIMIT?: number = 100;

  @IsOptional()
  @IsString()
  readonly LOG_LEVEL?: string = 'info';

  @IsOptional()
  @IsUrl()
  readonly REDIS_URL?: string;

  @IsOptional()
  @IsNumber()
  @Min(1024)
  readonly MAX_FILE_SIZE?: number = 10485760;

  @IsOptional()
  @IsString()
  readonly UPLOAD_DEST?: string = './uploads';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
