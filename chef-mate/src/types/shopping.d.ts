export type ShoppingCategory =
  | "vegetable"
  | "meat"
  | "seafood"
  | "fruit"
  | "seasoning"
  | "dairy"
  | "grain"
  | "snack"
  | "beverage"
  | "other";

export type ShoppingItemStatus = "pending" | "claimed" | "purchased" | "cancelled";
export type ShoppingListSource = "manual" | "recipe";

export interface ShoppingItem {
  id: string;
  listId: string;
  groupId: string;
  title: string;
  source: ShoppingListSource;
  recipeId?: string;
  sourceRecipeTitle?: string;
  name: string;
  category: ShoppingCategory;
  quantity: number;
  unit: string;
  status: ShoppingItemStatus;
  note?: string;
  addedBy: string;
  addedByName?: string;
  assignedTo?: string;
  assignedToName?: string;
  purchasedBy?: string;
  purchasedByName?: string;
  hasInFridge: boolean;
  fridgeMatchedName?: string;
  createdAt: string;
  updatedAt: string;
  purchasedAt?: string;
}

export interface ShoppingList {
  id: string;
  groupId: string;
  title: string;
  status: string;
  source: ShoppingListSource;
  recipeId?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  items: ShoppingItem[];
}

export interface AddShoppingItemParams {
  name: string;
  category: ShoppingCategory;
  quantity?: number;
  unit?: string;
  note?: string;
}

export interface UpdateShoppingItemParams {
  name?: string;
  category?: ShoppingCategory;
  quantity?: number;
  unit?: string;
  note?: string;
  status?: ShoppingItemStatus;
}

export interface GenerateShoppingListFromRecipeParams {
  recipeId?: string;
  recipeTitle: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    optional?: boolean;
  }>;
  mode: "create" | "overwrite";
  targetListId?: string;
}

export interface AssignShoppingItemParams {
  assignedTo: string;
}

export interface BatchUpdateStatusParams {
  itemIds: string[];
  status: ShoppingItemStatus;
}

export interface ShoppingStats {
  total: number;
  pending: number;
  claimed: number;
  purchased: number;
  cancelled: number;
}

export interface CategoryStats {
  category: ShoppingCategory;
  count: number;
  purchasedCount: number;
}
