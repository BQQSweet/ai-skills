import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RecipeService } from './recipe.service';

@ApiTags('recipe')
@Controller('api/recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  // TODO: implement recipe endpoints
}
