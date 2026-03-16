import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  ShoppingItem,
  AddShoppingItemParams,
  UpdateShoppingItemParams,
  ShoppingStats,
  ShoppingCategory,
} from "@/types/shopping";
import * as shoppingApi from "@/services/shopping";

export const useShoppingStore = defineStore("shopping", () => {
  /** 购物清单列表 */
  const shoppingList = ref<ShoppingItem[]>([]);

  /** 是否正在加载 */
  const loading = ref(false);

  /** 待购买项 */
  const pendingItems = computed(() =>
    shoppingList.value.filter((item) => item.status === "pending")
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
    purchased: purchasedItems.value.length,
    cancelled: shoppingList.value.filter((item) => item.status === "cancelled")
      .length,
  }));

  /**
   * 获取购物清单
   */
  async function fetchShoppingList(groupId: string) {
    loading.value = true;
    try {
      const list = await shoppingApi.getShoppingList(groupId);
      shoppingList.value = list;
      return list;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 添加购物项
   */
  async function addItem(groupId: string, params: AddShoppingItemParams) {
    const item = await shoppingApi.addShoppingItem(groupId, params);
    shoppingList.value.unshift(item);
    return item;
  }

  /**
   * 更新购物项
   */
  async function updateItem(itemId: string, params: UpdateShoppingItemParams) {
    const updatedItem = await shoppingApi.updateShoppingItem(itemId, params);
    const index = shoppingList.value.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      shoppingList.value[index] = updatedItem;
    }
    return updatedItem;
  }

  /**
   * 删除购物项
   */
  async function deleteItem(itemId: string) {
    await shoppingApi.deleteShoppingItem(itemId);
    const index = shoppingList.value.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      shoppingList.value.splice(index, 1);
    }
  }

  /**
   * 标记为已购买
   */
  async function markAsPurchased(itemId: string) {
    const updatedItem = await shoppingApi.markAsPurchased(itemId);
    const index = shoppingList.value.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      shoppingList.value[index] = updatedItem;
    }
    return updatedItem;
  }

  /**
   * 切换购买状态
   */
  async function togglePurchased(itemId: string) {
    const item = shoppingList.value.find((i) => i.id === itemId);
    if (!item) return;

    const newStatus = item.status === "purchased" ? "pending" : "purchased";
    return updateItem(itemId, { status: newStatus });
  }

  /**
   * 清空已购买项
   */
  async function clearPurchased(groupId: string) {
    await shoppingApi.clearPurchased(groupId);
    shoppingList.value = shoppingList.value.filter(
      (item) => item.status !== "purchased"
    );
  }

  /**
   * 清空所有数据
   */
  function clearAll() {
    shoppingList.value = [];
  }

  return {
    shoppingList,
    loading,
    pendingItems,
    purchasedItems,
    itemsByCategory,
    stats,
    fetchShoppingList,
    addItem,
    updateItem,
    deleteItem,
    markAsPurchased,
    togglePurchased,
    clearPurchased,
    clearAll,
  };
});
