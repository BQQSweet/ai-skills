import { ForbiddenException } from '@nestjs/common';
import { ShoppingService } from './shopping.service';

describe('ShoppingService', () => {
  const prisma = {
    shoppingItem: {
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  let service: ShoppingService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.shoppingItem.updateMany.mockResolvedValue({ count: 1 });
    service = new ShoppingService(prisma as any);
  });

  it('creates a shopping_reopened feed when reverting a purchased item to pending', async () => {
    const purchasedItem = {
      id: 'item-1',
      name: '番茄',
      status: 'purchased',
      assigned_to: 'user-1',
      list: {
        id: 'list-1',
        group_id: 'group-1',
      },
    };

    jest
      .spyOn(service as any, 'getItemOrThrow')
      .mockResolvedValue(purchasedItem);
    jest
      .spyOn(service as any, 'verifyGroupMembership')
      .mockResolvedValue({ id: 'member-1' });
    const createFeedSpy = jest
      .spyOn(service as any, 'createFeed')
      .mockResolvedValue(undefined);
    jest
      .spyOn(service as any, 'getSerializedItemById')
      .mockResolvedValue({ id: 'item-1', status: 'pending' });

    const result = await service.updateShoppingItem('item-1', 'user-2', {
      status: 'pending',
    });

    expect(prisma.shoppingItem.update).toHaveBeenCalledWith({
      where: { id: 'item-1' },
      data: expect.objectContaining({
        status: 'pending',
        assigned_to: null,
        is_bought: false,
        bought_at: null,
        purchased_by: null,
      }),
    });
    expect(createFeedSpy).toHaveBeenCalledWith(
      'group-1',
      'user-2',
      'shopping_reopened',
      '番茄',
      'list-1',
    );
    expect(result).toEqual({ id: 'item-1', status: 'pending' });
  });

  it('does not create a shopping_reopened feed for non-purchased items', async () => {
    const pendingItem = {
      id: 'item-1',
      name: '番茄',
      status: 'pending',
      assigned_to: null,
      list: {
        id: 'list-1',
        group_id: 'group-1',
      },
    };

    jest
      .spyOn(service as any, 'getItemOrThrow')
      .mockResolvedValue(pendingItem);
    jest
      .spyOn(service as any, 'verifyGroupMembership')
      .mockResolvedValue({ id: 'member-1' });
    const createFeedSpy = jest
      .spyOn(service as any, 'createFeed')
      .mockResolvedValue(undefined);
    jest
      .spyOn(service as any, 'getSerializedItemById')
      .mockResolvedValue({ id: 'item-1', status: 'pending' });

    await service.updateShoppingItem('item-1', 'user-2', {
      status: 'pending',
    });

    expect(createFeedSpy).not.toHaveBeenCalled();
  });

  it('rejects purchasing an item claimed by another member', async () => {
    jest.spyOn(service as any, 'getItemOrThrow').mockResolvedValue({
      id: 'item-1',
      name: '番茄',
      status: 'claimed',
      assigned_to: 'user-1',
      list: {
        id: 'list-1',
        group_id: 'group-1',
      },
    });
    jest
      .spyOn(service as any, 'verifyGroupMembership')
      .mockResolvedValue({ id: 'member-2' });

    await expect(service.markAsPurchased('item-1', 'user-2')).rejects.toThrow(
      new ForbiddenException('该任务已由其他成员认领'),
    );
    expect(prisma.shoppingItem.update).not.toHaveBeenCalled();
  });

  it('claims and purchases an unassigned item in one step', async () => {
    jest.spyOn(service as any, 'getItemOrThrow').mockResolvedValue({
      id: 'item-1',
      name: '番茄',
      status: 'pending',
      assigned_to: null,
      list: {
        id: 'list-1',
        group_id: 'group-1',
      },
    });
    jest
      .spyOn(service as any, 'verifyGroupMembership')
      .mockResolvedValue({ id: 'member-2' });
    const createFeedSpy = jest
      .spyOn(service as any, 'createFeed')
      .mockResolvedValue(undefined);
    jest.spyOn(service as any, 'getSerializedItemById').mockResolvedValue({
      id: 'item-1',
      status: 'purchased',
      assignedTo: 'user-2',
      purchasedBy: 'user-2',
    });

    const result = await service.claimAndPurchaseShoppingItem('item-1', 'user-2');

    expect(prisma.shoppingItem.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'item-1',
        status: {
          in: ['pending', 'claimed'],
        },
        OR: [{ assigned_to: null }, { assigned_to: 'user-2' }],
      },
      data: expect.objectContaining({
        status: 'purchased',
        assigned_to: 'user-2',
        purchased_by: 'user-2',
        is_bought: true,
      }),
    });
    expect(createFeedSpy).toHaveBeenCalledWith(
      'group-1',
      'user-2',
      'shopping_purchased',
      '番茄',
      'list-1',
    );
    expect(result).toEqual({
      id: 'item-1',
      status: 'purchased',
      assignedTo: 'user-2',
      purchasedBy: 'user-2',
    });
  });

  it('rejects claim-and-purchase when the item is taken during update', async () => {
    jest.spyOn(service as any, 'getItemOrThrow').mockResolvedValue({
      id: 'item-1',
      name: '番茄',
      status: 'pending',
      assigned_to: null,
      list: {
        id: 'list-1',
        group_id: 'group-1',
      },
    });
    jest
      .spyOn(service as any, 'verifyGroupMembership')
      .mockResolvedValue({ id: 'member-2' });
    prisma.shoppingItem.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      service.claimAndPurchaseShoppingItem('item-1', 'user-2'),
    ).rejects.toThrow(new ForbiddenException('该任务已由其他成员认领'));
  });

  it('classifies common main ingredients as ingredient', () => {
    const result = service.classifyRecipeIngredients({
      recipeTitle: '番茄炒蛋',
      ingredients: [
        { name: '番茄', quantity: 2, unit: '个' },
        { name: '鸡蛋', quantity: 3, unit: '个' },
      ],
    });

    expect(result.ingredients).toEqual([
      expect.objectContaining({
        name: '番茄',
        type: 'ingredient',
        selectedByDefault: true,
      }),
      expect.objectContaining({
        name: '鸡蛋',
        type: 'ingredient',
        selectedByDefault: true,
      }),
    ]);
  });

  it('classifies common seasonings as seasoning', () => {
    const result = service.classifyRecipeIngredients({
      recipeTitle: '番茄炒蛋',
      ingredients: [
        { name: '食用油', quantity: 10, unit: 'ml' },
        { name: '生抽', quantity: 1, unit: '勺' },
      ],
    });

    expect(result.ingredients).toEqual([
      expect.objectContaining({
        name: '食用油',
        type: 'seasoning',
        selectedByDefault: false,
      }),
      expect.objectContaining({
        name: '生抽',
        type: 'seasoning',
        selectedByDefault: false,
      }),
    ]);
  });

  it('falls back unknown items to ingredient', () => {
    const result = service.classifyRecipeIngredients({
      recipeTitle: '自定义菜谱',
      ingredients: [{ name: '秘制风味块', quantity: 1, unit: '块' }],
    });

    expect(result.ingredients[0]).toEqual(
      expect.objectContaining({
        name: '秘制风味块',
        type: 'ingredient',
        selectedByDefault: true,
      }),
    );
  });
});
