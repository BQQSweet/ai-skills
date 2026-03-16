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

/**
 * AppModule 是整个 Nest 应用的根模块。
 *
 * 可以把它理解成“总装配厂”：
 * - imports: 导入其它模块，把功能接进来
 * - providers: 注册可被依赖注入的服务
 * - exports: 把本模块里的能力暴露给别的模块使用
 *
 * main.ts 在启动时会把 AppModule 交给 NestFactory，
 * 然后 Nest 再根据这里的装配关系把整个应用拼起来。
 */
@Module({
  imports: [
    // 全局配置
    // ConfigModule 设为 isGlobal 后，整个应用都可以直接注入 ConfigService
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
  // PrismaService 放在根模块提供后，业务模块就能通过依赖注入拿到数据库客户端
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
