// src/content/dto/create-chapter.dto.ts
import { IsString, IsUUID } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  title: string;

  @IsUUID()
  subjectId: string;
}
