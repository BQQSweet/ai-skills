import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { PrismaService } from '@/common/prisma.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GroupGuard } from '@/common/guards/group.guard';

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
  controllers: [GroupController],
  providers: [GroupService, PrismaService, JwtAuthGuard, GroupGuard],
  exports: [GroupService],
})
export class GroupModule {}
