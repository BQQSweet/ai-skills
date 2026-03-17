import type { GroupRole } from "@/types/group";
import type { ShoppingCategory, ShoppingItem } from "@/types/shopping";

export const shoppingCategories: ShoppingCategory[] = [
  "vegetable",
  "meat",
  "seafood",
  "fruit",
  "seasoning",
  "dairy",
  "grain",
  "snack",
  "beverage",
  "other",
];

export const shoppingCategoryLabels: Record<ShoppingCategory, string> = {
  vegetable: "蔬菜",
  meat: "肉类",
  seafood: "海鲜",
  fruit: "水果",
  seasoning: "调料",
  dairy: "乳制品",
  grain: "粮油",
  snack: "零食",
  beverage: "饮料",
  other: "其他",
};

export const shoppingCategoryIcons: Record<ShoppingCategory, string> = {
  vegetable: "eco",
  meat: "set_meal",
  seafood: "phishing",
  fruit: "nutrition",
  seasoning: "soup_kitchen",
  dairy: "egg_alt",
  grain: "breakfast_dining",
  snack: "cookie",
  beverage: "local_cafe",
  other: "shopping_bag",
};

export const shoppingRoleLabels: Record<GroupRole, string> = {
  owner: "创建者",
  admin: "管理员",
  member: "成员",
};

export interface ShoppingActiveMember {
  id: string;
  name: string;
  avatarUrl: string;
}

export function getCompletedMeta(item: ShoppingItem) {
  if (item.hasInFridge && item.status !== "purchased") {
    return item.fridgeMatchedName
      ? `冰箱已有 ${item.fridgeMatchedName}`
      : "冰箱库存已命中";
  }

  if (item.purchasedByName) {
    return `${item.purchasedByName} 已采购`;
  }

  return "已完成采购";
}
