/** 家庭动态类型 */
export type FeedActionType =
  | 'shopping_purchased'  // 标记已购买
  | 'shopping_reopened'   // 撤回购买，重新待采购
  | 'shopping_added'      // 添加到购物清单
  | 'recipe_cooked'       // 完成烹饪
  | 'fridge_added'        // 添加到冰箱
  | 'fridge_expired';     // 食材过期

/** 家庭动态项 */
export interface FeedItem {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  actionType: FeedActionType;
  action: string;          // 动作描述，如 "标记了"
  target: string;          // 目标对象，如 "生姜"
  actionSuffix: string;    // 动作后缀，可为空字符串
  targetId?: string;       // 购物动态中指向购物清单ID
  createdAt: string;
}

/** 家庭动态响应 */
export interface FeedResponse {
  items: FeedItem[];
  total: number;
  hasMore: boolean;
}

/** 获取动态参数 */
export interface GetFeedParams {
  groupId: string;
  limit?: number;
  offset?: number;
}
