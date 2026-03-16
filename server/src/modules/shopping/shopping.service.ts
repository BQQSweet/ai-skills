import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import {
  CreateShoppingListDto,
  AddShoppingItemDto,
  UpdateShoppingItemDto,
} from './dto/shopping.dto';

@Injectable()
export class ShoppingService {
  constructor(private readonly prisma: PrismaService) {}

  // 创建购物清单
  async createShoppingList(
    groupId: string,
    userId: string,
    dto: CreateShoppingListDto,
  ) {
    // 验证用户是否属于该家庭组
    await this.verifyGroupMembership(groupId, userId);

    const shoppingList = await this.prisma.shoppingList.create({
      data: {
        group_id: groupId,
        title: dto.title,
        created_by: userId,
        recipe_id: dto.recipeId,
        source: dto.source || 'manual',
      },
      include: {
        items: true,
      },
    });

    // 记录动态
    await this.createFeed(
      groupId,
      userId,
      'shopping_added',
      dto.title,
      shoppingList.id,
    );

    return shoppingList;
  }

  // 获取家庭组的购物清单列表
  async getShoppingLists(groupId: string, userId: string) {
    await this.verifyGroupMembership(groupId, userId);

    return this.prisma.shoppingList.findMany({
      where: {
        group_id: groupId,
        deleted_at: null,
      },
      include: {
        items: {
          where: {
            list: {
              deleted_at: null,
            },
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // 获取购物清单详情
  async getShoppingListDetail(listId: string, userId: string) {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id: listId },
      include: {
        items: {
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

    if (!list || list.deleted_at) {
      throw new NotFoundException('购物清单不存在');
    }

    await this.verifyGroupMembership(list.group_id, userId);

    return list;
  }

  // 添加购物清单项
  async addShoppingItem(
    listId: string,
    userId: string,
    dto: AddShoppingItemDto,
  ) {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id: listId },
    });

    if (!list || list.deleted_at) {
      throw new NotFoundException('购物清单不存在');
    }

    await this.verifyGroupMembership(list.group_id, userId);

    const item = await this.prisma.shoppingItem.create({
      data: {
        list_id: listId,
        name: dto.name,
        category: dto.category,
        quantity: dto.quantity,
        unit: dto.unit,
        note: dto.note,
        added_by: userId,
      },
    });

    // 记录动态
    await this.createFeed(
      list.group_id,
      userId,
      'shopping_added',
      dto.name,
      item.id,
    );

    return item;
  }

  // 更新购物清单项
  async updateShoppingItem(
    itemId: string,
    userId: string,
    dto: UpdateShoppingItemDto,
  ) {
    const item = await this.prisma.shoppingItem.findUnique({
      where: { id: itemId },
      include: {
        list: true,
      },
    });

    if (!item) {
      throw new NotFoundException('购物清单项不存在');
    }

    await this.verifyGroupMembership(item.list.group_id, userId);

    return this.prisma.shoppingItem.update({
      where: { id: itemId },
      data: dto,
    });
  }

  // 删除购物清单项
  async deleteShoppingItem(itemId: string, userId: string) {
    const item = await this.prisma.shoppingItem.findUnique({
      where: { id: itemId },
      include: {
        list: true,
      },
    });

    if (!item) {
      throw new NotFoundException('购物清单项不存在');
    }

    await this.verifyGroupMembership(item.list.group_id, userId);

    await this.prisma.shoppingItem.delete({
      where: { id: itemId },
    });
  }

  // 领取购物任务
  async claimShoppingItem(itemId: string, userId: string) {
    const item = await this.prisma.shoppingItem.findUnique({
      where: { id: itemId },
      include: {
        list: true,
      },
    });

    if (!item) {
      throw new NotFoundException('购物清单项不存在');
    }

    await this.verifyGroupMembership(item.list.group_id, userId);

    const updated = await this.prisma.shoppingItem.update({
      where: { id: itemId },
      data: {
        assigned_to: userId,
        status: 'claimed',
      },
    });

    return updated;
  }

  // 标记为已购买
  async markAsPurchased(itemId: string, userId: string) {
    const item = await this.prisma.shoppingItem.findUnique({
      where: { id: itemId },
      include: {
        list: true,
      },
    });

    if (!item) {
      throw new NotFoundException('购物清单项不存在');
    }

    await this.verifyGroupMembership(item.list.group_id, userId);

    const updated = await this.prisma.shoppingItem.update({
      where: { id: itemId },
      data: {
        is_bought: true,
        bought_at: new Date(),
        purchased_by: userId,
        status: 'purchased',
      },
    });

    // 记录动态
    await this.createFeed(
      item.list.group_id,
      userId,
      'shopping_purchased',
      item.name,
      itemId,
    );

    return updated;
  }

  // 完成购物清单
  async completeShoppingList(listId: string, userId: string) {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id: listId },
    });

    if (!list || list.deleted_at) {
      throw new NotFoundException('购物清单不存在');
    }

    await this.verifyGroupMembership(list.group_id, userId);

    return this.prisma.shoppingList.update({
      where: { id: listId },
      data: {
        status: 'completed',
      },
    });
  }

  // 清空已购买项
  async clearPurchased(groupId: string, userId: string) {
    await this.verifyGroupMembership(groupId, userId);

    const lists = await this.prisma.shoppingList.findMany({
      where: {
        group_id: groupId,
        status: 'active',
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });

    const listIds = lists.map((l: any) => l.id);

    await this.prisma.shoppingItem.deleteMany({
      where: {
        list_id: { in: listIds },
        is_bought: true,
      },
    });
  }

  // 验证用户是否属于家庭组
  private async verifyGroupMembership(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('您不是该家庭组成员');
    }

    return membership;
  }

  // 创建动态记录
  private async createFeed(
    groupId: string,
    userId: string,
    actionType: string,
    target: string,
    targetId?: string,
  ) {
    await this.prisma.feed.create({
      data: {
        group_id: groupId,
        user_id: userId,
        action_type: actionType,
        target,
        target_id: targetId,
      },
    });
  }
}
