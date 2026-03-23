import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { execFile, spawn, spawnSync } from 'child_process';
import * as fs from 'fs/promises';
import { promisify } from 'util';
import { dirname, join } from 'path';
import {
  MAX_VIDEO_FRAME_COUNT,
  MAX_VIDEO_OCR_FRAME_COUNT,
} from '../constants/video-recipe.constants';
import type { TimedVideoFrame } from './video-recipe.types';

const execFileAsync = promisify(execFile);

interface FfprobeStreamInfo {
  codec_type?: string;
  width?: number;
  height?: number;
}

interface FfprobeResult {
  format?: {
    duration?: string;
  };
  streams?: FfprobeStreamInfo[];
}

@Injectable()
export class FfmpegMediaService {
  private readonly logger = new Logger(FfmpegMediaService.name);

  async ensureAvailable() {
    this.assertToolAvailable('ffmpeg');
    this.assertToolAvailable('ffprobe');
  }

  async probeVideo(filePath: string) {
    await this.ensureAvailable();

    try {
      const { stdout } = await execFileAsync('ffprobe', [
        '-v',
        'error',
        '-show_entries',
        'format=duration:stream=codec_type,width,height',
        '-of',
        'json',
        filePath,
      ]);

      const parsed = JSON.parse(stdout) as FfprobeResult;
      const durationSeconds = Number(parsed.format?.duration || 0);
      const streams = parsed.streams || [];
      const videoStream = streams.find((item) => item.codec_type === 'video');
      const audioStream = streams.find((item) => item.codec_type === 'audio');

      if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        throw new Error('视频时长解析失败');
      }

      return {
        durationSeconds,
        hasVideo: Boolean(videoStream),
        hasAudio: Boolean(audioStream),
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to probe video ${filePath}`, error as Error);
      throw new BadRequestException('无法读取视频元数据，请确认文件有效');
    }
  }

  async extractKeyFrames(
    filePath: string,
    outputDir: string,
    durationSeconds: number,
    maxFrameCount = MAX_VIDEO_FRAME_COUNT,
  ): Promise<TimedVideoFrame[]> {
    await fs.mkdir(outputDir, { recursive: true });

    const frameCount = Math.min(
      maxFrameCount,
      Math.max(4, Math.ceil(durationSeconds / 6)),
    );

    const timestamps = this.buildFrameTimestamps(durationSeconds, frameCount);
    const extractedFrames: TimedVideoFrame[] = [];

    for (let index = 0; index < timestamps.length; index += 1) {
      const outputPath = join(outputDir, `frame-${index + 1}.jpg`);

      try {
        await this.runCommand('ffmpeg', [
          '-y',
          '-ss',
          timestamps[index].toFixed(2),
          '-i',
          filePath,
          '-frames:v',
          '1',
          '-q:v',
          '3',
          outputPath,
        ]);
        extractedFrames.push({
          path: outputPath,
          timeSec: Number(timestamps[index].toFixed(2)),
        });
      } catch (error) {
        this.logger.warn(
          `Failed to extract frame ${index + 1} from ${filePath}: ${(error as Error).message}`,
        );
      }
    }

    return extractedFrames;
  }

  async extractOcrFrames(
    filePath: string,
    outputDir: string,
    durationSeconds: number,
    maxFrameCount = MAX_VIDEO_OCR_FRAME_COUNT,
  ): Promise<TimedVideoFrame[]> {
    await fs.mkdir(outputDir, { recursive: true });

    const timestamps = this.buildDenseOcrTimestamps(durationSeconds, maxFrameCount);
    const extractedFrames: TimedVideoFrame[] = [];

    for (let index = 0; index < timestamps.length; index += 1) {
      const outputPath = join(outputDir, `ocr-frame-${index + 1}.jpg`);

      try {
        await this.runCommand('ffmpeg', [
          '-y',
          '-ss',
          timestamps[index].toFixed(2),
          '-i',
          filePath,
          '-frames:v',
          '1',
          '-q:v',
          '2',
          outputPath,
        ]);
        extractedFrames.push({
          path: outputPath,
          timeSec: Number(timestamps[index].toFixed(2)),
        });
      } catch (error) {
        this.logger.warn(
          `Failed to extract OCR frame ${index + 1} from ${filePath}: ${(error as Error).message}`,
        );
      }
    }

    return extractedFrames;
  }

  async extractCoverFrame(filePath: string, outputPath: string) {
    await fs.mkdir(dirname(outputPath), { recursive: true });

    for (const timeSec of [0, 0.1]) {
      try {
        await this.runCommand('ffmpeg', [
          '-y',
          '-ss',
          timeSec.toFixed(2),
          '-i',
          filePath,
          '-frames:v',
          '1',
          '-q:v',
          '2',
          outputPath,
        ]);
        return outputPath;
      } catch (error) {
        this.logger.warn(
          `Failed to extract cover frame at ${timeSec.toFixed(2)}s from ${filePath}: ${(error as Error).message}`,
        );
      }
    }

    return null;
  }

  buildDenseOcrTimestamps(durationSeconds: number, maxFrameCount: number) {
    const timestamps: number[] = [];
    const earlyWindow = Math.min(durationSeconds, 20);

    for (let second = 0; second < earlyWindow; second += 1) {
      timestamps.push(Number((second + 0.5).toFixed(2)));
    }

    if (durationSeconds > earlyWindow) {
      for (let second = earlyWindow; second < durationSeconds; second += 2) {
        timestamps.push(Number((Math.min(second + 1, durationSeconds - 0.1)).toFixed(2)));
      }
    }

    const uniqueSorted = Array.from(new Set(timestamps))
      .filter((time) => time > 0 && time < durationSeconds)
      .sort((left, right) => left - right);

    if (uniqueSorted.length <= maxFrameCount) {
      return uniqueSorted;
    }

    const sampled: number[] = [];
    const step = uniqueSorted.length / maxFrameCount;
    for (let index = 0; index < maxFrameCount; index += 1) {
      const pickedIndex = Math.min(
        uniqueSorted.length - 1,
        Math.floor(index * step),
      );
      sampled.push(uniqueSorted[pickedIndex]);
    }

    return Array.from(new Set(sampled)).sort((left, right) => left - right);
  }

  async extractAudioTrack(filePath: string, outputPath: string) {
    await fs.mkdir(dirname(outputPath), { recursive: true });

    try {
      await this.runCommand('ffmpeg', [
        '-y',
        '-i',
        filePath,
        '-vn',
        '-ac',
        '1',
        '-ar',
        '16000',
        '-f',
        'mp3',
        outputPath,
      ]);
      return outputPath;
    } catch (error) {
      this.logger.warn(
        `Failed to extract audio from ${filePath}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  async extractTextFocusCrops(framePath: string, outputDir: string) {
    await fs.mkdir(outputDir, { recursive: true });
    const enhance =
      'format=gray,eq=contrast=1.55:brightness=0.04,unsharp=5:5:1.8:5:5:0.0';

    const cropVariants = [
      {
        name: 'left-panel',
        filter: `crop=iw*0.42:ih*0.92:0:0,scale=iw*2.4:ih*2.4:flags=lanczos,${enhance}`,
      },
      {
        name: 'top-left',
        filter: `crop=iw*0.58:ih*0.58:0:0,scale=iw*2.2:ih*2.2:flags=lanczos,${enhance}`,
      },
      {
        name: 'bottom-caption',
        filter: `crop=iw*0.82:ih*0.28:iw*0.09:ih*0.66,scale=iw*3.4:ih*3.4:flags=lanczos,${enhance}`,
      },
      {
        name: 'full-enhanced',
        filter: `scale=iw*1.8:ih*1.8:flags=lanczos,${enhance}`,
      },
    ] as const;

    const croppedPaths: string[] = [];

    for (const variant of cropVariants) {
      const outputPath = join(outputDir, `${variant.name}.jpg`);

      try {
        await this.runCommand('ffmpeg', [
          '-y',
          '-i',
          framePath,
          '-vf',
          variant.filter,
          '-q:v',
          '2',
          outputPath,
        ]);
        croppedPaths.push(outputPath);
      } catch (error) {
        this.logger.warn(
          `Failed to extract OCR crop ${variant.name} from ${framePath}: ${(error as Error).message}`,
        );
      }
    }

    return croppedPaths;
  }

  async removePath(targetPath: string | null | undefined) {
    if (!targetPath) {
      return;
    }

    try {
      await fs.rm(targetPath, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn(
        `Failed to remove temp path ${targetPath}: ${(error as Error).message}`,
      );
    }
  }

  private assertToolAvailable(toolName: 'ffmpeg' | 'ffprobe') {
    const result = spawnSync(toolName, ['-version'], { stdio: 'ignore' });

    if (result.error || result.status !== 0) {
      throw new BadRequestException(
        `${toolName} 未安装或不可用，请先在部署环境安装 ${toolName}`,
      );
    }
  }

  private buildFrameTimestamps(durationSeconds: number, frameCount: number) {
    if (frameCount <= 1) {
      return [Math.max(0, durationSeconds / 2)];
    }

    return Array.from({ length: frameCount }, (_, index) => {
      const segment = durationSeconds / (frameCount + 1);
      return Math.max(0, segment * (index + 1));
    });
  }

  private runCommand(command: string, args: string[]) {
    return new Promise<void>((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ['ignore', 'ignore', 'pipe'],
      });
      let stderr = '';

      child.stderr.on('data', (chunk) => {
        if (stderr.length < 6000) {
          stderr += chunk.toString();
        }
      });

      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(
          new Error(
            stderr.trim() || `${command} exited with non-zero code ${code}`,
          ),
        );
      });
    });
  }
}
