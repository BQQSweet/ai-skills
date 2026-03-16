export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
}

export interface RecipeStep {
  order?: number;
  instruction: string;
  duration_min?: number;
  timer_required?: boolean;
}

export interface RecipeNutrition {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutrition?: RecipeNutrition;
  difficulty: string;
  cook_time: number;
  servings: number;
  cover_url?: string;
  source_type: string;
  tags: string[];
  status: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
