/**
 * 购物清单相关 API
 */
import { get, post, put, del } from "./request";
import type {
  ShoppingItem,
  AddShoppingItemParams,
  UpdateShoppingItemParams,
  BatchUpdateStatusParams,
  ShoppingStats,
  CategoryStats,
} from "@/types/shopping";

/** 获取家庭组购物清单 */
export function getShoppingList(groupId: string): Promise<ShoppingItem[]> {
  return get<ShoppingItem[]>(`/api/shopping/${groupId}`);
}

/** 添加购物清单项 */
export function addShoppingItem(
  groupId: string,
  params: AddShoppingItemParams
): Promise<ShoppingItem> {
  return post<ShoppingItem>(`/api/shopping/${groupId}`, params);
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
