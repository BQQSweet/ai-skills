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
  details?: string[];
  estimated?: boolean;
  evidence_sources?: Array<"visual" | "ocr" | "asr" | "inferred">;
  evidence_start_sec?: number;
  evidence_end_sec?: number;
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
  source_url?: string | null;
  source_type: string;
  tags: string[];
  status: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export type VideoRecipeStatus = "queued" | "processing" | "completed" | "failed";
export type VideoRecipeMode = "strict" | "assisted";

export type VideoRecipeStage =
  | "validating"
  | "extracting"
  | "transcribing"
  | "analyzing"
  | "saving";

export type VideoRecipePageState =
  | "idle"
  | "selected"
  | "uploading"
  | "processing"
  | "done"
  | "failed";

export interface SubmitVideoRecipeJobResult {
  jobId: string;
  status: "queued";
  mode: VideoRecipeMode;
}

export interface VideoRecipeJobStatus {
  jobId: string;
  status: VideoRecipeStatus;
  progress: number;
  stage: VideoRecipeStage;
  mode: VideoRecipeMode;
  recipeId?: string;
  recipe?: Recipe;
  error?: string;
}

export interface VideoRecipeSelectedFile {
  path: string;
  name: string;
  size: number;
  duration: number;
}

export interface VideoRecipeIngredientAvailability extends RecipeIngredient {
  inFridge: boolean;
  matchedName?: string;
}

export type VideoRecipeIngredientType = "ingredient" | "seasoning";

export interface VideoRecipeClassifiedIngredient
  extends VideoRecipeIngredientAvailability {
  type: VideoRecipeIngredientType;
  selectedByDefault: boolean;
  key: string;
}
