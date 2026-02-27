import axios from "axios";

export interface RecipeItem {
  id: string;
  title: string;
  description?: string;
  ingredients: any[];
  steps: any[];
  nutrition?: any;
  difficulty: string;
  cook_time: number;
  servings: number;
  cover_url?: string;
  source_type: string;
  tags: string[];
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  difficulty?: string;
}

export interface RecipeListRes {
  list: RecipeItem[];
  total: number;
  page: number;
  pageSize: number;
}

export function getRecipeList(params: RecipeListQuery) {
  return axios.get<RecipeListRes>("/api/recipe", { params });
}

export function getRecipeDetail(id: string) {
  return axios.get<RecipeItem>(`/api/recipe/${id}`);
}

export function createRecipe(data: Partial<RecipeItem>) {
  return axios.post<RecipeItem>("/api/recipe", data);
}

export function updateRecipe(id: string, data: Partial<RecipeItem>) {
  return axios.put<RecipeItem>(`/api/recipe/${id}`, data);
}

export function deleteRecipe(id: string) {
  return axios.delete(`/api/recipe/${id}`);
}

export function generateRecipeAi(data: {
  prompt?: string;
  taste?: string;
  dietary?: string;
  servings?: number;
}) {
  return axios.post<any>("/api/ai/generate-recipe", data);
}
