import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { Recipe } from '@prisma/client';
import { PrismaService } from '@/common/prisma.service';
import { AiService } from '@/ai/ai.service';
import {
  CreateRecipeDto,
  UpdateRecipeDto,
  QueryRecipeDto,
} from './dto/recipe.dto';
import { RecommendationCacheService } from './recommendation-cache.service';
import type {
  RecommendContext,
  RecommendationResult,
  RecommendationSignals,
  ScoredRecipe,
  StableRecommendationCachePayload,
} from './recommendation.types';

const STABLE_RECIPE_COUNT = 4;
const EXPLORE_RECIPE_COUNT = 2;
const TOTAL_RECIPE_COUNT = STABLE_RECIPE_COUNT + EXPLORE_RECIPE_COUNT;
const MAX_CANDIDATE_RECIPES = 80;
const STABLE_CACHE_TTL_SECONDS = 2 * 60 * 60;
const STRATEGY_VERSION = 'recipe-recommend-v1';
const ALL_MEAL_TAGS = ['早餐', '午餐', '下午茶', '晚餐', '夜宵'];

@Injectable()
export class RecipeService {
  private readonly logger = new Logger(RecipeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly recommendationCache: RecommendationCacheService,
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
        source_url: dto.source_url,
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
        source_url: dto.source_url ?? undefined,
      },
    });
  }

  async saveParsedRecipe(
    dto: {
      title: string;
      description?: string;
      ingredients: any[];
      steps: any[];
      nutrition?: any;
      difficulty: string;
      cook_time: number;
      servings?: number;
      cover_url?: string | null;
      source_url?: string | null;
      tags?: string[];
    },
    userId?: string,
    sourceType = 'video_parsed',
  ) {
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
        cover_url: dto.cover_url || null,
        source_type: sourceType,
        source_url: dto.source_url || null,
        tags: dto.tags ?? [],
        status: 'published',
        created_by: userId,
      },
    });
  }

  async updateParsedRecipe(
    id: string,
    dto: {
      title?: string;
      description?: string;
      ingredients?: any[];
      steps?: any[];
      nutrition?: any;
      difficulty?: string;
      cook_time?: number;
      servings?: number;
      cover_url?: string | null;
      source_url?: string | null;
      tags?: string[];
    },
  ) {
    await this.findOne(id);

    return this.prisma.recipe.update({
      where: { id },
      data: {
        title: dto.title ?? undefined,
        description: dto.description ?? undefined,
        ingredients: dto.ingredients ?? undefined,
        steps: dto.steps ?? undefined,
        nutrition: dto.nutrition ?? undefined,
        difficulty: dto.difficulty ?? undefined,
        cook_time: dto.cook_time ?? undefined,
        servings: dto.servings ?? undefined,
        cover_url: dto.cover_url ?? undefined,
        source_url: dto.source_url ?? undefined,
        tags: dto.tags ?? undefined,
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
  async recommend(
    userId?: string,
    options: { refresh?: boolean } = {},
  ): Promise<RecommendationResult> {
    const context = await this.resolveRecommendContext(userId, !!options.refresh);
    const candidates = await this.loadCandidateRecipes(context);
    const scoredRecipes = this.scoreRecipes(
      candidates,
      this.buildRecommendationSignals(context),
    );
    const stableSelection = await this.selectStableRecipes(scoredRecipes, context);
    const stableIds = new Set(stableSelection.recipes.map((recipe) => recipe.id));
    const exploreRecipes = this.selectExploreRecipes(
      scoredRecipes,
      stableIds,
      context,
    );

    return this.composeRecommendationResult(
      scoredRecipes,
      stableSelection.recipes,
      exploreRecipes,
      context,
      stableSelection.cacheHit,
    );
  }

  private async resolveRecommendContext(
    userId?: string,
    requestRefresh = false,
  ): Promise<RecommendContext> {
    const mealTag = this.getMealTagByHour(new Date().getHours());

    if (!userId) {
      return {
        userId,
        mealTag,
        tastePreference: null,
        dietaryPreference: null,
        preferenceVersion: this.createPreferenceVersion({
          mealTag,
          strategyVersion: STRATEGY_VERSION,
        }),
        profileSignals: {
          tastePreference: null,
          dietaryPreference: null,
        },
        behaviorSignals: {
          favoriteRecipeIds: [],
          recentFavoriteRecipeIds: [],
          recentCookedRecipeIds3d: [],
          recentCookedRecipeIds7d: [],
        },
        stableCount: STABLE_RECIPE_COUNT,
        exploreCount: EXPLORE_RECIPE_COUNT,
        requestRefresh,
        strategyVersion: STRATEGY_VERSION,
      };
    }

    const sevenDaysAgo = this.getDaysAgoDate(7);
    const threeDaysAgo = this.getDaysAgoDate(3);

    const [user, favorites, histories] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { taste_preference: true, dietary_preference: true },
      }),
      this.prisma.recipeFavorite.findMany({
        where: { user_id: userId },
        select: { recipe_id: true, created_at: true },
      }),
      this.prisma.cookingHistory.findMany({
        where: {
          user_id: userId,
          cooked_at: { gte: sevenDaysAgo },
        },
        select: { recipe_id: true, cooked_at: true },
      }),
    ]);

    const favoriteRecipeIds = favorites.map((item) => item.recipe_id);
    const recentFavoriteRecipeIds = favorites
      .filter((item) => item.created_at >= sevenDaysAgo)
      .map((item) => item.recipe_id);
    const recentCookedRecipeIds7d = histories.map((item) => item.recipe_id);
    const recentCookedRecipeIds3d = histories
      .filter((item) => item.cooked_at >= threeDaysAgo)
      .map((item) => item.recipe_id);

    return {
      userId,
      mealTag,
      tastePreference: user?.taste_preference ?? null,
      dietaryPreference: user?.dietary_preference ?? null,
      preferenceVersion: this.createPreferenceVersion({
        mealTag,
        tastePreference: user?.taste_preference ?? null,
        dietaryPreference: user?.dietary_preference ?? null,
        favoriteRecipeIds: favoriteRecipeIds.slice().sort(),
        recentCookedRecipeIds7d: recentCookedRecipeIds7d.slice().sort(),
        strategyVersion: STRATEGY_VERSION,
      }),
      profileSignals: {
        tastePreference: user?.taste_preference ?? null,
        dietaryPreference: user?.dietary_preference ?? null,
      },
      behaviorSignals: {
        favoriteRecipeIds,
        recentFavoriteRecipeIds,
        recentCookedRecipeIds3d,
        recentCookedRecipeIds7d,
      },
      stableCount: STABLE_RECIPE_COUNT,
      exploreCount: EXPLORE_RECIPE_COUNT,
      requestRefresh,
      strategyVersion: STRATEGY_VERSION,
    };
  }

  private async loadCandidateRecipes(context: RecommendContext): Promise<Recipe[]> {
    const recipes = await this.prisma.recipe.findMany({
      where: {
        status: 'published',
        deleted_at: null,
      },
      take: MAX_CANDIDATE_RECIPES,
      orderBy: { created_at: 'desc' },
    });

    const filteredRecipes = recipes.filter(
      (recipe) => !this.hasMealTagConflict(recipe, context),
    );

    // 当当前餐段标签把候选全部筛空时，回退到所有已发布食谱，
    // 避免首页一直处于“有请求但无可展示内容”的状态。
    return filteredRecipes.length > 0 ? filteredRecipes : recipes;
  }

  private buildRecommendationSignals(context: RecommendContext) {
    return {
      mealTag: context.mealTag,
      tastePreference: context.tastePreference,
      dietaryPreference: context.dietaryPreference,
      mealWeight: 10,
      tasteWeight: 5,
      dietaryWeight: 5,
      recentCookPenalty3d: 12,
      recentCookPenalty7d: 5,
      favoriteBoost: 2,
      recentFavoriteBoost: 1,
      noveltyMaxBoost: 2,
      noveltyWindowDays: 14,
      recentCookedRecipeIds3d: new Set(
        context.behaviorSignals.recentCookedRecipeIds3d,
      ),
      recentCookedRecipeIds7d: new Set(
        context.behaviorSignals.recentCookedRecipeIds7d,
      ),
      favoriteRecipeIds: new Set(context.behaviorSignals.favoriteRecipeIds),
      recentFavoriteRecipeIds: new Set(
        context.behaviorSignals.recentFavoriteRecipeIds,
      ),
    };
  }

  private scoreRecipes(
    recipes: Recipe[],
    signals: ReturnType<RecipeService['buildRecommendationSignals']>,
  ): ScoredRecipe[] {
    return recipes
      .map((recipe) => this.scoreRecipe(recipe, signals))
      .sort((a, b) => b.score - a.score);
  }

  private scoreRecipe(
    recipe: Recipe,
    signals: ReturnType<RecipeService['buildRecommendationSignals']>,
  ): ScoredRecipe {
    const tags = recipe.tags || [];
    const mealMatch = tags.includes(signals.mealTag);
    const tasteMatch = !!signals.tastePreference
      && tags.includes(signals.tastePreference);
    const dietaryMatch = !!signals.dietaryPreference
      && tags.includes(signals.dietaryPreference);

    let recentCookPenalty = 0;
    if (signals.recentCookedRecipeIds3d.has(recipe.id)) {
      recentCookPenalty = signals.recentCookPenalty3d;
    } else if (signals.recentCookedRecipeIds7d.has(recipe.id)) {
      recentCookPenalty = signals.recentCookPenalty7d;
    }

    const favoriteBoost = signals.favoriteRecipeIds.has(recipe.id)
      ? signals.favoriteBoost
      : 0;
    const recentFavoriteBoost = signals.recentFavoriteRecipeIds.has(recipe.id)
      ? signals.recentFavoriteBoost
      : 0;
    const noveltyBoost = this.calculateNoveltyBoost(
      recipe.created_at,
      signals.noveltyWindowDays,
      signals.noveltyMaxBoost,
    );

    const score =
      (mealMatch ? signals.mealWeight : 0)
      + (tasteMatch ? signals.tasteWeight : 0)
      + (dietaryMatch ? signals.dietaryWeight : 0)
      + favoriteBoost
      + recentFavoriteBoost
      + noveltyBoost
      - recentCookPenalty;

    const recommendationSignals: RecommendationSignals = {
      mealMatch,
      tasteMatch,
      dietaryMatch,
      recentCookPenalty,
      favoriteBoost: favoriteBoost + recentFavoriteBoost,
      noveltyBoost,
      diversityPenalty: 0,
    };

    return {
      recipe,
      score,
      signals: recommendationSignals,
      stableEligible: !signals.recentCookedRecipeIds3d.has(recipe.id),
    };
  }

  private async selectStableRecipes(
    scoredRecipes: ScoredRecipe[],
    context: RecommendContext,
  ): Promise<{ recipes: Recipe[]; cacheHit: boolean }> {
    const cacheKey = this.buildStableCacheKey(context);

    if (context.requestRefresh) {
      await this.recommendationCache.delete(cacheKey);
    } else {
      const cachedIds = await this.recommendationCache.getStableRecipeIds(cacheKey);
      const cachedRecipes = this.getRecipesFromIds(scoredRecipes, cachedIds);
      if (
        cachedRecipes.length >= Math.min(context.stableCount, scoredRecipes.length)
      ) {
        return {
          recipes: cachedRecipes.slice(0, context.stableCount),
          cacheHit: true,
        };
      }
    }

    const stablePool = this.getHighScorePool(
      scoredRecipes.filter((item) => item.stableEligible),
      context.stableCount,
    );
    const selectedStable = this.pickWeightedRecipes(
      stablePool,
      context.stableCount,
    );

    if (selectedStable.length > 0) {
      const payload: StableRecommendationCachePayload = {
        recipeIds: selectedStable.map((item) => item.recipe.id),
        strategyVersion: context.strategyVersion,
        generatedAt: new Date().toISOString(),
      };
      await this.recommendationCache.setStableRecipeIds(
        cacheKey,
        payload,
        STABLE_CACHE_TTL_SECONDS,
      );
    }

    return {
      recipes: selectedStable.map((item) => item.recipe),
      cacheHit: false,
    };
  }

  private selectExploreRecipes(
    scoredRecipes: ScoredRecipe[],
    stableIds: Set<string>,
    context: RecommendContext,
  ): Recipe[] {
    const explorePool = this.getHighScorePool(
      scoredRecipes.filter((item) => !stableIds.has(item.recipe.id)),
      context.exploreCount,
    );

    return this.pickWeightedRecipes(explorePool, context.exploreCount).map(
      (item) => item.recipe,
    );
  }

  private composeRecommendationResult(
    scoredRecipes: ScoredRecipe[],
    stableRecipes: Recipe[],
    exploreRecipes: Recipe[],
    context: RecommendContext,
    cacheHit: boolean,
  ): RecommendationResult {
    const recipes: Recipe[] = [];
    const selectedIds = new Set<string>();

    for (const recipe of [...stableRecipes, ...exploreRecipes]) {
      if (selectedIds.has(recipe.id)) {
        continue;
      }
      recipes.push(recipe);
      selectedIds.add(recipe.id);
    }

    for (const item of scoredRecipes) {
      if (recipes.length >= TOTAL_RECIPE_COUNT) {
        break;
      }
      if (selectedIds.has(item.recipe.id)) {
        continue;
      }
      recipes.push(item.recipe);
      selectedIds.add(item.recipe.id);
    }

    return {
      recipes,
      mealTag: `${context.mealTag}推荐`,
      stableCount: Math.min(context.stableCount, stableRecipes.length),
      exploreCount: Math.min(context.exploreCount, exploreRecipes.length),
      cacheHit,
      strategyVersion: context.strategyVersion,
    };
  }

  private getHighScorePool(
    scoredRecipes: ScoredRecipe[],
    desiredCount: number,
  ): ScoredRecipe[] {
    const sorted = scoredRecipes.slice().sort((a, b) => b.score - a.score);
    const poolSize = Math.min(
      sorted.length,
      Math.max(desiredCount * 3, desiredCount + 4),
    );
    return sorted.slice(0, poolSize);
  }

  private pickWeightedRecipes(
    scoredRecipes: ScoredRecipe[],
    desiredCount: number,
  ): ScoredRecipe[] {
    const pool = scoredRecipes.slice();
    const selected: ScoredRecipe[] = [];

    while (pool.length > 0 && selected.length < desiredCount) {
      const minScore = Math.min(...pool.map((item) => item.score));
      const weights = pool.map((item) => Math.max(item.score - minScore + 1, 0.5));
      const weightSum = weights.reduce((sum, value) => sum + value, 0);
      let random = Math.random() * weightSum;
      let chosenIndex = 0;

      for (let index = 0; index < weights.length; index += 1) {
        random -= weights[index];
        if (random <= 0) {
          chosenIndex = index;
          break;
        }
      }

      const [chosen] = pool.splice(chosenIndex, 1);
      selected.push(chosen);
    }

    return selected;
  }

  private getRecipesFromIds(
    scoredRecipes: ScoredRecipe[],
    recipeIds: string[] | null,
  ): Recipe[] {
    if (!recipeIds || recipeIds.length === 0) {
      return [];
    }

    const recipeMap = new Map(
      scoredRecipes.map((item) => [item.recipe.id, item.recipe]),
    );

    return recipeIds
      .map((recipeId) => recipeMap.get(recipeId))
      .filter((recipe): recipe is Recipe => !!recipe);
  }

  private buildStableCacheKey(context: RecommendContext): string {
    return [
      'recipe:recommend:stable',
      context.userId || 'anonymous',
      context.mealTag,
      context.preferenceVersion,
    ].join(':');
  }

  private hasMealTagConflict(recipe: Recipe, context: RecommendContext): boolean {
    const recipeMealTags = (recipe.tags || []).filter((tag) =>
      ALL_MEAL_TAGS.includes(tag),
    );

    return recipeMealTags.length > 0
      && !recipeMealTags.includes(context.mealTag);
  }

  private getMealTagByHour(hour: number): string {
    if (hour >= 5 && hour < 10) {
      return '早餐';
    }
    if (hour >= 10 && hour < 14) {
      return '午餐';
    }
    if (hour >= 14 && hour < 17) {
      return '下午茶';
    }
    if (hour >= 17 && hour < 21) {
      return '晚餐';
    }
    return '夜宵';
  }

  private getDaysAgoDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  private calculateNoveltyBoost(
    createdAt: Date,
    noveltyWindowDays: number,
    noveltyMaxBoost: number,
  ): number {
    const ageInMs = Date.now() - createdAt.getTime();
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24);
    if (ageInDays >= noveltyWindowDays) {
      return 0;
    }

    const freshnessRatio = (noveltyWindowDays - ageInDays) / noveltyWindowDays;
    return Number((freshnessRatio * noveltyMaxBoost).toFixed(2));
  }

  private createPreferenceVersion(payload: Record<string, unknown>): string {
    const raw = JSON.stringify(payload);
    let hash = 0;

    for (let index = 0; index < raw.length; index += 1) {
      hash = (hash * 31 + raw.charCodeAt(index)) >>> 0;
    }

    return hash.toString(16);
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
