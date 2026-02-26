import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ShoppingService } from './shopping.service';

@ApiTags('shopping')
@Controller('api/shopping')
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  // TODO: implement shopping endpoints
}
