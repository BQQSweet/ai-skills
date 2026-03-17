import { FeedService } from './feed.service';

describe('FeedService', () => {
  const prisma = {
    feed: {
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    shoppingList: {
      findMany: jest.fn(),
    },
    shoppingItem: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  let service: FeedService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FeedService(prisma as any);
    prisma.feed.deleteMany.mockResolvedValue({ count: 0 });
  });

  it('returns shopping_purchased without a trailing suffix', async () => {
    const createdAt = new Date('2026-03-16T10:00:00.000Z');

    prisma.feed.findMany.mockResolvedValue([
      {
        id: 'feed-1',
        group_id: 'group-1',
        user_id: 'user-1',
        action_type: 'shopping_purchased',
        target: '番茄',
        target_id: 'item-1',
        created_at: createdAt,
      },
    ]);
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        nickname: 'CM_5717',
        avatar_url: null,
      },
    ]);
    prisma.shoppingList.findMany.mockResolvedValue([]);
    prisma.shoppingItem.findMany.mockResolvedValue([
      {
        id: 'item-1',
        list_id: 'list-1',
        list: {
          deleted_at: null,
        },
      },
    ]);
    prisma.feed.count.mockResolvedValue(1);

    const result = await service.getFeedList('group-1');

    expect(result.items).toEqual([
      expect.objectContaining({
        userName: 'CM_5717',
        actionType: 'shopping_purchased',
        action: '购买了',
        target: '番茄',
        actionSuffix: '',
        targetId: 'list-1',
      }),
    ]);
  });

  it('returns shopping_reopened with the pending suffix', async () => {
    const createdAt = new Date('2026-03-16T10:00:00.000Z');

    prisma.feed.findMany.mockResolvedValue([
      {
        id: 'feed-reopened',
        group_id: 'group-1',
        user_id: 'user-1',
        action_type: 'shopping_reopened',
        target: '番茄',
        target_id: 'item-1',
        created_at: createdAt,
      },
    ]);
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        nickname: 'CM_5717',
        avatar_url: null,
      },
    ]);
    prisma.shoppingList.findMany.mockResolvedValue([]);
    prisma.shoppingItem.findMany.mockResolvedValue([
      {
        id: 'item-1',
        list_id: 'list-1',
        list: {
          deleted_at: null,
        },
      },
    ]);
    prisma.feed.count.mockResolvedValue(1);

    const result = await service.getFeedList('group-1');

    expect(result.items).toEqual([
      expect.objectContaining({
        userName: 'CM_5717',
        actionType: 'shopping_reopened',
        action: '重新标记为',
        target: '番茄',
        actionSuffix: '待采购',
        targetId: 'list-1',
      }),
    ]);
  });

  it('preserves suffixes for other feed action types', async () => {
    const createdAt = new Date('2026-03-16T10:00:00.000Z');

    prisma.feed.findMany.mockResolvedValue([
      {
        id: 'feed-1',
        group_id: 'group-1',
        user_id: 'user-1',
        action_type: 'shopping_added',
        target: '测试',
        target_id: 'list-1',
        created_at: createdAt,
      },
      {
        id: 'feed-2',
        group_id: 'group-1',
        user_id: 'user-1',
        action_type: 'recipe_cooked',
        target: '番茄炒蛋',
        target_id: 'recipe-1',
        created_at: createdAt,
      },
      {
        id: 'feed-3',
        group_id: 'group-1',
        user_id: 'user-1',
        action_type: 'fridge_added',
        target: '牛奶',
        target_id: 'fridge-1',
        created_at: createdAt,
      },
      {
        id: 'feed-4',
        group_id: 'group-1',
        user_id: 'user-1',
        action_type: 'fridge_expired',
        target: '生菜',
        target_id: 'fridge-2',
        created_at: createdAt,
      },
    ]);
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        nickname: 'CM_5718',
        avatar_url: null,
      },
    ]);
    prisma.shoppingList.findMany.mockResolvedValue([{ id: 'list-1' }]);
    prisma.shoppingItem.findMany.mockResolvedValue([
      {
        id: 'recipe-1',
        list_id: 'ignored-list',
        list: {
          deleted_at: null,
        },
      },
    ]);
    prisma.feed.count.mockResolvedValue(4);

    const result = await service.getFeedList('group-1');

    expect(result.items).toEqual([
      expect.objectContaining({
        actionType: 'shopping_added',
        action: '新增了',
        target: '测试',
        actionSuffix: '待采购',
        targetId: 'list-1',
      }),
      expect.objectContaining({
        actionType: 'recipe_cooked',
        action: '完成了',
        target: '番茄炒蛋',
        actionSuffix: '今日下厨',
        targetId: 'recipe-1',
      }),
      expect.objectContaining({
        actionType: 'fridge_added',
        action: '放入了',
        target: '牛奶',
        actionSuffix: '冰箱',
        targetId: 'fridge-1',
      }),
      expect.objectContaining({
        actionType: 'fridge_expired',
        action: '清理了',
        target: '生菜',
        actionSuffix: '已过期',
        targetId: 'fridge-2',
      }),
    ]);
  });

  it('maps legacy shopping_added item targets back to the shopping list', async () => {
    const createdAt = new Date('2026-03-16T10:00:00.000Z');

    prisma.feed.findMany.mockResolvedValue([
      {
        id: 'feed-legacy',
        group_id: 'group-1',
        user_id: 'user-1',
        action_type: 'shopping_added',
        target: '鸡蛋',
        target_id: 'item-legacy',
        created_at: createdAt,
      },
    ]);
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        nickname: 'CM_5718',
        avatar_url: null,
      },
    ]);
    prisma.shoppingList.findMany.mockResolvedValue([]);
    prisma.shoppingItem.findMany.mockResolvedValue([
      {
        id: 'item-legacy',
        list_id: 'list-legacy',
        list: {
          deleted_at: null,
        },
      },
    ]);
    prisma.feed.count.mockResolvedValue(1);

    const result = await service.getFeedList('group-1');

    expect(result.items[0]).toEqual(
      expect.objectContaining({
        actionType: 'shopping_added',
        target: '鸡蛋',
        targetId: 'list-legacy',
      }),
    );
  });

  it('maps legacy shopping_reopened item targets back to the shopping list', async () => {
    const createdAt = new Date('2026-03-16T10:00:00.000Z');

    prisma.feed.findMany.mockResolvedValue([
      {
        id: 'feed-reopened-legacy',
        group_id: 'group-1',
        user_id: 'user-1',
        action_type: 'shopping_reopened',
        target: '鸡蛋',
        target_id: 'item-reopened',
        created_at: createdAt,
      },
    ]);
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        nickname: 'CM_5718',
        avatar_url: null,
      },
    ]);
    prisma.shoppingList.findMany.mockResolvedValue([]);
    prisma.shoppingItem.findMany.mockResolvedValue([
      {
        id: 'item-reopened',
        list_id: 'list-reopened',
        list: {
          deleted_at: null,
        },
      },
    ]);
    prisma.feed.count.mockResolvedValue(1);

    const result = await service.getFeedList('group-1');

    expect(result.items[0]).toEqual(
      expect.objectContaining({
        actionType: 'shopping_reopened',
        target: '鸡蛋',
        targetId: 'list-reopened',
      }),
    );
  });
});
