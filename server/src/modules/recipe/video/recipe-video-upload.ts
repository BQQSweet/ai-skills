import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { extname, join } from 'path';
import { MAX_VIDEO_SIZE_BYTES } from '../constants/video-recipe.constants';

const videoUploadDir = join(process.cwd(), 'uploads', 'recipe-video', 'tmp');

function ensureVideoUploadDir() {
  fs.mkdirSync(videoUploadDir, { recursive: true });
  return videoUploadDir;
}

export const videoRecipeUploadMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, ensureVideoUploadDir());
    },
    filename: (_req, file, callback) => {
      const ext = extname(file.originalname || '').toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${ext || '.bin'}`);
    },
  }),
  limits: {
    fileSize: MAX_VIDEO_SIZE_BYTES,
  },
};
