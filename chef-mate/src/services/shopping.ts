/**
 * 购物清单相关 API
 */
import { get, post, put, del } from "./request";
import type {
  AssignShoppingItemParams,
  GenerateShoppingListFromRecipeParams,
  AddShoppingItemParams,
  ShoppingItem,
  ShoppingList,
  UpdateShoppingItemParams,
  BatchUpdateStatusParams,
  ShoppingStats,
  CategoryStats,
} from "@/types/shopping";

/** 获取家庭组购物清单 */
export function getShoppingLists(groupId: string): Promise<ShoppingList[]> {
  return get<ShoppingList[]>(`/api/shopping/${groupId}`);
}

/** 创建购物清单 */
export function createShoppingList(
  groupId: string,
  params: {
    title: string;
    recipeId?: string;
    source?: "manual" | "recipe";
  },
): Promise<ShoppingList> {
  return post<ShoppingList>(`/api/shopping/${groupId}`, params);
}

/** 基于食谱生成购物清单 */
export function createShoppingListFromRecipe(
  groupId: string,
  params: GenerateShoppingListFromRecipeParams,
): Promise<ShoppingList> {
  return post<ShoppingList>(`/api/shopping/${groupId}/from-recipe`, params);
}

/** 添加购物清单项 */
export function addShoppingItem(
  listId: string,
  params: AddShoppingItemParams
): Promise<ShoppingItem> {
  return post<ShoppingItem>(`/api/shopping/list/${listId}/item`, {
    ...params,
    quantity: params.quantity ?? 1,
    unit: params.unit ?? "份",
  });
}

/** 更新购物清单项 */
export function updateShoppingItem(
  itemId: string,
  params: UpdateShoppingItemParams
): Promise<ShoppingItem> {
  return put<ShoppingItem>(`/api/shopping/item/${itemId}`, params);
}

/** 删除购物清单项 */
export function deleteShoppingItem(itemId: string): Promise<void> {
  return del<void>(`/api/shopping/item/${itemId}`);
}

/** 标记为已购买 */
export function markAsPurchased(itemId: string): Promise<ShoppingItem> {
  return put<ShoppingItem>(`/api/shopping/item/${itemId}/purchase`, {});
}

/** 领取购物任务 */
export function claimShoppingItem(itemId: string): Promise<ShoppingItem> {
  return put<ShoppingItem>(`/api/shopping/item/${itemId}/claim`, {});
}

/** 认领并标记为已购买 */
export function claimAndPurchaseShoppingItem(
  itemId: string,
): Promise<ShoppingItem> {
  return put<ShoppingItem>(`/api/shopping/item/${itemId}/claim-and-purchase`, {});
}

/** 组长分配购物任务 */
export function assignShoppingItem(
  itemId: string,
  params: AssignShoppingItemParams,
): Promise<ShoppingItem> {
  return put<ShoppingItem>(`/api/shopping/item/${itemId}/assign`, params);
}

/** 批量更新状态 */
export function batchUpdateStatus(
  params: BatchUpdateStatusParams
): Promise<void> {
  return put<void>("/api/shopping/batch-status", params);
}

/** 获取购物清单统计 */
export function getShoppingStats(groupId: string): Promise<ShoppingStats> {
  return get<ShoppingStats>(`/api/shopping/${groupId}/stats`);
}

/** 获取分类统计 */
export function getCategoryStats(
  groupId: string
): Promise<CategoryStats[]> {
  return get<CategoryStats[]>(`/api/shopping/${groupId}/category-stats`);
}

/** 清空已购买项 */
export function clearPurchased(groupId: string): Promise<void> {
  return del<void>(`/api/shopping/${groupId}/purchased`);
}
