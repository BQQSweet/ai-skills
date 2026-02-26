import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FridgeService } from './fridge.service';

@ApiTags('fridge')
@Controller('api/fridge')
export class FridgeController {
  constructor(private readonly fridgeService: FridgeService) {}

  // TODO: implement fridge endpoints
}
