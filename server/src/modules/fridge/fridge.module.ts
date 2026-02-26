import { Module } from '@nestjs/common';
import { FridgeController } from './fridge.controller';
import { FridgeService } from './fridge.service';

@Module({
  controllers: [FridgeController],
  providers: [FridgeService],
  exports: [FridgeService],
})
export class FridgeModule {}
