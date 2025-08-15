import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AskQuestionDto {
  @ApiProperty({
    description: 'Question to ask about the subchapter content',
    example: 'Bagaimana cara menyelesaikan persamaan linear satu variabel?',
  })
  @IsString()
  question: string;
}
