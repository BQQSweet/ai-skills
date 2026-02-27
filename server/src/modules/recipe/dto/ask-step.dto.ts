import { ApiProperty } from '@nestjs/swagger';

export class AskStepDto {
  @ApiProperty({ description: 'The overall recipe context or title' })
  recipeContext: string;

  @ApiProperty({ description: 'The specific cooking step instruction' })
  stepInstruction: string;

  @ApiProperty({ description: 'The user question regarding this step' })
  question: string;
}
