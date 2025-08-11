// src/content/dto/create-subchapter.dto.ts
import { IsString, IsUUID } from 'class-validator';

export class CreateSubchapterDto {
  @IsString()
  title: string;

  @IsUUID()
  chapterId: string;
}
