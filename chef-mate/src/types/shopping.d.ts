/** 购物清单项分类 */
export type ShoppingCategory =
  | 'vegetable'    // 蔬菜
  | 'meat'         // 肉类
  | 'seafood'      // 海鲜
  | 'fruit'        // 水果
  | 'seasoning'    // 调料
  | 'dairy'        // 乳制品
  | 'grain'        // 粮油
  | 'snack'        // 零食
  | 'beverage'     // 饮料
  | 'other';       // 其他

/** 购物清单项状态 */
export type ShoppingItemStatus = 'pending' | 'purchased' | 'cancelled';

/** 购物清单项 */
export interface ShoppingItem {
  id: string;
  groupId: string;
  name: string;
  category: ShoppingCategory;
  quantity?: number;
  unit?: string;
  status: ShoppingItemStatus;
  note?: string;
  addedBy: string;
  addedByName?: string;
  purchasedBy?: string;
  purchasedByName?: string;
  createdAt: string;
  updatedAt: string;
  purchasedAt?: string;
}

/** 添加购物清单项请求 */
export interface AddShoppingItemParams {
  name: string;
  category: ShoppingCategory;
  quantity?: number;
  unit?: string;
  note?: string;
}

/** 更新购物清单项请求 */
export interface UpdateShoppingItemParams {
  name?: string;
  category?: ShoppingCategory;
  quantity?: number;
  unit?: string;
  note?: string;
  status?: ShoppingItemStatus;
}

/** 批量更新购物清单项状态 */
export interface BatchUpdateStatusParams {
  itemIds: string[];
  status: ShoppingItemStatus;
}

/** 购物清单统计 */
export interface ShoppingStats {
  total: number;
  pending: number;
  purchased: number;
  cancelled: number;
}

/** 分类统计 */
export interface CategoryStats {
  category: ShoppingCategory;
  count: number;
  purchasedCount: number;
}
