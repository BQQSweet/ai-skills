import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateRecipeDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-recipe')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async generateRecipe(@Body() dto: GenerateRecipeDto) {
    if (!dto.prompt) {
      throw new BadRequestException('Prompt is required');
    }
    const result = await this.aiService.generateRecipe(dto.prompt);
    return result;
  }
}
