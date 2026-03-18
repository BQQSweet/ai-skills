import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { StableRecommendationCachePayload } from './recommendation.types';

@Injectable()
export class RecommendationCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RecommendationCacheService.name);
  private readonly memoryCache = new Map<
    string,
    { value: string; expiresAt: number }
  >();
  private readonly redisClient: Redis | null;

  constructor(private readonly configService: ConfigService) {
    const redisConfig = this.configService.get<{ host: string; port: number }>(
      'redis',
    );

    if (!redisConfig) {
      this.redisClient = null;
      return;
    }

    this.redisClient = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });

    this.redisClient.on('error', (error) => {
      this.logger.warn(
        `Redis unavailable for recommendation cache, using local fallback: ${error.message}`,
      );
    });
  }

  async getStableRecipeIds(key: string): Promise<string[] | null> {
    const raw = await this.get(key);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as StableRecommendationCachePayload;
      if (!Array.isArray(parsed.recipeIds)) {
        return null;
      }
      return parsed.recipeIds;
    } catch (error) {
      this.logger.warn(
        `Failed to parse recommendation cache payload for ${key}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  async setStableRecipeIds(
    key: string,
    payload: StableRecommendationCachePayload,
    ttlSeconds: number,
  ): Promise<void> {
    await this.set(key, JSON.stringify(payload), ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    if (this.redisClient) {
      try {
        await this.connectRedis();
        await this.redisClient.del(key);
        return;
      } catch (error) {
        this.logger.warn(
          `Failed to delete Redis recommendation cache for ${key}: ${(error as Error).message}`,
        );
      }
    }

    this.memoryCache.delete(key);
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      await this.redisClient.quit();
    } catch {
      // Ignore Redis shutdown failures during app teardown.
    }
  }

  private async get(key: string): Promise<string | null> {
    if (this.redisClient) {
      try {
        await this.connectRedis();
        return await this.redisClient.get(key);
      } catch (error) {
        this.logger.warn(
          `Failed to read Redis recommendation cache for ${key}: ${(error as Error).message}`,
        );
      }
    }

    return this.getFromMemory(key);
  }

  private async set(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<void> {
    if (this.redisClient) {
      try {
        await this.connectRedis();
        await this.redisClient.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (error) {
        this.logger.warn(
          `Failed to write Redis recommendation cache for ${key}: ${(error as Error).message}`,
        );
      }
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  private getFromMemory(key: string): string | null {
    const cached = this.memoryCache.get(key);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt <= Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.value;
  }

  private async connectRedis(): Promise<void> {
    if (!this.redisClient || this.redisClient.status !== 'wait') {
      return;
    }

    await this.redisClient.connect();
  }
}
