import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
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
  controllers: [FeedController],
  providers: [FeedService, PrismaService, JwtAuthGuard],
  exports: [FeedService],
})
export class FeedModule {}
