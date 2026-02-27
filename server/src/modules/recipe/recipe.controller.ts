import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecipeService } from './recipe.service';
import {
  CreateRecipeDto,
  UpdateRecipeDto,
  QueryRecipeDto,
} from './dto/recipe.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AdminGuard } from '@/common/guards/admin.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('recipe')
@Controller('api/recipe')
@ApiBearerAuth()
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: '创建食谱（管理员）' })
  async create(
    @Body() dto: CreateRecipeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.recipeService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: '分页查询食谱列表' })
  async findAll(@Query() query: QueryRecipeDto) {
    return this.recipeService.findAll(query);
  }

  @Get('recommend')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '首页基于时间的菜谱推荐' })
  async recommend(@CurrentUser('id') userId: string) {
    return this.recipeService.recommend(userId);
  }

  @Post('ai-generate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '基于给定食材生成 AI 食谱' })
  async generateAiRecipe(
    @Body()
    body: {
      ingredients: string[];
      taste?: string;
      mealType?: string;
      servings?: number;
    },
    @CurrentUser('id') userId: string,
  ) {
    return this.recipeService.generateAiRecipe(body, userId);
  }

  @Post('ask-step')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '针对某一个烹饪步骤向 AI 提问' })
  async askStep(@Body() body: import('./dto/ask-step.dto').AskStepDto) {
    return this.recipeService.askStepQuestion(body);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取食谱详情' })
  async findOne(@Param('id') id: string) {
    return this.recipeService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: '更新食谱（管理员）' })
  async update(@Param('id') id: string, @Body() dto: UpdateRecipeDto) {
    return this.recipeService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: '删除食谱（管理员）' })
  async remove(@Param('id') id: string) {
    return this.recipeService.remove(id);
  }
}
