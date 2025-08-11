// src/content/dto/create-subject.dto.ts
import { IsString, IsUUID } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  title: string;

  @IsUUID()
  gradeId: string;
}
