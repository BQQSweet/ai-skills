<template>
  <CmPageShell
    :background-class="
      'relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f8f7f5] text-slate-800'
    "
    :header-class="'z-20 bg-white/75 backdrop-blur-md border-b border-white/30'"
    :use-scroll-view="false"
    :content-class="'flex min-h-0 flex-1 flex-col'"
    :header-offset-class="'pt-[228px]'"
  >
    <template #header>
      <FridgeHeader
        v-model="searchKeyword"
        :categories="fridgeFilterCategories"
        :active-category="activeCategory"
        @update:active-category="updateActiveCategory"
      />
    </template>

    <scroll-view
      scroll-y
      class="flex-1 min-h-0 px-5 pt-4"
      :show-scrollbar="false"
    >
      <view class="pb-40">
        <view class="mb-4 flex items-center justify-between">
          <view class="flex items-center gap-3">
            <view
              class="flex items-center text-lg font-bold tracking-tight text-slate-800"
            >
              <text>当前库存</text>
              <text class="ml-2 text-sm font-normal text-slate-400">
                已选 {{ selectedCount }} 件
              </text>
            </view>
            <text
              class="text-sm font-medium text-primary active:opacity-70 active:underline"
              @click="handleClearSelection"
            >
              取消选择
            </text>
          </view>
          <view
            class="flex items-center gap-1 text-sm font-medium text-slate-400 active:opacity-70"
            @click="handleSort"
          >
            <text>排序</text>
            <text class="material-symbols-outlined text-[16px]">sort</text>
          </view>
        </view>

        <view
          v-if="expiredCount > 0"
          class="mb-4 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-3 py-2.5"
        >
          <view class="flex items-center gap-2">
            <text class="material-symbols-outlined text-[18px] text-red-400">
              warning
            </text>
            <text class="text-xs font-medium text-red-500">
              有 {{ expiredCount }} 件食材已过期
            </text>
          </view>
          <button
            class="m-0 rounded-lg border-none bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-transform after:hidden active:scale-95"
            @click="showClearExpiredModal = true"
          >
            一键清理
          </button>
        </view>

        <view
          v-if="inventoryList.length === 0"
          class="mt-8 flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/75 px-6 text-center"
        >
          <view
            class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <text class="material-symbols-outlined text-[30px]">kitchen</text>
          </view>
          <text class="text-lg font-bold text-slate-800">冰箱还是空的</text>
          <text class="mt-2 text-sm leading-relaxed text-slate-400">
            先通过扫描、语音或手动录入，把常用食材添加进来吧。
          </text>
        </view>

        <view
          v-else-if="displayInventoryList.length === 0"
          class="mt-8 flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/75 px-6 text-center"
        >
          <view
            class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500"
          >
            <text class="material-symbols-outlined text-[30px]">search_off</text>
          </view>
          <text class="text-lg font-bold text-slate-800">没有匹配的食材</text>
          <text class="mt-2 text-sm leading-relaxed text-slate-400">
            试试调整搜索词，或切换到其他分类看看。
          </text>
        </view>

        <view v-else class="grid grid-cols-2 gap-4">
          <FridgeItemCard
            v-for="item in displayInventoryList"
            :key="item.id"
            :item="item"
            @toggle-select="toggleSelectItem"
            @edit="handleEditItem"
            @delete="handleDeleteItem"
          />
        </view>
      </view>
    </scroll-view>

    <FridgeAiBanner ref="aiRecipeEntryRef" :ingredients="selectedIngredients" />
    <FridgeFab
      @added="loadItems"
      @ai-recipe="openAiRecipeEntry"
      @video-recipe="openVideoRecipeEntry"
    />
    <up-toast ref="uToastRef"></up-toast>

    <CmConfirmDialog
      v-model:show="showDeleteModal"
      title="确认出库"
      :description="`确定要将「${pendingDeleteItem?.name || ''}」从冰箱中移除吗？`"
      confirmText="出库"
      icon-name="delete"
      tone="danger"
      @confirm="confirmDelete"
    />

    <CmConfirmDialog
      v-model:show="showClearExpiredModal"
      title="清理过期食材"
      :description="`确定要清理所有 ${expiredCount} 件过期食材吗？此操作不可撤销。`"
      confirmText="确认清理"
      icon-name="delete_sweep"
      tone="danger"
      @confirm="confirmClearExpired"
    />

    <template #footer>
      <CmTabBar :current="3" />
    </template>
  </CmPageShell>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import CmConfirmDialog from "@/components/CmConfirmDialog/CmConfirmDialog.vue";
import { fridgeCategoryStyleMap, fridgeFilterCategories } from "./constants/fridge";
import FridgeHeader from "./components/FridgeHeader.vue";
import FridgeAiBanner from "./components/FridgeAiBanner.vue";
import FridgeItemCard from "./components/FridgeItemCard.vue";
import FridgeFab from "./components/FridgeFab.vue";
import {
  getFridgeItems,
  deleteFridgeItem,
  clearExpiredItems,
} from "@/services/fridge";
import { useGroupStore } from "@/stores/group";
import type { FridgeItem, FridgeItemUI } from "@/types/fridge";
import { getExpiryStatus } from "@/utils/expiry";
import { resolveMediaUrl } from "@/utils/media";

const aiRecipeEntryRef = ref<{ openPopup: () => void } | null>(null);
const searchKeyword = ref("");
const activeCategory = ref<(typeof fridgeFilterCategories)[number]>("全部");
const uToastRef = ref();
const groupStore = useGroupStore();

const updateActiveCategory = (category: string) => {
  if (
    fridgeFilterCategories.includes(
      category as (typeof fridgeFilterCategories)[number],
    )
  ) {
    activeCategory.value = category as (typeof fridgeFilterCategories)[number];
  }
};

// ---------- API → UI 数据转换 ----------
function transformItem(raw: FridgeItem): FridgeItemUI {
  const style =
    fridgeCategoryStyleMap[raw.category as keyof typeof fridgeCategoryStyleMap] ||
    fridgeCategoryStyleMap["其他"];
  const expire = getExpiryStatus(raw.expire_date);

  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    quantity: `${raw.quantity}${raw.unit}`,
    image: resolveMediaUrl(raw.photo_url) || "",
    bgClass: style.bgClass,
    emoji: style.emoji,
    ...expire,
    selected: false,
  };
}

// ---------- 数据 ----------
const inventoryList = ref<FridgeItemUI[]>([]);

const loadItems = async () => {
  if (!groupStore.currentGroup) {
    await groupStore.fetchMyGroups();
  }

  if (!groupStore.currentGroup) {
    inventoryList.value = [];
    return;
  }

  try {
    const res = await getFridgeItems(groupStore.currentGroup.id);
    inventoryList.value = (res as FridgeItem[]).map(transformItem);
  } catch (e: unknown) {
    console.error("Failed to load fridge items:", e);
  }
};

onShow(() => {
  void loadItems();
});

const expiredCount = computed(
  () => inventoryList.value.filter((i) => i.statusType === "error").length,
);

const normalizedSearchKeyword = computed(() =>
  searchKeyword.value.trim().toLowerCase(),
);

const displayInventoryList = computed(() =>
  inventoryList.value.filter((item) => {
    const matchesCategory =
      activeCategory.value === "全部" || item.category === activeCategory.value;
    const matchesKeyword =
      normalizedSearchKeyword.value.length === 0 ||
      item.name.toLowerCase().includes(normalizedSearchKeyword.value);
    return matchesCategory && matchesKeyword;
  }),
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

const openAiRecipeEntry = () => {
  aiRecipeEntryRef.value?.openPopup();
};

const openVideoRecipeEntry = () => {
  uni.navigateTo({
    url: "/pages/recipe/from-video",
  });
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
  if (!item || !groupStore.currentGroup) return;
  try {
    await deleteFridgeItem(item.id, groupStore.currentGroup.id);
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
  if (!groupStore.currentGroup) return;
  try {
    const res = await clearExpiredItems(groupStore.currentGroup.id);
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
::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
}
</style>
