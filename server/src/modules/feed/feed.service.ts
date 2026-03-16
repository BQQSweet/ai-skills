import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取家庭组动态列表
   * 自动清理 7 天前的数据
   */
  async getFeedList(groupId: string, limit = 20, offset = 0) {
    // 清理 7 天前的数据
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    await this.prisma.feed.deleteMany({
      where: {
        created_at: {
          lt: sevenDaysAgo,
        },
      },
    });

    // 获取动态列表
    const feeds = await this.prisma.feed.findMany({
      where: {
        group_id: groupId,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // 获取用户信息
    const userIds = [...new Set(feeds.map((f: any) => f.user_id))];
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        nickname: true,
        avatar_url: true,
      },
    });

    const userMap = new Map(users.map((u: any) => [u.id, u]));

    // 组装返回数据
    const items = feeds.map((feed: any) => {
      const user = userMap.get(feed.user_id);
      return {
        id: feed.id,
        groupId: feed.group_id,
        userId: feed.user_id,
        userName: user?.nickname || '未知用户',
        avatarUrl: user?.avatar_url,
        actionType: feed.action_type,
        target: feed.target,
        targetId: feed.target_id,
        createdAt: feed.created_at.toISOString(),
      };
    });

    // 检查是否还有更多数据
    const total = await this.prisma.feed.count({
      where: { group_id: groupId },
    });

    return {
      items,
      hasMore: offset + limit < total,
      total,
    };
  }

  /**
   * 清空家庭组动态
   */
  async clearFeed(groupId: string) {
    await this.prisma.feed.deleteMany({
      where: {
        group_id: groupId,
      },
    });
  }
}
