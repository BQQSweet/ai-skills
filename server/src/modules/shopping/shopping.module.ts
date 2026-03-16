import { Module } from '@nestjs/common';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';
import { PrismaService } from '@/common/prisma.service';

@Module({
  controllers: [ShoppingController],
  providers: [ShoppingService, PrismaService],
  exports: [ShoppingService],
})
export class ShoppingModule {}
