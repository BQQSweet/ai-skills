import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// 配置
import appConfig, {
  jwtConfig,
  redisConfig,
  aiConfig,
  ossConfig,
} from './config';

// 公共服务
import { PrismaService } from './common/prisma.service';

// AI 服务
import { AiModule } from './ai/ai.module';

// 业务模块
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { GroupModule } from './modules/group/group.module';
import { FridgeModule } from './modules/fridge/fridge.module';
import { RecipeModule } from './modules/recipe/recipe.module';
import { CookingModule } from './modules/cooking/cooking.module';
import { ShoppingModule } from './modules/shopping/shopping.module';
import { TaskModule } from './modules/task/task.module';
import { NotificationModule } from './modules/notification/notification.module';
import { StatsModule } from './modules/stats/stats.module';
import { FeedModule } from './modules/feed/feed.module';

@Module({
  imports: [
    // 全局配置
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, redisConfig, aiConfig, ossConfig],
    }),

    // 定时任务
    ScheduleModule.forRoot(),

    // AI 服务
    AiModule,

    // 业务模块
    AuthModule,
    UserModule,
    GroupModule,
    FridgeModule,
    RecipeModule,
    CookingModule,
    ShoppingModule,
    TaskModule,
    NotificationModule,
    StatsModule,
    FeedModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
