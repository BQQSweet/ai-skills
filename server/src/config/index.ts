import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT ?? '', 10) || 6379,
}));

export const aiConfig = registerAs('ai', () => ({
  apiKey: process.env.AI_API_KEY,
  baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
  model: process.env.AI_MODEL || 'deepseek-chat',
  visionApiKey: process.env.AI_VISION_API_KEY || process.env.AI_API_KEY,
  visionBaseUrl: process.env.AI_VISION_BASE_URL || process.env.AI_BASE_URL,
  visionModel: process.env.AI_VISION_MODEL || 'qwen-vl-plus',
}));

export const ossConfig = registerAs('oss', () => ({
  endpoint: process.env.OSS_ENDPOINT,
  bucket: process.env.OSS_BUCKET || 'chefmate',
  accessKey: process.env.OSS_ACCESS_KEY,
  secretKey: process.env.OSS_SECRET_KEY,
}));
