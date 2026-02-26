"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ossConfig = exports.aiConfig = exports.redisConfig = exports.jwtConfig = void 0;
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    port: parseInt(process.env.PORT ?? '', 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
}));
exports.jwtConfig = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
exports.redisConfig = (0, config_1.registerAs)('redis', () => ({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT ?? '', 10) || 6379,
}));
exports.aiConfig = (0, config_1.registerAs)('ai', () => ({
    apiKey: process.env.AI_API_KEY,
    baseUrl: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
    model: process.env.AI_MODEL || 'deepseek-chat',
    visionModel: process.env.AI_VISION_MODEL || 'deepseek-vl',
}));
exports.ossConfig = (0, config_1.registerAs)('oss', () => ({
    endpoint: process.env.OSS_ENDPOINT,
    bucket: process.env.OSS_BUCKET || 'chefmate',
    accessKey: process.env.OSS_ACCESS_KEY,
    secretKey: process.env.OSS_SECRET_KEY,
}));
//# sourceMappingURL=index.js.map