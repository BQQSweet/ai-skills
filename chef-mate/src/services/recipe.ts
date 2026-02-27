import { get, post } from "./request";

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

/**
 * 以现有食材请求 AI 灵感食谱
 */
export function generateAiRecipe(params: {
  ingredients: string[];
  taste?: string;
  mealType?: string;
  servings?: number;
}) {
  return post<Recipe>("/api/recipe/ai-generate", params);
}

/**
 * 针对食谱步骤向 AI 提问
 */
export function askStepQuestion(params: {
  recipeContext: string;
  stepInstruction: string;
  question: string;
}) {
  // 必须把 responseType 声明为 text 或手动处理，因为后端这里返回纯文本而不是对象封装的 code/data
  return post<string>("/api/recipe/ask-step", params);
}
