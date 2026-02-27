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

import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class GenerateRecipeDto {
  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsOptional()
  taste?: string;

  @IsString()
  @IsOptional()
  dietary?: string;

  @IsNumber()
  @IsOptional()
  servings?: number;
}

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-recipe')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async generateRecipe(@Body() dto: GenerateRecipeDto) {
    if (!dto.prompt && !dto.taste && !dto.dietary) {
      throw new BadRequestException(
        'At least one of prompt, taste, or dietary is required',
      );
    }
    const result = await this.aiService.generateRecipe(dto);
    return result;
  }
}
