import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  ShoppingList,
  ShoppingItem,
  AddShoppingItemParams,
  AssignShoppingItemParams,
  GenerateShoppingListFromRecipeParams,
  UpdateShoppingItemParams,
  ShoppingStats,
  ShoppingCategory,
} from "@/types/shopping";
import * as shoppingApi from "@/services/shopping";

export const useShoppingStore = defineStore("shopping", () => {
  /** 购物清单列表 */
  const shoppingLists = ref<ShoppingList[]>([]);

  /** 当前活跃清单 */
  const activeListId = ref<string>("");

  /** 是否正在加载 */
  const loading = ref(false);

  const activeList = computed<ShoppingList | null>(() => {
    return shoppingLists.value.find((list) => list.id === activeListId.value) || null;
  });

  /** 当前活跃清单项 */
  const shoppingList = computed<ShoppingItem[]>(() => activeList.value?.items || []);

  /** 待购买项 */
  const pendingItems = computed(() =>
    shoppingList.value.filter((item) => item.status === "pending")
  );

  /** 已领取项 */
  const claimedItems = computed(() =>
    shoppingList.value.filter((item) => item.status === "claimed")
  );

  /** 已购买项 */
  const purchasedItems = computed(() =>
    shoppingList.value.filter((item) => item.status === "purchased")
  );

  /** 按分类分组 */
  const itemsByCategory = computed(() => {
    const grouped: Record<ShoppingCategory, ShoppingItem[]> = {
      vegetable: [],
      meat: [],
      seafood: [],
      fruit: [],
      seasoning: [],
      dairy: [],
      grain: [],
      snack: [],
      beverage: [],
      other: [],
    };

    pendingItems.value.forEach((item) => {
      grouped[item.category].push(item);
    });

    return grouped;
  });

  /** 统计信息 */
  const stats = computed<ShoppingStats>(() => ({
    total: shoppingList.value.length,
    pending: pendingItems.value.length,
    claimed: claimedItems.value.length,
    purchased: purchasedItems.value.length,
    cancelled: shoppingList.value.filter((item) => item.status === "cancelled")
      .length,
  }));

  function syncActiveListId() {
    if (shoppingLists.value.length === 0) {
      activeListId.value = "";
      return;
    }

    if (shoppingLists.value.some((list) => list.id === activeListId.value)) {
      return;
    }

    activeListId.value = shoppingLists.value[0].id;
  }

  function replaceItemInLists(updatedItem: ShoppingItem) {
    const list = shoppingLists.value.find((shoppingList) =>
      shoppingList.items.some((item) => item.id === updatedItem.id)
    );
    const index = list?.items.findIndex((item) => item.id === updatedItem.id) ?? -1;
    if (list && index !== -1) {
      list.items[index] = updatedItem;
      list.updatedAt = updatedItem.updatedAt;
    }
  }

  /**
   * 获取购物清单
   */
  async function fetchShoppingLists(groupId: string) {
    loading.value = true;
    try {
      const lists = await shoppingApi.getShoppingLists(groupId);
      shoppingLists.value = lists;
      syncActiveListId();
      return lists;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 创建手动清单
   */
  async function createList(
    groupId: string,
    params: { title: string; recipeId?: string; source?: "manual" | "recipe" }
  ) {
    const list = await shoppingApi.createShoppingList(groupId, params);
    shoppingLists.value.unshift(list);
    activeListId.value = list.id;
    return list;
  }

  /**
   * 基于食谱生成协作清单
   */
  async function createListFromRecipe(
    groupId: string,
    params: GenerateShoppingListFromRecipeParams,
  ) {
    const list = await shoppingApi.createShoppingListFromRecipe(groupId, params);
    const index = shoppingLists.value.findIndex((item) => item.id === list.id);
    if (index === -1) {
      shoppingLists.value.unshift(list);
    } else {
      shoppingLists.value[index] = list;
    }
    activeListId.value = list.id;
    return list;
  }

  /**
   * 选中当前活跃清单
   */
  function setActiveList(listId: string) {
    activeListId.value = listId;
  }

  /**
   * 添加购物项
   */
  async function addItem(groupId: string, params: AddShoppingItemParams) {
    let listId = activeListId.value;
    if (!listId) {
      const list = await createList(groupId, {
        title: "家庭协作清单",
        source: "manual",
      });
      listId = list.id;
    }

    const item = await shoppingApi.addShoppingItem(listId, params);
    const list = shoppingLists.value.find((shoppingList) => shoppingList.id === listId);
    if (list) {
      list.items.unshift(item);
      list.updatedAt = item.updatedAt;
    }
    return item;
  }

  /**
   * 更新购物项
   */
  async function updateItem(itemId: string, params: UpdateShoppingItemParams) {
    const updatedItem = await shoppingApi.updateShoppingItem(itemId, params);
    replaceItemInLists(updatedItem);
    return updatedItem;
  }

  /**
   * 删除购物项
   */
  async function deleteItem(itemId: string) {
    await shoppingApi.deleteShoppingItem(itemId);
    const list = shoppingLists.value.find((shoppingList) =>
      shoppingList.items.some((item) => item.id === itemId)
    );
    const index = list?.items.findIndex((item) => item.id === itemId) ?? -1;
    if (list && index !== -1) {
      list.items.splice(index, 1);
    }
  }

  /**
   * 标记为已购买
   */
  async function markAsPurchased(itemId: string) {
    const updatedItem = await shoppingApi.markAsPurchased(itemId);
    replaceItemInLists(updatedItem);
    return updatedItem;
  }

  /**
   * 切换购买状态
   */
  async function togglePurchased(itemId: string) {
    const item = shoppingList.value.find((i) => i.id === itemId);
    if (!item) return;

    if (item.status === "purchased") {
      return updateItem(itemId, { status: "pending" });
    }

    return markAsPurchased(itemId);
  }

  /**
   * 领取购物任务
   */
  async function claimItem(itemId: string) {
    const updatedItem = await shoppingApi.claimShoppingItem(itemId);
    replaceItemInLists(updatedItem);
    return updatedItem;
  }

  /**
   * 认领并立即完成采购
   */
  async function claimAndPurchase(itemId: string) {
    const updatedItem = await shoppingApi.claimAndPurchaseShoppingItem(itemId);
    replaceItemInLists(updatedItem);
    return updatedItem;
  }

  /**
   * 组长分配任务
   */
  async function assignItem(itemId: string, params: AssignShoppingItemParams) {
    const updatedItem = await shoppingApi.assignShoppingItem(itemId, params);
    replaceItemInLists(updatedItem);
    return updatedItem;
  }

  /**
   * 清空已购买项
   */
  async function clearPurchased(groupId: string) {
    await shoppingApi.clearPurchased(groupId);
    shoppingLists.value = shoppingLists.value.map((list) => ({
      ...list,
      items: list.items.filter((item) => item.status !== "purchased"),
    }));
  }

  /**
   * 清空所有数据
   */
  function clearAll() {
    shoppingLists.value = [];
    activeListId.value = "";
  }

  return {
    shoppingLists,
    activeListId,
    activeList,
    shoppingList,
    loading,
    pendingItems,
    claimedItems,
    purchasedItems,
    itemsByCategory,
    stats,
    fetchShoppingLists,
    createList,
    createListFromRecipe,
    setActiveList,
    addItem,
    updateItem,
    deleteItem,
    markAsPurchased,
    togglePurchased,
    claimItem,
    claimAndPurchase,
    assignItem,
    clearPurchased,
    clearAll,
  };
});
