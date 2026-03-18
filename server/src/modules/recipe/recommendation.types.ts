import type { Recipe } from '@prisma/client';

export interface RecommendContext {
  userId?: string;
  mealTag: string;
  tastePreference: string | null;
  dietaryPreference: string | null;
  preferenceVersion: string;
  profileSignals: {
    tastePreference: string | null;
    dietaryPreference: string | null;
  };
  behaviorSignals: {
    favoriteRecipeIds: string[];
    recentFavoriteRecipeIds: string[];
    recentCookedRecipeIds3d: string[];
    recentCookedRecipeIds7d: string[];
  };
  stableCount: number;
  exploreCount: number;
  requestRefresh: boolean;
  strategyVersion: string;
}

export interface RecommendationSignals {
  mealMatch: boolean;
  tasteMatch: boolean;
  dietaryMatch: boolean;
  recentCookPenalty: number;
  favoriteBoost: number;
  noveltyBoost: number;
  diversityPenalty: number;
}

export interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  signals: RecommendationSignals;
  stableEligible: boolean;
}

export interface RecommendationResult {
  recipes: Recipe[];
  mealTag: string;
  stableCount: number;
  exploreCount: number;
  cacheHit: boolean;
  strategyVersion: string;
}

export interface StableRecommendationCachePayload {
  recipeIds: string[];
  strategyVersion: string;
  generatedAt: string;
}
