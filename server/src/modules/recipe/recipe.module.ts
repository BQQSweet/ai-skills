import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { RecommendationCacheService } from './recommendation-cache.service';
import { PrismaService } from '@/common/prisma.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AdminGuard } from '@/common/guards/admin.guard';

import { AiModule } from '@/ai/ai.module';
import { VIDEO_RECIPE_QUEUE_NAME } from './constants/video-recipe.constants';
import { RecipeVideoProcessor } from './video/recipe-video.processor';
import { RecipeVideoService } from './video/recipe-video.service';
import { FfmpegMediaService } from './video/ffmpeg-media.service';

@Module({
  imports: [
    AiModule,
    BullModule.registerQueue({
      name: VIDEO_RECIPE_QUEUE_NAME,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.expiresIn') as any,
        },
      }),
    }),
  ],
  controllers: [RecipeController],
  providers: [
    RecipeService,
    RecommendationCacheService,
    PrismaService,
    JwtAuthGuard,
    AdminGuard,
    RecipeVideoService,
    RecipeVideoProcessor,
    FfmpegMediaService,
  ],
  exports: [RecipeService],
})
export class RecipeModule {}
