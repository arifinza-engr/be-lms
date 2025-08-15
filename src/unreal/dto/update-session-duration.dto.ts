import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionDurationDto {
  @ApiProperty({
    description: 'Session duration in seconds',
    example: 1800,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  duration: number; // Duration in seconds
}
