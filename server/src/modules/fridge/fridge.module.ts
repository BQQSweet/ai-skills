import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FridgeController } from './fridge.controller';
import { FridgeService } from './fridge.service';
import { AiModule } from '../../ai/ai.module';
import { PrismaService } from '../../common/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  imports: [
    AiModule,
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
  controllers: [FridgeController],
  providers: [FridgeService, PrismaService, JwtAuthGuard],
  exports: [FridgeService],
})
export class FridgeModule {}
