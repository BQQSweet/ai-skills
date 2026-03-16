import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';
import { PrismaService } from '@/common/prisma.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Module({
  imports: [
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
  controllers: [ShoppingController],
  providers: [ShoppingService, PrismaService, JwtAuthGuard],
  exports: [ShoppingService],
})
export class ShoppingModule {}
