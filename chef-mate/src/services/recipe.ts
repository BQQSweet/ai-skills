import { get } from "./request";

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: any;
  steps: any;
  nutrition?: any;
  difficulty: string;
  cook_time: number;
  servings: number;
  cover_url?: string;
  source_type: string;
  tags: string[];
  status: string;
}

/**
 * 获取推荐食谱
 */
export function getRecommendedRecipes() {
  return get<Recipe[]>("/api/recipe/recommend");
}
