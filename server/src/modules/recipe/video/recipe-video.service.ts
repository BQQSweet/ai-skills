import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Job, Queue } from 'bullmq';
import * as fs from 'fs/promises';
import { basename, extname, join } from 'path';
import { randomUUID } from 'crypto';
import { AiService } from '@/ai/ai.service';
import { RecipeService } from '../recipe.service';
import {
  ALLOWED_VIDEO_EXTENSIONS,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_DURATION_SECONDS,
  MAX_VIDEO_SIZE_BYTES,
  VIDEO_JOB_RETENTION_SECONDS,
  VIDEO_RECIPE_JOB_NAME,
  VIDEO_RECIPE_QUEUE_NAME,
} from '../constants/video-recipe.constants';
import { FfmpegMediaService } from './ffmpeg-media.service';
import {
  attachIngredientCardDetails,
  applyAssistedInsertions,
  buildOcrSubtitleCandidates,
  buildStrictTimelineSteps,
  buildTimelineSegments,
  dedupeSemanticSteps,
  mergeStrictModeCandidates,
  mergeOcrEntriesToSpans,
} from './recipe-video.timeline';
import {
  decideVideoRecipeTitle,
  resolveFileNameTitle,
  type VideoTitleSource,
} from './recipe-video-title';
import type {
  CachedVideoRecipeEvidence,
  OcrTextEntry,
  OcrTextSpan,
  TimelineCandidateStep,
  TimelineRecipeStep,
  TimedVideoFrame,
  VideoRecipeJobData,
  VideoRecipeJobResult,
  VideoRecipeJobStatusResponse,
  VideoRecipeMetadata,
  VideoRecipeMode,
  VideoRecipeProgressPayload,
  VideoRecipeStage,
  VideoRecipeStatus,
} from './video-recipe.types';

const UPLOADS_ROOT = join(process.cwd(), 'uploads');
const VIDEO_EVIDENCE_CACHE_ROOT = join(UPLOADS_ROOT, 'recipe-video', 'cache');
const VIDEO_EVIDENCE_CACHE_VERSION = 'video-recipe-cache-v1';

type NormalizedIngredient = {
  name: string;
  quantity: number;
  unit: string;
  optional: boolean;
};

type RecipePayload = {
  title: string;
  description: string;
  ingredients: NormalizedIngredient[];
  steps: TimelineRecipeStep[];
  nutrition: Record<string, unknown> | null;
  difficulty: '简单' | '中等' | '困难';
  cook_time: number;
  servings: number;
  cover_url: string | null;
  source_url: string | null;
  tags: string[];
  titleSource: VideoTitleSource;
};

@Injectable()
export class RecipeVideoService {
  private readonly logger = new Logger(RecipeVideoService.name);

  constructor(
    @InjectQueue(VIDEO_RECIPE_QUEUE_NAME)
    private readonly videoQueue: Queue<VideoRecipeJobData, VideoRecipeJobResult>,
    private readonly ffmpegMediaService: FfmpegMediaService,
    private readonly aiService: AiService,
    private readonly recipeService: RecipeService,
  ) {}

  async submitVideoParse(
    file: Express.Multer.File,
    userId: string,
    mode: VideoRecipeMode = 'strict',
  ) {
    if (!file?.path) {
      throw new BadRequestException('未接收到有效视频文件');
    }

    try {
      this.validateUploadedFile(file);
      const metadata = await this.ffmpegMediaService.probeVideo(file.path);

      if (!metadata.hasVideo) {
        throw new BadRequestException('仅支持上传视频文件');
      }

      if (metadata.durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
        throw new BadRequestException('视频时长不能超过 30 分钟');
      }

      const job = await this.videoQueue.add(
        VIDEO_RECIPE_JOB_NAME,
        {
          userId,
          filePath: file.path,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          durationSeconds: metadata.durationSeconds,
          mode,
        },
        {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: {
            age: VIDEO_JOB_RETENTION_SECONDS,
          },
          removeOnFail: {
            age: VIDEO_JOB_RETENTION_SECONDS,
          },
        },
      );

      await job.updateProgress({
        stage: 'validating',
        progress: 5,
      } satisfies VideoRecipeProgressPayload);

      return {
        jobId: String(job.id),
        status: 'queued' as const,
        mode,
      };
    } catch (error) {
      await this.ffmpegMediaService.removePath(file.path);
      throw error;
    }
  }

  async getJobStatus(jobId: string): Promise<VideoRecipeJobStatusResponse> {
    const job = await this.videoQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('解析任务不存在或已过期');
    }

    const state = await job.getState();
    const normalizedProgress = this.normalizeProgress(job.progress);
    const status = this.mapJobState(state);
    const cache = await this.tryLoadEvidenceCache(jobId);
    const response: VideoRecipeJobStatusResponse = {
      jobId,
      status,
      progress: normalizedProgress.progress,
      stage: normalizedProgress.stage,
      mode: cache?.currentMode || job.data.mode || 'strict',
    };

    if (status === 'completed') {
      const recipeId = (job.returnvalue as VideoRecipeJobResult | undefined)
        ?.recipeId;
      if (recipeId) {
        response.recipeId = recipeId;
        response.recipe = await this.recipeService.findOne(recipeId);
      }
      response.progress = 100;
      response.stage = 'saving';
    }

    if (status === 'failed') {
      response.error = job.failedReason || '视频解析失败，请稍后重试';
    }

    return response;
  }

  async regenerateRecipe(
    jobId: string,
    userId: string,
    mode: VideoRecipeMode,
  ) {
    const cache = await this.loadEvidenceCache(jobId, userId);

    if (!Array.isArray(cache.strictSteps) || cache.strictSteps.length === 0) {
      throw new BadRequestException('当前任务缺少可重生成的时间线证据，请重新上传视频');
    }

    if (!cache.recipeId) {
      throw new BadRequestException('当前任务还没有可重生成的食谱结果');
    }

    cache.strictSteps = this.dedupeTimelineSteps(cache.strictSteps);

    const recipePayload = await this.buildRecipePayloadFromEvidence({
      mode,
      fallbackTitle: cache.fallbackTitle,
      sanitizedFileTitle: cache.sanitizedFileTitle,
      transcript: cache.transcript,
      ocrEntries: cache.ocrEntries,
      strictSteps: cache.strictSteps,
      metadata: cache.metadata,
    });

    const recipe = await this.recipeService.updateParsedRecipe(
      cache.recipeId,
      recipePayload,
    );

    cache.currentMode = mode;
    cache.metadata = this.toCacheMetadata(recipePayload);
    cache.titleSource = recipePayload.titleSource;
    await this.persistEvidenceCache(cache);

    return {
      jobId,
      mode,
      recipe,
    };
  }

  async processVideoJob(job: Job<VideoRecipeJobData, VideoRecipeJobResult>) {
    const workDir = join(
      process.cwd(),
      'uploads',
      'recipe-video',
      'tmp',
      `job-${String(job.id)}-${randomUUID()}`,
    );
    const cacheDir = this.getEvidenceCacheDir(String(job.id));
    const analysisFrameDir = join(cacheDir, 'analysis-frames');
    const coverFramePath = join(cacheDir, 'cover.jpg');
    const ocrFrameDir = join(workDir, 'ocr-frames');
    const audioPath = join(workDir, 'audio.mp3');
    const filePathsToCleanup = [workDir, job.data.filePath];
    let keepCache = false;

    try {
      await this.ffmpegMediaService.ensureAvailable();
      await fs.mkdir(workDir, { recursive: true });
      await fs.mkdir(cacheDir, { recursive: true });

      await job.updateProgress({
        stage: 'extracting',
        progress: 15,
      } satisfies VideoRecipeProgressPayload);

      const extractedCoverFramePath =
        await this.ffmpegMediaService.extractCoverFrame(
          job.data.filePath,
          coverFramePath,
        );
      const coverUrl = extractedCoverFramePath
        ? this.filePathToUploadUrl(extractedCoverFramePath)
        : null;

      const analysisFrames = await this.ffmpegMediaService.extractKeyFrames(
        job.data.filePath,
        analysisFrameDir,
        job.data.durationSeconds,
      );
      const analysisFramePayloads = await Promise.all(
        analysisFrames.map(async (frame) => ({
          timeSec: frame.timeSec,
          image: await this.fileToDataUrl(frame.path),
        })),
      );

      await job.updateProgress({
        stage: 'transcribing',
        progress: 42,
      } satisfies VideoRecipeProgressPayload);

      const ocrEntries = await this.extractOcrEntries(
        job,
        workDir,
        ocrFrameDir,
        job.data.filePath,
        job.data.durationSeconds,
      );
      const ocrSpans = mergeOcrEntriesToSpans(ocrEntries);
      this.logger.log(
        `Merged OCR spans for job ${String(job.id)}: ${JSON.stringify(ocrSpans)}`,
      );

      const transcript = await this.extractTranscript(job.data.filePath, audioPath, job);

      await job.updateProgress({
        stage: 'analyzing',
        progress: 70,
      } satisfies VideoRecipeProgressPayload);

      if (
        analysisFramePayloads.length === 0
        && !transcript.trim()
        && ocrSpans.length === 0
      ) {
        throw new BadRequestException('未能从视频中提取有效画面、文字或音频');
      }

      const segmentCandidates = await this.extractSegmentCandidates(
        job.data.durationSeconds,
        analysisFrames,
        analysisFramePayloads,
        ocrSpans,
      );
      const strictSteps = this.dedupeTimelineSteps(
        attachIngredientCardDetails(
          buildStrictTimelineSteps(segmentCandidates),
          ocrSpans,
        ),
      );

      if (strictSteps.length === 0) {
        throw new BadRequestException('未能从视频中提取出可靠步骤，请更换更清晰的视频重试');
      }

      const fileNameTitle = resolveFileNameTitle(job.data.originalName);
      const fallbackTitle =
        fileNameTitle.title || this.buildFallbackTitle(job.data.originalName);
      const recipePayload = await this.buildRecipePayloadFromEvidence({
        mode: job.data.mode,
        fallbackTitle,
        sanitizedFileTitle: fileNameTitle.title,
        coverUrl,
        transcript,
        ocrEntries,
        ocrSpans,
        strictSteps,
      });

      await job.updateProgress({
        stage: 'saving',
        progress: 92,
      } satisfies VideoRecipeProgressPayload);

      const savedRecipe = await this.recipeService.saveParsedRecipe(
        recipePayload,
        job.data.userId,
        'video_parsed',
      );

      await this.persistEvidenceCache({
        version: VIDEO_EVIDENCE_CACHE_VERSION,
        jobId: String(job.id),
        userId: job.data.userId,
        recipeId: savedRecipe.id,
        currentMode: job.data.mode,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + VIDEO_JOB_RETENTION_SECONDS * 1000,
        ).toISOString(),
        durationSeconds: job.data.durationSeconds,
        fallbackTitle,
        sanitizedFileTitle: fileNameTitle.title,
        titleSource: recipePayload.titleSource,
        transcript,
        analysisFrames,
        ocrEntries,
        ocrSpans,
        segmentCandidates,
        strictSteps,
        metadata: this.toCacheMetadata(recipePayload),
      });
      keepCache = true;

      return {
        recipeId: savedRecipe.id,
      };
    } finally {
      await Promise.all(
        filePathsToCleanup.map((targetPath) =>
          this.ffmpegMediaService.removePath(targetPath),
        ),
      );

      if (!keepCache) {
        await this.ffmpegMediaService.removePath(cacheDir);
      }
    }
  }

  private async extractOcrEntries(
    job: Job<VideoRecipeJobData, VideoRecipeJobResult>,
    workDir: string,
    ocrFrameDir: string,
    filePath: string,
    durationSeconds: number,
  ) {
    const ocrFrames = await this.ffmpegMediaService.extractOcrFrames(
      filePath,
      ocrFrameDir,
      durationSeconds,
    );
    this.logger.log(
      `Prepared ${ocrFrames.length} OCR frames for job ${String(job.id)}`,
    );
    this.logger.log(
      `Prepared OCR frame timestamps for job ${String(job.id)}: ${JSON.stringify(
        ocrFrames.map((frame) => frame.timeSec),
      )}`,
    );

    if (ocrFrames.length === 0) {
      return [];
    }

    const ocrFrameSets = await Promise.all(
      ocrFrames.map(async (frame, index) => {
        const cropDir = join(workDir, 'ocr-crops', `frame-${index + 1}`);
        const cropPaths = await this.ffmpegMediaService.extractTextFocusCrops(
          frame.path,
          cropDir,
        );

        return {
          timeSec: frame.timeSec,
          originalFrame: await this.fileToDataUrl(frame.path),
          focusCrops: await Promise.all(
            cropPaths.map((cropPath) => this.fileToDataUrl(cropPath)),
          ),
        };
      }),
    );

    const ocrEntries = await this.aiService.extractVideoFrameTexts(ocrFrameSets);

    if (ocrEntries.length > 0) {
      this.logger.log(
        `Extracted video frame texts for job ${String(job.id)}: ${JSON.stringify(ocrEntries)}`,
      );
    } else {
      this.logger.warn(
        `No visible cooking texts extracted from video frames for job ${String(job.id)}`,
      );
    }

    return ocrEntries;
  }

  private async extractTranscript(
    filePath: string,
    audioPath: string,
    job: Job<VideoRecipeJobData, VideoRecipeJobResult>,
  ) {
    const extractedAudioPath = await this.ffmpegMediaService.extractAudioTrack(
      filePath,
      audioPath,
    );

    if (!extractedAudioPath) {
      return '';
    }

    try {
      return await this.aiService.transcribeAudioFromPath(extractedAudioPath);
    } catch (error) {
      this.logger.warn(
        `Audio transcription failed for job ${String(job.id)}: ${(error as Error).message}`,
      );
      return '';
    }
  }

  private async extractSegmentCandidates(
    durationSeconds: number,
    analysisFrames: TimedVideoFrame[],
    analysisFramePayloads: Array<{ timeSec: number; image: string }>,
    ocrSpans: OcrTextSpan[],
  ) {
    const ocrEntries = ocrSpans.map((span) => ({
      timeSec: span.startSec,
      texts: span.texts,
    }));
    const segments = buildTimelineSegments({
      durationSeconds,
      frames: analysisFrames,
      ocrEntries,
      ocrSpans,
    });
    const imageMap = new Map(
      analysisFramePayloads.map((frame) => [frame.timeSec.toFixed(2), frame.image]),
    );
    const ocrCandidates = buildOcrSubtitleCandidates(ocrSpans);
    if (ocrCandidates.length > 0) {
      this.logger.log(
        `OCR subtitle candidate steps: ${JSON.stringify(ocrCandidates)}`,
      );
    }
    const segmentCandidates: TimelineCandidateStep[] = [];

    for (const segment of segments) {
      const frames = segment.frames
        .map((frame) => ({
          timeSec: frame.timeSec,
          image: imageMap.get(frame.timeSec.toFixed(2)) || '',
        }))
        .filter((frame) => frame.image);

      const candidateSteps = await this.aiService.extractSegmentTimelineSteps({
        segmentStartSec: segment.startSec,
        segmentEndSec: segment.endSec,
        frames,
        ocrEntries: segment.ocrEntries,
      });

      if (candidateSteps.length > 0) {
        this.logger.log(
          `AI supplemental candidate steps for segment ${segment.index + 1}: ${JSON.stringify(candidateSteps)}`,
        );
      }

      segmentCandidates.push(
        ...candidateSteps.map((step) => ({
          ...step,
          start_sec: Math.max(segment.startSec, step.start_sec),
          end_sec: Math.min(segment.endSec, Math.max(step.end_sec, step.start_sec)),
        })),
      );
    }

    const mergedCandidates = mergeStrictModeCandidates({
      ocrCandidates,
      aiCandidates: segmentCandidates,
    });

    if (mergedCandidates.droppedConflictingAi.length > 0) {
      this.logger.log(
        `Dropped conflicting AI step because OCR won: ${JSON.stringify(mergedCandidates.droppedConflictingAi)}`,
      );
    }

    return mergedCandidates.candidates;
  }

  private async buildRecipePayloadFromEvidence(options: {
    mode: VideoRecipeMode;
    fallbackTitle: string;
    sanitizedFileTitle?: string;
    coverUrl?: string | null;
    transcript: string;
    ocrEntries: OcrTextEntry[];
    ocrSpans?: OcrTextSpan[];
    strictSteps: TimelineRecipeStep[];
    metadata?: VideoRecipeMetadata;
  }): Promise<RecipePayload> {
    const metadata = this.normalizeMetadata(
      options.metadata
        || (await this.aiService.generateVideoRecipeMetadata({
          fallbackTitle: options.fallbackTitle,
          strictSteps: options.strictSteps,
          transcript: options.transcript,
          ocrEntries: options.ocrEntries,
        })),
      options.fallbackTitle,
    );
    const titleDecision = decideVideoRecipeTitle({
      metadataTitle: metadata.title,
      fileNameTitle: options.sanitizedFileTitle || options.fallbackTitle,
      ocrEntries: options.ocrSpans
        ? options.ocrSpans.map((span) => ({
            timeSec: span.startSec,
            texts: span.texts,
          }))
        : options.ocrEntries,
      metadata,
    });
    this.logger.log(
      `Resolved video recipe title from ${titleDecision.source}: ${titleDecision.title}`,
    );

    let finalSteps = options.strictSteps;
    if (options.mode === 'assisted') {
      const insertions = await this.aiService.generateAssistedTimelineInsertions({
        strictSteps: options.strictSteps,
        transcript: options.transcript,
        ocrEntries: options.ocrEntries,
      });
      finalSteps = this.dedupeTimelineSteps(
        applyAssistedInsertions(options.strictSteps, insertions),
      );
    }

    return {
      title: titleDecision.title,
      description: metadata.description,
      difficulty: metadata.difficulty,
      cook_time: this.normalizeCookTime(finalSteps),
      servings: metadata.servings,
      cover_url: options.coverUrl || metadata.cover_url,
      source_url: metadata.source_url,
      tags: Array.from(
        new Set([
          ...(metadata.tags || []),
          '视频解析',
          options.mode === 'strict' ? '严格模式' : '允许补全',
        ]),
      ).slice(0, 8),
      ingredients: metadata.ingredients,
      steps: finalSteps,
      nutrition: metadata.nutrition,
      titleSource: titleDecision.source,
    };
  }

  private normalizeMetadata(
    metadata: VideoRecipeMetadata,
    fallbackTitle: string,
  ): VideoRecipeMetadata {
    return {
      title: this.normalizeText(metadata?.title) || fallbackTitle,
      description:
        this.normalizeText(metadata?.description)
        || '根据视频内容自动解析生成的食谱草稿。',
      difficulty: this.normalizeDifficulty(metadata?.difficulty),
      servings: this.normalizePositiveInteger(metadata?.servings, 2),
      cover_url: this.normalizeNullableText(metadata?.cover_url),
      source_url: this.normalizeNullableText(metadata?.source_url),
      tags: this.normalizeTags(metadata?.tags),
      ingredients: this.normalizeIngredients(metadata?.ingredients),
      nutrition: this.normalizeNutrition(metadata?.nutrition),
    };
  }

  private toCacheMetadata(payload: RecipePayload): VideoRecipeMetadata {
    return {
      title: payload.title,
      description: payload.description,
      difficulty: payload.difficulty,
      servings: payload.servings,
      cover_url: payload.cover_url,
      source_url: payload.source_url,
      tags: payload.tags.filter(
        (tag) => tag !== '严格模式' && tag !== '允许补全',
      ),
      ingredients: payload.ingredients,
      nutrition: payload.nutrition,
    };
  }

  private async persistEvidenceCache(cache: CachedVideoRecipeEvidence) {
    const cacheDir = this.getEvidenceCacheDir(cache.jobId);
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(
      this.getEvidenceCacheFilePath(cache.jobId),
      JSON.stringify(cache, null, 2),
      'utf8',
    );
  }

  private async loadEvidenceCache(jobId: string, userId: string) {
    const cache = await this.readEvidenceCache(jobId);

    if (cache.userId !== userId) {
      throw new NotFoundException('解析证据不存在');
    }

    if (new Date(cache.expiresAt).getTime() < Date.now()) {
      await this.ffmpegMediaService.removePath(this.getEvidenceCacheDir(jobId));
      throw new BadRequestException('解析证据已过期，请重新上传视频');
    }

    return cache;
  }

  private async tryLoadEvidenceCache(jobId: string) {
    try {
      const cache = await this.readEvidenceCache(jobId);
      if (new Date(cache.expiresAt).getTime() < Date.now()) {
        await this.ffmpegMediaService.removePath(this.getEvidenceCacheDir(jobId));
        return null;
      }
      return cache;
    } catch {
      return null;
    }
  }

  private async readEvidenceCache(jobId: string) {
    const raw = await fs.readFile(this.getEvidenceCacheFilePath(jobId), 'utf8');
    return JSON.parse(raw) as CachedVideoRecipeEvidence;
  }

  private getEvidenceCacheDir(jobId: string) {
    return join(VIDEO_EVIDENCE_CACHE_ROOT, jobId);
  }

  private getEvidenceCacheFilePath(jobId: string) {
    return join(this.getEvidenceCacheDir(jobId), 'evidence.json');
  }

  private validateUploadedFile(file: Express.Multer.File) {
    const extension = extname(file.originalname || '').toLowerCase();
    const normalizedMimeType = (file.mimetype || '').toLowerCase();
    const isSupportedExtension = ALLOWED_VIDEO_EXTENSIONS.includes(
      extension as (typeof ALLOWED_VIDEO_EXTENSIONS)[number],
    );
    const isSupportedMimeType = ALLOWED_VIDEO_MIME_TYPES.includes(
      normalizedMimeType as (typeof ALLOWED_VIDEO_MIME_TYPES)[number],
    );

    if (!isSupportedExtension && !isSupportedMimeType) {
      throw new BadRequestException('仅支持 MP4 或 MOV 格式视频');
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      throw new BadRequestException('视频大小不能超过 500MB');
    }
  }

  private normalizeProgress(progress: unknown): VideoRecipeProgressPayload {
    if (
      progress &&
      typeof progress === 'object' &&
      'stage' in progress &&
      'progress' in progress
    ) {
      const stage = (progress as { stage?: unknown }).stage;
      const progressValue = Number(
        (progress as { progress?: unknown }).progress ?? 0,
      );

      return {
        stage: this.isVideoStage(stage) ? stage : 'validating',
        progress: Number.isFinite(progressValue)
          ? Math.max(0, Math.min(100, Math.round(progressValue)))
          : 0,
      };
    }

    if (typeof progress === 'number') {
      return {
        stage: 'validating',
        progress: Math.max(0, Math.min(100, Math.round(progress))),
      };
    }

    return {
      stage: 'validating',
      progress: 0,
    };
  }

  private mapJobState(state: string): VideoRecipeStatus {
    if (state === 'completed') {
      return 'completed';
    }

    if (state === 'failed') {
      return 'failed';
    }

    if (state === 'active') {
      return 'processing';
    }

    return 'queued';
  }

  private isVideoStage(value: unknown): value is VideoRecipeStage {
    return [
      'validating',
      'extracting',
      'transcribing',
      'analyzing',
      'saving',
    ].includes(String(value));
  }

  private async fileToDataUrl(filePath: string) {
    const buffer = await fs.readFile(filePath);
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  }

  private filePathToUploadUrl(filePath: string) {
    const normalizedFilePath = filePath.replace(/\\/g, '/');
    const normalizedUploadsRoot = UPLOADS_ROOT.replace(/\\/g, '/');
    const relativePath = normalizedFilePath.startsWith(`${normalizedUploadsRoot}/`)
      ? normalizedFilePath.slice(normalizedUploadsRoot.length + 1)
      : '';

    return relativePath ? `/uploads/${relativePath}` : null;
  }

  private buildFallbackTitle(originalName: string) {
    const baseName = basename(originalName, extname(originalName)).trim();
    if (!baseName) {
      return '视频解析食谱';
    }
    return '视频解析食谱';
  }

  private normalizeIngredients(rawIngredients: unknown): NormalizedIngredient[] {
    if (!Array.isArray(rawIngredients)) {
      return [];
    }

    return rawIngredients
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const record = item as Record<string, unknown>;
        const name = this.normalizeText(record.name);

        if (!name) {
          return null;
        }

        return {
          name,
          quantity: this.normalizePositiveNumber(record.quantity, 1),
          unit: this.normalizeText(record.unit) || '适量',
          optional: Boolean(record.optional),
        } satisfies NormalizedIngredient;
      })
      .filter(Boolean) as NormalizedIngredient[];
  }

  private dedupeTimelineSteps(steps: TimelineRecipeStep[]) {
    const deduped = dedupeSemanticSteps(steps);

    if (deduped.merges.length > 0) {
      this.logger.log(
        `Merged semantically duplicate steps: ${JSON.stringify(deduped.merges)}`,
      );
    }

    return deduped.steps;
  }

  private normalizeCookTime(steps: TimelineRecipeStep[]): number {
    const totalDuration = steps.reduce(
      (sum, step) => sum + (step.duration_min || 0),
      0,
    );

    return Math.max(totalDuration || steps.length * 3, 5);
  }

  private normalizeDifficulty(
    value: unknown,
  ): '简单' | '中等' | '困难' {
    const text = this.normalizeText(value);

    if (!text) {
      return '中等';
    }

    if (text.includes('难')) {
      return '困难';
    }

    if (text.includes('中')) {
      return '中等';
    }

    return '简单';
  }

  private normalizeTags(value: unknown) {
    if (!Array.isArray(value)) {
      return ['视频解析'];
    }

    const tags = value
      .map((item) => this.normalizeText(item))
      .filter((item): item is string => !!item);

    return Array.from(new Set(tags)).slice(0, 8);
  }

  private normalizeNutrition(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, unknown>;
  }

  private normalizeText(value: unknown) {
    if (typeof value !== 'string') {
      return '';
    }

    return value.trim();
  }

  private normalizeNullableText(value: unknown) {
    const normalized = this.normalizeText(value);
    return normalized || null;
  }

  private normalizePositiveInteger(value: unknown, fallback: number) {
    const normalized = Number(value);
    if (!Number.isFinite(normalized) || normalized <= 0) {
      return fallback;
    }
    return Math.max(1, Math.round(normalized));
  }

  private normalizePositiveNumber(value: unknown, fallback: number) {
    const normalized = Number(value);
    if (!Number.isFinite(normalized) || normalized <= 0) {
      return fallback;
    }
    return Number(normalized.toFixed(2));
  }
}
