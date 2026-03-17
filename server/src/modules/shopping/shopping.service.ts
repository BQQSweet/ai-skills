import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import {
  AddShoppingItemDto,
  AssignShoppingItemDto,
  CreateShoppingListDto,
  GenerateShoppingListFromRecipeDto,
  UpdateShoppingItemDto,
} from './dto/shopping.dto';

type ShoppingListRecord = Awaited<
  ReturnType<ShoppingService['getShoppingListsRaw']>
>[number];

type ShoppingItemRecord = ShoppingListRecord['items'][number];

@Injectable()
export class ShoppingService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeName(name: string) {
    return name.trim().toLowerCase();
  }

  /**
   * 统一维护购物项状态字段之间的一致性，避免出现：
   * - status = pending，但 purchased_by / bought_at 仍然有值
   * - status = pending，但 assigned_to 仍然有值
   */
  private buildItemStateUpdate(
    status: 'pending' | 'claimed' | 'purchased',
    item: ShoppingItemRecord,
    userId: string,
  ) {
    if (status === 'pending') {
      return {
        status: 'pending' as const,
        assigned_to: null,
        is_bought: false,
        bought_at: null,
        purchased_by: null,
      };
    }

    if (status === 'claimed') {
      return {
        status: 'claimed' as const,
        assigned_to: item.assigned_to || userId,
        is_bought: false,
        bought_at: null,
        purchased_by: null,
      };
    }

    return {
      status: 'purchased' as const,
      is_bought: true,
      bought_at: new Date(),
      purchased_by: userId,
      // 如果之前没有领取人，则默认把购买人视为当前执行购买的人
      assigned_to: item.assigned_to || userId,
    };
  }

  private isValidItemStatus(
    status: string,
  ): status is 'pending' | 'claimed' | 'purchased' {
    return ['pending', 'claimed', 'purchased'].includes(status);
  }

  private getSerializedItemState(item: ShoppingItemRecord) {
    const isClaimed = item.status === 'claimed';
    const isPurchased = item.status === 'purchased';

    return {
      assignedTo: isClaimed || isPurchased ? item.assigned_to : null,
      purchasedBy: isPurchased ? item.purchased_by : null,
      purchasedAt: isPurchased ? item.bought_at : null,
    };
  }

  private assertCanPurchase(item: ShoppingItemRecord, userId: string) {
    if (item.assigned_to && item.assigned_to !== userId) {
      throw new ForbiddenException('该任务已由其他成员认领');
    }
  }

  private async getShoppingListsRaw(groupId: string) {
    return this.prisma.shoppingList.findMany({
      where: {
        group_id: groupId,
        status: 'active',
        deleted_at: null,
      },
      include: {
        items: {
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

  private async buildSerializeContext(
    groupId: string,
    lists: ShoppingListRecord[],
  ) {
    const fridgeItems = await this.prisma.fridgeItem.findMany({
      where: {
        group_id: groupId,
        deleted_at: null,
        status: {
          not: 'expired',
        },
      },
      select: {
        name: true,
      },
    });

    const fridgeNameMap = new Map(
      fridgeItems.map((item) => [this.normalizeName(item.name), item.name]),
    );

    const userIds = new Set<string>();
    for (const list of lists) {
      userIds.add(list.created_by);
      for (const item of list.items) {
        userIds.add(item.added_by);
        if (item.assigned_to) userIds.add(item.assigned_to);
        if (item.purchased_by) userIds.add(item.purchased_by);
      }
    }

    const users = userIds.size
      ? await this.prisma.user.findMany({
          where: { id: { in: Array.from(userIds) } },
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
          },
        })
      : [];

    const userMap = new Map(users.map((user) => [user.id, user]));
    return { fridgeNameMap, userMap };
  }

  private serializeShoppingLists(
    lists: ShoppingListRecord[],
    context: Awaited<ReturnType<ShoppingService['buildSerializeContext']>>,
  ) {
    return lists.map((list) => ({
      id: list.id,
      groupId: list.group_id,
      title: list.title,
      status: list.status,
      source: list.source,
      recipeId: list.recipe_id,
      createdBy: list.created_by,
      createdByName:
        context.userMap.get(list.created_by)?.nickname || '未知成员',
      createdAt: list.created_at,
      updatedAt: list.updated_at,
      items: list.items.map((item) => {
        const matchedName =
          context.fridgeNameMap.get(this.normalizeName(item.name)) || '';
        const itemState = this.getSerializedItemState(item);

        return {
          id: item.id,
          listId: item.list_id,
          groupId: list.group_id,
          title: list.title,
          source: list.source,
          recipeId: list.recipe_id,
          sourceRecipeTitle:
            list.source === 'recipe'
              ? list.title.replace(/\s*协作采购清单$/, '')
              : '',
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          status: item.status,
          note: item.note,
          addedBy: item.added_by,
          addedByName:
            context.userMap.get(item.added_by)?.nickname || '未知成员',
          assignedTo: itemState.assignedTo,
          assignedToName: itemState.assignedTo
            ? context.userMap.get(itemState.assignedTo)?.nickname || '未知成员'
            : '',
          purchasedBy: itemState.purchasedBy,
          purchasedByName: itemState.purchasedBy
            ? context.userMap.get(itemState.purchasedBy)?.nickname || '未知成员'
            : '',
          purchasedAt: itemState.purchasedAt,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          hasInFridge: Boolean(matchedName),
          fridgeMatchedName: matchedName || undefined,
        };
      }),
    }));
  }

  private async serializeGroupLists(
    groupId: string,
    lists: ShoppingListRecord[],
  ) {
    const context = await this.buildSerializeContext(groupId, lists);
    return this.serializeShoppingLists(lists, context);
  }

  private async getActiveListOrThrow(listId: string) {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id: listId },
    });

    if (!list || list.deleted_at) {
      throw new NotFoundException('购物清单不存在');
    }

    return list;
  }

  private async getItemOrThrow(itemId: string) {
    const item = await this.prisma.shoppingItem.findUnique({
      where: { id: itemId },
      include: {
        list: true,
      },
    });

    if (!item || item.list.deleted_at) {
      throw new NotFoundException('购物清单项不存在');
    }

    return item;
  }

  private async getSerializedListById(listId: string) {
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

    const [serialized] = await this.serializeGroupLists(list.group_id, [list]);
    return serialized;
  }

  private async getSerializedItemById(itemId: string) {
    const item = await this.getItemOrThrow(itemId);
    const serializedList = await this.getSerializedListById(item.list.id);
    const serializedItem = serializedList.items.find(
      (shoppingItem) => shoppingItem.id === itemId,
    );

    if (!serializedItem) {
      throw new NotFoundException('购物清单项不存在');
    }

    return serializedItem;
  }

  // 创建购物清单
  async createShoppingList(
    groupId: string,
    userId: string,
    dto: CreateShoppingListDto,
  ) {
    await this.verifyGroupMembership(groupId, userId);

    const shoppingList = await this.prisma.shoppingList.create({
      data: {
        group_id: groupId,
        title: dto.title,
        created_by: userId,
        recipe_id: dto.recipeId,
        source: dto.source || 'manual',
      },
    });

    await this.createFeed(
      groupId,
      userId,
      'shopping_added',
      dto.title,
      shoppingList.id,
    );

    return this.getSerializedListById(shoppingList.id);
  }

  async createShoppingListFromRecipe(
    groupId: string,
    userId: string,
    dto: GenerateShoppingListFromRecipeDto,
  ) {
    await this.verifyGroupMembership(groupId, userId);

    const ingredients = dto.ingredients.filter((item) => !item.optional);
    if (!ingredients.length) {
      throw new BadRequestException('该食谱没有需要采购的食材');
    }

    const title = `${dto.recipeTitle} 协作采购清单`;

    let listId = dto.targetListId || '';
    if (dto.mode === 'overwrite') {
      if (!listId) {
        throw new BadRequestException('覆盖模式必须提供目标清单');
      }

      const targetList = await this.getActiveListOrThrow(listId);
      await this.verifyGroupMembership(targetList.group_id, userId);

      await this.prisma.$transaction([
        this.prisma.shoppingItem.deleteMany({
          where: { list_id: listId },
        }),
        this.prisma.shoppingList.update({
          where: { id: listId },
          data: {
            title,
            recipe_id: dto.recipeId,
            source: 'recipe',
            status: 'active',
          },
        }),
      ]);
    } else {
      const list = await this.prisma.shoppingList.create({
        data: {
          group_id: groupId,
          title,
          created_by: userId,
          recipe_id: dto.recipeId,
          source: 'recipe',
        },
      });
      listId = list.id;
    }

    await this.prisma.shoppingItem.createMany({
      data: ingredients.map((item) => ({
        list_id: listId,
        name: item.name,
        category: 'other',
        quantity: item.quantity,
        unit: item.unit,
        added_by: userId,
      })),
    });

    await this.createFeed(
      groupId,
      userId,
      'shopping_added',
      dto.recipeTitle,
      listId,
    );

    return this.getSerializedListById(listId);
  }

  // 获取家庭组的购物清单列表
  async getShoppingLists(groupId: string, userId: string) {
    await this.verifyGroupMembership(groupId, userId);
    const lists = await this.getShoppingListsRaw(groupId);
    return this.serializeGroupLists(groupId, lists);
  }

  // 获取购物清单详情
  async getShoppingListDetail(listId: string, userId: string) {
    const list = await this.getActiveListOrThrow(listId);
    await this.verifyGroupMembership(list.group_id, userId);
    return this.getSerializedListById(listId);
  }

  // 添加购物清单项
  async addShoppingItem(
    listId: string,
    userId: string,
    dto: AddShoppingItemDto,
  ) {
    const list = await this.getActiveListOrThrow(listId);
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

    await this.createFeed(
      list.group_id,
      userId,
      'shopping_added',
      dto.name,
      listId,
    );

    return this.getSerializedItemById(item.id);
  }

  // 更新购物清单项
  async updateShoppingItem(
    itemId: string,
    userId: string,
    dto: UpdateShoppingItemDto,
  ) {
    const item = await this.getItemOrThrow(itemId);
    await this.verifyGroupMembership(item.list.group_id, userId);

    const { status, ...restDto } = dto;
    const stateUpdate =
      status && this.isValidItemStatus(status)
        ? this.buildItemStateUpdate(status, item, userId)
        : {};

    await this.prisma.shoppingItem.update({
      where: { id: itemId },
      data: {
        ...restDto,
        ...stateUpdate,
      },
    });

    if (item.status === 'purchased' && status === 'pending') {
      await this.createFeed(
        item.list.group_id,
        userId,
        'shopping_reopened',
        item.name,
        item.list.id,
      );
    }

    return this.getSerializedItemById(itemId);
  }

  // 删除购物清单项
  async deleteShoppingItem(itemId: string, userId: string) {
    const item = await this.getItemOrThrow(itemId);
    await this.verifyGroupMembership(item.list.group_id, userId);

    await this.prisma.shoppingItem.delete({
      where: { id: itemId },
    });
  }

  // 领取购物任务
  async claimShoppingItem(itemId: string, userId: string) {
    const item = await this.getItemOrThrow(itemId);
    await this.verifyGroupMembership(item.list.group_id, userId);

    if (item.assigned_to && item.assigned_to !== userId) {
      throw new ForbiddenException('该任务已被其他成员领取');
    }

    await this.prisma.shoppingItem.update({
      where: { id: itemId },
      data: {
        ...this.buildItemStateUpdate('claimed', item, userId),
        assigned_to: userId,
      },
    });

    return this.getSerializedItemById(itemId);
  }

  // 认领并标记已购买
  async claimAndPurchaseShoppingItem(itemId: string, userId: string) {
    const item = await this.getItemOrThrow(itemId);
    await this.verifyGroupMembership(item.list.group_id, userId);
    this.assertCanPurchase(item, userId);

    const updateResult = await this.prisma.shoppingItem.updateMany({
      where: {
        id: itemId,
        status: {
          in: ['pending', 'claimed'],
        },
        OR: [{ assigned_to: null }, { assigned_to: userId }],
      },
      data: this.buildItemStateUpdate('purchased', item, userId),
    });

    if (updateResult.count === 0) {
      throw new ForbiddenException('该任务已由其他成员认领');
    }

    await this.createFeed(
      item.list.group_id,
      userId,
      'shopping_purchased',
      item.name,
      item.list.id,
    );

    return this.getSerializedItemById(itemId);
  }

  // 组长分配购物任务
  async assignShoppingItem(
    itemId: string,
    userId: string,
    dto: AssignShoppingItemDto,
  ) {
    const item = await this.getItemOrThrow(itemId);
    const membership = await this.verifyGroupMembership(
      item.list.group_id,
      userId,
    );

    if (membership.role !== 'owner') {
      throw new ForbiddenException('只有组长可以分配购物任务');
    }

    const assignee = await this.verifyGroupMembership(
      item.list.group_id,
      dto.assignedTo,
    );
    if (!assignee) {
      throw new ForbiddenException('目标成员不属于该家庭组');
    }

    await this.prisma.shoppingItem.update({
      where: { id: itemId },
      data: {
        ...this.buildItemStateUpdate('claimed', item, userId),
        assigned_to: dto.assignedTo,
      },
    });

    return this.getSerializedItemById(itemId);
  }

  // 标记为已购买
  async markAsPurchased(itemId: string, userId: string) {
    const item = await this.getItemOrThrow(itemId);
    await this.verifyGroupMembership(item.list.group_id, userId);
    this.assertCanPurchase(item, userId);

    await this.prisma.shoppingItem.update({
      where: { id: itemId },
      data: this.buildItemStateUpdate('purchased', item, userId),
    });

    await this.createFeed(
      item.list.group_id,
      userId,
      'shopping_purchased',
      item.name,
      item.list.id,
    );

    return this.getSerializedItemById(itemId);
  }

  // 完成购物清单
  async completeShoppingList(listId: string, userId: string) {
    const list = await this.getActiveListOrThrow(listId);
    await this.verifyGroupMembership(list.group_id, userId);

    await this.prisma.shoppingList.update({
      where: { id: listId },
      data: {
        status: 'completed',
      },
    });

    return this.getSerializedListById(listId);
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

    const listIds = lists.map((list) => list.id);

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
