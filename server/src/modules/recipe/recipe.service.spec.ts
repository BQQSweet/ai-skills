import { RecipeService } from './recipe.service';

describe('RecipeService recommendation', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
    recipe: {
      findMany: jest.fn(),
    },
    recipeFavorite: {
      findMany: jest.fn(),
    },
    cookingHistory: {
      findMany: jest.fn(),
    },
  };

  const cache = {
    getStableRecipeIds: jest.fn(),
    setStableRecipeIds: jest.fn(),
    delete: jest.fn(),
  };

  let service: RecipeService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-03-18T18:00:00.000Z'));

    prisma.user.findUnique.mockResolvedValue({
      taste_preference: '清淡',
      dietary_preference: '高蛋白',
    });
    prisma.recipeFavorite.findMany.mockResolvedValue([]);
    prisma.cookingHistory.findMany.mockResolvedValue([]);
    cache.getStableRecipeIds.mockResolvedValue(null);
    cache.setStableRecipeIds.mockResolvedValue(undefined);
    cache.delete.mockResolvedValue(undefined);

    service = new RecipeService(prisma as any, {} as any, cache as any);
    jest.spyOn(service as any, 'getMealTagByHour').mockReturnValue('晚餐');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps stable slots consistent when cache is hit in the same meal period', async () => {
    prisma.recipe.findMany.mockResolvedValue([
      createRecipe('recipe-1', ['晚餐', '清淡']),
      createRecipe('recipe-2', ['晚餐']),
      createRecipe('recipe-3', ['晚餐', '高蛋白']),
      createRecipe('recipe-4', ['晚餐']),
      createRecipe('recipe-5', ['晚餐']),
      createRecipe('recipe-6', ['晚餐']),
    ]);

    const firstResult = await service.recommend('user-1');
    const cachedPayload = cache.setStableRecipeIds.mock.calls[0]?.[1];

    cache.getStableRecipeIds.mockResolvedValue(cachedPayload.recipeIds);

    const secondResult = await service.recommend('user-1');

    expect(firstResult.cacheHit).toBe(false);
    expect(secondResult.cacheHit).toBe(true);
    expect(secondResult.recipes.slice(0, 4).map((item) => item.id)).toEqual(
      cachedPayload.recipeIds,
    );
    expect(secondResult.mealTag).toBe('晚餐推荐');
    expect(secondResult.strategyVersion).toBe('recipe-recommend-v1');
  });

  it('bypasses the cached stable list when refresh is requested', async () => {
    prisma.recipe.findMany.mockResolvedValue([
      createRecipe('recipe-1', ['晚餐']),
      createRecipe('recipe-2', ['晚餐']),
      createRecipe('recipe-3', ['晚餐']),
      createRecipe('recipe-4', ['晚餐']),
      createRecipe('recipe-5', ['晚餐']),
      createRecipe('recipe-6', ['晚餐']),
    ]);
    cache.getStableRecipeIds.mockResolvedValue([
      'recipe-1',
      'recipe-2',
      'recipe-3',
      'recipe-4',
    ]);

    const result = await service.recommend('user-1', { refresh: true });

    expect(cache.delete).toHaveBeenCalledTimes(1);
    expect(cache.getStableRecipeIds).not.toHaveBeenCalled();
    expect(cache.setStableRecipeIds).toHaveBeenCalledTimes(1);
    expect(result.cacheHit).toBe(false);
  });

  it('boosts favorited recipes when other signals are similar', () => {
    const context = {
      userId: 'user-1',
      mealTag: '晚餐',
      tastePreference: null,
      dietaryPreference: null,
      preferenceVersion: 'v1',
      profileSignals: {
        tastePreference: null,
        dietaryPreference: null,
      },
      behaviorSignals: {
        favoriteRecipeIds: ['favorite-recipe'],
        recentFavoriteRecipeIds: ['favorite-recipe'],
        recentCookedRecipeIds3d: [],
        recentCookedRecipeIds7d: [],
      },
      stableCount: 4,
      exploreCount: 2,
      requestRefresh: false,
      strategyVersion: 'recipe-recommend-v1',
    };
    const signals = (service as any).buildRecommendationSignals(context);

    const favoriteScore = (service as any).scoreRecipe(
      createRecipe('favorite-recipe', ['晚餐']),
      signals,
    );
    const normalScore = (service as any).scoreRecipe(
      createRecipe('normal-recipe', ['晚餐']),
      signals,
    );

    expect(favoriteScore.score).toBeGreaterThan(normalScore.score);
    expect(favoriteScore.signals.favoriteBoost).toBeGreaterThan(0);
  });

  it('filters out recipes whose meal tags conflict with the current meal period', async () => {
    prisma.recipe.findMany.mockResolvedValue([
      createRecipe('breakfast-only', ['早餐']),
      createRecipe('dinner-1', ['晚餐']),
      createRecipe('dinner-2', ['晚餐']),
      createRecipe('dinner-3', ['晚餐']),
      createRecipe('dinner-4', ['晚餐']),
      createRecipe('dinner-5', ['晚餐']),
      createRecipe('dinner-6', ['晚餐']),
    ]);

    const result = await service.recommend('user-1');

    expect(result.recipes.some((item) => item.id === 'breakfast-only')).toBe(
      false,
    );
  });
});

function createRecipe(id: string, tags: string[]) {
  return {
    id,
    title: id,
    description: null,
    ingredients: [],
    steps: [],
    nutrition: null,
    difficulty: '简单',
    cook_time: 15,
    servings: 2,
    cover_url: null,
    source_type: 'manual',
    source_url: null,
    tags,
    status: 'published',
    created_by: null,
    created_at: new Date('2026-03-10T12:00:00.000Z'),
    updated_at: new Date('2026-03-10T12:00:00.000Z'),
    deleted_at: null,
  };
}
