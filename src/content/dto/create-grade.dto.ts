// src/content/dto/create-grade.dto.ts
import { IsString } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  title: string;
}
