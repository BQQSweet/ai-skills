import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { AiService } from '@/ai/ai.service';
import {
  CreateRecipeDto,
  UpdateRecipeDto,
  QueryRecipeDto,
} from './dto/recipe.dto';

@Injectable()
export class RecipeService {
  private readonly logger = new Logger(RecipeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * 基于给定的食材列表和用户偏好生成 AI 灵感食谱
   */
  async generateAiRecipe(
    params: {
      ingredients: string[];
      taste?: string;
      mealType?: string;
      servings?: number;
    },
    userId?: string,
  ) {
    let userTaste: string | null | undefined = params.taste;
    let userDietary = null;

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { taste_preference: true, dietary_preference: true },
      });
      if (user) {
        if (!userTaste) userTaste = user.taste_preference;
        userDietary = user.dietary_preference;
      }
    }

    const { ingredients = [], mealType = '正餐', servings = 2 } = params;

    let prompt =
      ingredients.length > 0
        ? `请使用以下食材作为主要材料：${ingredients.join('、')}。`
        : '请随机给我推荐一道应季家常菜。';

    prompt += `这是一个适合【${mealType}】的菜谱。`;

    return this.aiService.generateRecipe({
      prompt,
      taste: userTaste || undefined,
      dietary: userDietary || undefined,
      servings: Number(servings),
    });
  }

  async askStepQuestion(dto: import('./dto/ask-step.dto').AskStepDto) {
    return this.aiService.answerStepQuestion(dto);
  }

  async generateTts(text: string) {
    return this.aiService.generateSpeech(text);
  }

  /**
   * 创建食谱
   */
  async create(dto: CreateRecipeDto, userId?: string) {
    return this.prisma.recipe.create({
      data: {
        title: dto.title,
        description: dto.description,
        ingredients: dto.ingredients,
        steps: dto.steps,
        nutrition: dto.nutrition,
        difficulty: dto.difficulty,
        cook_time: dto.cook_time,
        servings: dto.servings ?? 2,
        cover_url: dto.cover_url,
        source_type: dto.source_type ?? 'manual',
        tags: dto.tags ?? [],
        status: dto.status ?? 'published',
        created_by: userId,
      },
    });
  }

  /**
   * 分页查询食谱列表
   */
  async findAll(query: QueryRecipeDto) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {
      deleted_at: null,
    };

    if (query.keyword) {
      where.title = { contains: query.keyword, mode: 'insensitive' };
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    const [list, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  /**
   * 获取单个食谱详情
   */
  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });
    if (!recipe || recipe.deleted_at) {
      throw new NotFoundException('食谱不存在');
    }
    return recipe;
  }

  /**
   * 更新食谱
   */
  async update(id: string, dto: UpdateRecipeDto) {
    await this.findOne(id); // 确认存在
    return this.prisma.recipe.update({
      where: { id },
      data: {
        ...dto,
        ingredients: dto.ingredients ?? undefined,
        steps: dto.steps ?? undefined,
        nutrition: dto.nutrition ?? undefined,
      },
    });
  }

  /**
   * 软删除食谱
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.recipe.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * 基于时间与偏好推荐食谱
   */
  async recommend(userId?: string) {
    const currentHour = new Date().getHours();
    let mealTag = '';

    // 简单时间段划分
    if (currentHour >= 5 && currentHour < 10) {
      mealTag = '早餐';
    } else if (currentHour >= 10 && currentHour < 14) {
      mealTag = '午餐';
    } else if (currentHour >= 14 && currentHour < 17) {
      mealTag = '下午茶';
    } else if (currentHour >= 17 && currentHour < 21) {
      mealTag = '晚餐';
    } else {
      mealTag = '夜宵';
    }

    let userTaste = null;
    let userDietary = null;

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { taste_preference: true, dietary_preference: true },
      });
      if (user) {
        userTaste = user.taste_preference;
        userDietary = user.dietary_preference;
      }
    }

    // 收集偏好标签
    const preferenceTags = [mealTag, userTaste, userDietary].filter(Boolean);

    // 尝试找出包含部分或全部匹配标签的食谱
    // Prisma 中对于 PostgreSQL 的 String[] 数组字段查询
    const recipes = await this.prisma.recipe.findMany({
      where: {
        status: 'published',
        deleted_at: null,
        // 这里使用 array_contains 或者简单起见我们就拉取比较近的随机筛选，或者交由业务逻辑来打分排序
        // 为了简单高效演示：先查出所有published食谱，在内存中做打分排序并取前5，防止数据量少时查不到
      },
      take: 50, // 从最近的50条中选
      orderBy: { created_at: 'desc' },
    });

    // 所有可能的时间段标签
    const ALL_MEAL_TAGS = ['早餐', '午餐', '下午茶', '晚餐', '夜宵'];

    const validRecipes = [];

    // 评分排序并过滤
    for (const recipe of recipes) {
      let score = 0;
      const tags = recipe.tags || [];

      // 选出该食谱包含的餐饮时间段标签
      const recipeMealTags = tags.filter((tag) => ALL_MEAL_TAGS.includes(tag));

      // 冲突检测：如果食谱包含了带有时间段的标签，但并不包含当前计算出的 mealTag，则过滤掉
      if (recipeMealTags.length > 0 && !recipeMealTags.includes(mealTag)) {
        continue; // 比如当前是晚餐，但食谱只有'早餐'或'下午茶'标签
      }

      if (tags.includes(mealTag)) score += 10;
      if (userTaste && tags.includes(userTaste)) score += 5;
      if (userDietary && tags.includes(userDietary)) score += 5;

      // 添加随机扰动，使得每次推荐不一样
      score += Math.random() * 2;
      validRecipes.push({ ...recipe, _score: score });
    }

    // 按分数降序，取前5名
    validRecipes.sort((a, b) => b._score - a._score);
    return validRecipes.slice(0, 5).map((r) => {
      const { _score, ...rest } = r;
      return rest;
    });
  }

  /**
   * 处理从前端过来的语音指令
   */
  async processVoiceCommand(
    file: Express.Multer.File,
  ): Promise<{ command: string; confidence: number; original_text: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('未接收到有效的音频文件');
    }

    try {
      this.logger.log(`Received voice command audio, size: ${file.size} bytes`);
      // 1. 将音频流交给 DashScope 进行转写
      const transcribedText = await this.aiService.transcribeAudio(file);
      this.logger.log(`Transcribed text: ${transcribedText}`);

      if (!transcribedText || transcribedText.trim() === '') {
        return { command: 'UNKNOWN', confidence: 1, original_text: '' };
      }

      // 2. 将转写文本交给 DeepSeek 提取固定操作意图
      const intent = await this.aiService.parseCommandIntent(transcribedText);
      return intent;
    } catch (error) {
      this.logger.error('Failed to process voice command', error);
      throw new BadRequestException('语音指令处理失败');
    }
  }

  /**
   * 仅解析指令意图（用于前端端侧或 H5 离线识别后）
   */
  async parseCommandIntent(
    text: string,
  ): Promise<{ command: string; confidence: number; original_text: string }> {
    try {
      if (!text || text.trim() === '') {
        return { command: 'UNKNOWN', confidence: 1, original_text: '' };
      }
      return await this.aiService.parseCommandIntent(text);
    } catch (error) {
      this.logger.error('Failed to parse intent', error);
      throw new BadRequestException('文本意图解析失败');
    }
  }
}
