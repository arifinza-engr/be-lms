import { IsNumber, Min } from 'class-validator';

export class UpdateSessionDurationDto {
  @IsNumber()
  @Min(0)
  duration: number; // Duration in seconds
}