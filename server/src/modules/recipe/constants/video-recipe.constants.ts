export const VIDEO_RECIPE_QUEUE_NAME = 'recipe-video';
export const VIDEO_RECIPE_JOB_NAME = 'parse-video';

export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024;
export const MAX_VIDEO_DURATION_SECONDS = 30 * 60;
export const MAX_VIDEO_FRAME_COUNT = 8;
export const MAX_VIDEO_OCR_FRAME_COUNT = 40;
export const VIDEO_JOB_RETENTION_SECONDS = 24 * 60 * 60;

export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov'] as const;
export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime'] as const;

export const VIDEO_RECIPE_STAGE_VALUES = [
  'validating',
  'extracting',
  'transcribing',
  'analyzing',
  'saving',
] as const;
