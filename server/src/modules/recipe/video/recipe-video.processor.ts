import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { VIDEO_RECIPE_QUEUE_NAME } from '../constants/video-recipe.constants';
import type {
  VideoRecipeJobData,
  VideoRecipeJobResult,
} from './video-recipe.types';
import { RecipeVideoService } from './recipe-video.service';

@Processor(VIDEO_RECIPE_QUEUE_NAME)
export class RecipeVideoProcessor extends WorkerHost {
  constructor(private readonly recipeVideoService: RecipeVideoService) {
    super();
  }

  async process(job: Job<VideoRecipeJobData, VideoRecipeJobResult>) {
    return this.recipeVideoService.processVideoJob(job);
  }
}
