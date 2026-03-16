import { post, get, del } from "./request";
import type { FridgeItem } from "@/types/fridge";

/** AI 识别食材标签图片 */
export function recognizeLabel(image: string) {
  return post("/api/fridge/recognize", { image });
}

/** 添加食材到冰箱 */
export interface AddFridgeItemParams {
  groupId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expire_date: string;
  production_date?: string;
  photo_url?: string;
  photo_base64?: string;
  source?: string;
}

export function addFridgeItem(data: AddFridgeItemParams) {
  return post<FridgeItem>("/api/fridge/items", data);
}

/** 查询冰箱食材列表 */
export function getFridgeItems(groupId: string) {
  return get<FridgeItem[]>("/api/fridge/items", { groupId });
}

/** 删除冰箱食材 */
export function deleteFridgeItem(id: string, groupId: string) {
  return del(`/api/fridge/items/${id}`, { groupId });
}

/** 一键清理过期食材 */
export function clearExpiredItems(groupId: string) {
  return del<{ cleared: number }>("/api/fridge/items/expired", { groupId });
}
