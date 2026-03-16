import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/**
 * PrismaService 是项目里的数据库访问入口。
 *
 * 之所以继承 PrismaClient，是为了让它天然拥有 prisma.user.findMany()
 * 这一类查询能力；再配合 Nest 的依赖注入，业务 Service 里就能直接注入它。
 *
 * 同时这里还接入了 PostgreSQL 连接池，并使用模块生命周期钩子来管理连接。
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: pg.Pool;

  constructor() {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  // 模块初始化时建立 Prisma 连接，避免第一次请求才懒连接
  async onModuleInit() {
    await this.$connect();
  }

  // 应用关闭时释放 Prisma 和底层 pg 连接池，避免资源泄漏
  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
