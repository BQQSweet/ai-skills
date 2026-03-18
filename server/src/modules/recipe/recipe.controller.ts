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
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { RecipeService } from './recipe.service';
import {
  CreateRecipeDto,
  UpdateRecipeDto,
  QueryRecipeDto,
  RecommendRecipeQueryDto,
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
  async recommend(
    @CurrentUser('id') userId: string,
    @Query() query: RecommendRecipeQueryDto,
  ) {
    return this.recipeService.recommend(userId, {
      refresh: query.refresh === 1,
    });
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

  @Post('tts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '将给定的步骤文本转换为语音 (返回 Base64)' })
  async generateVoice(@Body() body: { text: string }) {
    if (!body.text) {
      throw new BadRequestException('text is required');
    }
    return { audioBase64: await this.recipeService.generateTts(body.text) };
  }

  @Post('parse-intent')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '解析本地语音识别的文本指令意图' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
    },
  })
  async parseIntent(@Body() body: { text: string }) {
    if (!body.text) {
      throw new BadRequestException('text is required');
    }
    return this.recipeService.parseCommandIntent(body.text);
  }

  @Post('voice-command')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '处理语音流，提取控制意图' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async processVoiceCommand(@UploadedFile() file: Express.Multer.File) {
    return this.recipeService.processVoiceCommand(file);
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
