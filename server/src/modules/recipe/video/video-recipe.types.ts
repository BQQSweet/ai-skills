import type { Recipe } from '@prisma/client';
import type { VideoTitleSource } from './recipe-video-title';

export type VideoRecipeStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type VideoRecipeMode = 'strict' | 'assisted';
export type VideoEvidenceSource = 'visual' | 'ocr' | 'asr' | 'inferred';

export type VideoRecipeStage =
  | 'validating'
  | 'extracting'
  | 'transcribing'
  | 'analyzing'
  | 'saving';

export interface VideoRecipeProgressPayload {
  stage: VideoRecipeStage;
  progress: number;
}

export interface VideoRecipeJobData {
  userId: string;
  filePath: string;
  originalName: string;
  mimeType: string;
  size: number;
  durationSeconds: number;
  mode: VideoRecipeMode;
}

export interface VideoRecipeJobResult {
  recipeId: string;
}

export interface TimedVideoFrame {
  path: string;
  timeSec: number;
}

export interface VideoFrameOcrPayload {
  timeSec: number;
  originalFrame: string;
  focusCrops?: string[];
}

export interface OcrTextEntry {
  timeSec: number;
  texts: string[];
}

export type OcrTextSpanKind = 'ingredient_card' | 'subtitle' | 'noise';

export interface OcrTextSpan {
  startSec: number;
  endSec: number;
  texts: string[];
  normalizedTexts: string[];
  fingerprint: string;
  kind: OcrTextSpanKind;
}

export interface TimelineCandidateStep {
  instruction: string;
  start_sec: number;
  end_sec: number;
  duration_min?: number;
  timer_required?: boolean;
  evidence_sources: VideoEvidenceSource[];
  origin?: 'ocr_direct' | 'ai_segment';
}

export interface TimelineRecipeStep {
  order: number;
  instruction: string;
  duration_min?: number;
  timer_required?: boolean;
  details?: string[];
  estimated?: boolean;
  evidence_sources: VideoEvidenceSource[];
  evidence_start_sec: number;
  evidence_end_sec: number;
}

export interface VideoRecipeMetadata {
  title: string;
  description: string;
  difficulty: '简单' | '中等' | '困难';
  servings: number;
  cover_url: string | null;
  source_url: string | null;
  tags: string[];
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    optional: boolean;
  }>;
  nutrition: Record<string, unknown> | null;
}

export interface CachedVideoRecipeEvidence {
  version: 'video-recipe-cache-v1';
  jobId: string;
  userId: string;
  recipeId?: string;
  currentMode: VideoRecipeMode;
  createdAt: string;
  expiresAt: string;
  durationSeconds: number;
  fallbackTitle: string;
  sanitizedFileTitle?: string;
  titleSource?: VideoTitleSource;
  transcript: string;
  analysisFrames: TimedVideoFrame[];
  ocrEntries: OcrTextEntry[];
  ocrSpans?: OcrTextSpan[];
  segmentCandidates: TimelineCandidateStep[];
  strictSteps: TimelineRecipeStep[];
  metadata?: VideoRecipeMetadata;
}

export interface VideoRecipeJobStatusResponse {
  jobId: string;
  status: VideoRecipeStatus;
  progress: number;
  stage: VideoRecipeStage;
  mode: VideoRecipeMode;
  recipeId?: string;
  recipe?: Recipe;
  error?: string;
}
