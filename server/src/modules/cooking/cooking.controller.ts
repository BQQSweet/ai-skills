import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CookingService } from './cooking.service';

@ApiTags('cooking')
@Controller('api/cooking')
export class CookingController {
  constructor(private readonly cookingService: CookingService) {}

  // TODO: implement cooking endpoints
}
