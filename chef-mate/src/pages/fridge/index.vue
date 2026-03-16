<template>
  <view
    class="flex flex-col min-h-screen relative overflow-x-hidden bg-[#f8f7f5] text-slate-800 pb-32"
  >
    <!-- Common Header Component -->
    <FridgeHeader v-model="searchKeyword" />

    <!-- Main Content -->
    <main class="flex-1 px-5 pt-4">
      <!-- AI Generative Banner -->
      <FridgeAiBanner :ingredients="selectedIngredients" />

      <!-- Inventory List Title -->
      <view class="flex justify-between items-center mb-4">
        <view class="flex items-center gap-3">
          <view
            class="text-lg font-bold text-slate-800 tracking-tight flex items-center"
          >
            <text>当前库存</text>
            <text class="text-slate-400 text-sm font-normal ml-2"
              >已选 {{ selectedCount }} 件</text
            >
          </view>
          <text
            class="text-primary text-sm font-medium active:opacity-70 active:underline"
            @click="handleClearSelection"
            >取消选择</text
          >
        </view>
        <view
          class="text-slate-400 text-sm font-medium flex items-center gap-1 active:opacity-70"
          @click="handleSort"
        >
          <text>排序</text>
          <text class="material-symbols-outlined text-[16px]">sort</text>
        </view>
      </view>

      <!-- 清理过期提示 -->
      <view
        v-if="expiredCount > 0"
        class="flex items-center justify-between mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl"
      >
        <view class="flex items-center gap-2">
          <text class="material-symbols-outlined text-red-400 text-[18px]"
            >warning</text
          >
          <text class="text-red-500 text-xs font-medium"
            >有 {{ expiredCount }} 件食材已过期</text
          >
        </view>
        <button
          class="m-0 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg border-none after:hidden active:scale-95 transition-transform"
          @click="showClearExpiredModal = true"
        >
          一键清理
        </button>
      </view>

      <!-- Inventory Grid -->
      <view class="grid grid-cols-2 gap-4">
        <FridgeItemCard
          v-for="item in inventoryList"
          :key="item.id"
          :item="item"
          @toggle-select="toggleSelectItem"
          @edit="handleEditItem"
          @delete="handleDeleteItem"
        />
      </view>
    </main>

    <!-- Expandable FAB Menu -->
    <FridgeFab @added="loadItems" />

    <!-- Global UI Feedback -->
    <up-toast ref="uToastRef"></up-toast>

    <!-- 出库确认弹窗 -->
    <up-modal
      :show="showDeleteModal"
      title="确认出库"
      :content="`确定要将「${pendingDeleteItem?.name || ''}」从冰箱中移除吗？`"
      showCancelButton
      confirmText="出库"
      confirmColor="#ef4444"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
      @close="showDeleteModal = false"
    ></up-modal>

    <!-- 清理过期确认弹窗 -->
    <up-modal
      :show="showClearExpiredModal"
      title="清理过期食材"
      :content="`确定要清理所有 ${expiredCount} 件过期食材吗？此操作不可撤销。`"
      showCancelButton
      confirmText="确认清理"
      confirmColor="#ef4444"
      @confirm="confirmClearExpired"
      @cancel="showClearExpiredModal = false"
      @close="showClearExpiredModal = false"
    ></up-modal>

    <!-- Bottom Navigation Component -->
    <CmTabBar :current="3" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import FridgeHeader from "./components/FridgeHeader.vue";
import FridgeAiBanner from "./components/FridgeAiBanner.vue";
import FridgeItemCard from "./components/FridgeItemCard.vue";
import FridgeFab from "./components/FridgeFab.vue";
import {
  getFridgeItems,
  deleteFridgeItem,
  clearExpiredItems,
} from "@/services/fridge";
import { BASE_URL } from "@/utils/env";
import type { FridgeItem, FridgeItemUI } from "@/types/fridge";
import { getExpiryStatus } from "@/utils/expiry";

const searchKeyword = ref("");
const uToastRef = ref();

// ---------- 分类 → 样式映射 ----------
const categoryStyleMap: Record<string, { bgClass: string; emoji: string }> = {
  肉禽: { bgClass: "bg-orange-50", emoji: "🥩" },
  果蔬: { bgClass: "bg-green-50", emoji: "🥦" },
  海鲜: { bgClass: "bg-blue-50", emoji: "🐟" },
  乳制品: { bgClass: "bg-yellow-50", emoji: "🧀" },
  调味: { bgClass: "bg-amber-50", emoji: "🧂" },
  主食: { bgClass: "bg-orange-50", emoji: "🍚" },
  零食: { bgClass: "bg-pink-50", emoji: "🍪" },
  饮品: { bgClass: "bg-cyan-50", emoji: "🥤" },
  其他: { bgClass: "bg-slate-50", emoji: "📦" },
};

// ---------- 过期状态计算 ----------
// 已迁移到 @/utils/expiry.ts

// ---------- API → UI 数据转换 ----------
function transformItem(raw: FridgeItem): FridgeItemUI {
  const style = categoryStyleMap[raw.category] || categoryStyleMap["其他"];
  const expire = getExpiryStatus(raw.expire_date);

  return {
    id: raw.id,
    name: raw.name,
    quantity: `${raw.quantity}${raw.unit}`,
    image: raw.photo_url
      ? raw.photo_url.startsWith("http")
        ? raw.photo_url
        : `${BASE_URL}${raw.photo_url}`
      : "",
    bgClass: style.bgClass,
    emoji: style.emoji,
    ...expire,
    selected: false,
  };
}

// ---------- 数据 ----------
const inventoryList = ref<FridgeItemUI[]>([]);

const loadItems = async () => {
  try {
    const res = await getFridgeItems();
    inventoryList.value = (res as FridgeItem[]).map(transformItem);
  } catch (e: unknown) {
    console.error("Failed to load fridge items:", e);
  }
};

onMounted(() => {
  loadItems();
});

const expiredCount = computed(
  () => inventoryList.value.filter((i) => i.statusType === "error").length,
);

const selectedCount = computed(
  () => inventoryList.value.filter((i) => i.selected).length,
);

const selectedIngredients = computed(() =>
  inventoryList.value.filter((i) => i.selected).map((i) => i.name),
);

const toggleSelectItem = (item: FridgeItemUI) => {
  item.selected = !item.selected;
};

const handleClearSelection = () => {
  inventoryList.value.forEach((item) => (item.selected = false));
  uToastRef.value?.show({
    type: "success",
    message: "已清空选择",
  });
};

const handleSort = () => {
  uToastRef.value?.show({
    type: "default",
    icon: "order",
    message: "排序功能开发中",
  });
};

const handleEditItem = (item: FridgeItemUI) => {
  uToastRef.value?.show({
    type: "default",
    message: "编辑功能开发中",
  });
};

const showDeleteModal = ref(false);
const pendingDeleteItem = ref<FridgeItemUI | null>(null);

const handleDeleteItem = (item: FridgeItemUI) => {
  pendingDeleteItem.value = item;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  showDeleteModal.value = false;
  const item = pendingDeleteItem.value;
  if (!item) return;
  try {
    await deleteFridgeItem(item.id);
    inventoryList.value = inventoryList.value.filter((i) => i.id !== item.id);
    uToastRef.value?.show({ type: "success", message: `${item.name} 已出库` });
  } catch (e: unknown) {
    uToastRef.value?.show({ type: "error", message: "出库失败" });
  } finally {
    pendingDeleteItem.value = null;
  }
};

const showClearExpiredModal = ref(false);

const confirmClearExpired = async () => {
  showClearExpiredModal.value = false;
  try {
    const res = await clearExpiredItems();
    const count = (res as { cleared: number })?.cleared || 0;
    inventoryList.value = inventoryList.value.filter(
      (i) => i.statusType !== "error",
    );
    uToastRef.value?.show({
      type: "success",
      message: `已清理 ${count} 件过期食材`,
    });
  } catch (e: unknown) {
    uToastRef.value?.show({ type: "error", message: "清理失败" });
  }
};
</script>

<style scoped>
/* Hidden scrollbar resets are now mainly moved to the global or specific component level */
</style>
