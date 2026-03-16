<template>
  <view
    class="relative flex min-h-screen w-full flex-col bg-[#FAFAFA] dark:bg-background-dark font-display"
  >
    <!-- Header -->
    <view
      class="sticky top-0 z-30 bg-[#FAFAFA]/80 dark:bg-background-dark/80 backdrop-blur-lg px-6 pt-12 pb-4 flex items-center justify-between"
    >
      <view
        @click="goBack"
        class="w-10 h-10 rounded-full bg-white dark:bg-surface-dark shadow-soft flex items-center justify-center cursor-pointer"
      >
        <text class="material-symbols-outlined text-text-main dark:text-white"
          >arrow_back_ios_new</text
        >
      </view>
      <text class="text-lg font-bold text-text-main dark:text-white"
        >协作采购清单</text
      >
      <view
        @click="handleShare"
        class="w-10 h-10 rounded-full bg-white dark:bg-surface-dark shadow-soft flex items-center justify-center cursor-pointer"
      >
        <text class="material-symbols-outlined text-text-main dark:text-white"
          >ios_share</text
        >
      </view>
    </view>

    <!-- Main Content -->
    <scroll-view
      scroll-y
      class="flex-1 pb-32"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="handleRefresh"
    >
      <!-- Progress Card -->
      <view class="px-6 py-4">
        <view
          class="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-soft"
        >
          <view class="flex items-center justify-between mb-4">
            <text class="font-bold text-text-main dark:text-white"
              >家庭采购进度</text
            >
            <text class="text-sm font-bold text-primary"
              >{{ purchaseProgress }}%</text
            >
          </view>
          <view
            class="h-3 w-full bg-orange-50 dark:bg-orange-900/20 rounded-full overflow-hidden mb-4"
          >
            <view
              class="h-full bg-primary rounded-full transition-all duration-1000"
              :style="{ width: purchaseProgress + '%' }"
            ></view>
          </view>

          <!-- 有成员时显示成员列表 -->
          <view v-if="activeMembers.length > 0" class="flex items-center">
            <view class="flex items-center -space-x-2">
              <image
                v-for="(member, index) in activeMembers.slice(0, 3)"
                :key="index"
                class="w-8 h-8 rounded-full border-2 border-white dark:border-surface-dark object-cover"
                :src="member.avatarUrl"
                mode="aspectFill"
              />
              <view
                v-if="activeMembers.length > 3"
                class="w-8 h-8 rounded-full border-2 border-white dark:border-surface-dark bg-slate-100 dark:bg-gray-700 flex items-center justify-center"
              >
                <text class="text-[10px] font-bold text-slate-400"
                  >+{{ activeMembers.length - 3 }}</text
                >
              </view>
            </view>
            <text class="ml-4 text-xs text-text-sub dark:text-text-muted">
              {{ activeMemberNames }} 正在采购
            </text>
          </view>

          <!-- 无成员时显示邀请提示 -->
          <view v-else class="flex items-center justify-between">
            <view class="flex items-center gap-2">
              <text class="material-symbols-outlined text-text-muted text-lg">
                group_add
              </text>
              <text class="text-sm text-text-muted">
                还没有家庭成员，邀请家人一起协作吧
              </text>
            </view>
            <view
              @click="handleInviteMembers"
              class="px-3 py-1.5 bg-primary/10 rounded-lg cursor-pointer active:opacity-70"
            >
              <text class="text-xs font-bold text-primary">邀请</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Add Item Section -->
      <view class="px-6 py-2">
        <view class="flex items-center gap-2">
          <CmInput
            v-model="newItemName"
            placeholder="添加购物项..."
            icon="add_shopping_cart"
            class="flex-1"
            @keyup.enter="handleAddItem"
          />
          <view
            @click="handleAddItem"
            class="w-12 h-12 flex items-center justify-center rounded-xl bg-primary cursor-pointer active:scale-95 transition-transform"
          >
            <text class="material-symbols-outlined text-white text-2xl"
              >add</text
            >
          </view>
        </view>
      </view>

      <!-- Shopping List -->
      <view class="px-6 space-y-4 mt-4">
        <view class="flex items-center justify-between">
          <text class="font-bold text-lg text-text-main dark:text-white"
            >待买食材</text
          >
          <text class="text-xs text-text-sub dark:text-text-muted"
            >来自"今日烹饪计划"</text
          >
        </view>

        <!-- Loading -->
        <view
          v-if="shoppingStore.loading && shoppingStore.shoppingList.length === 0"
          class="flex items-center justify-center py-20"
        >
          <text class="text-text-muted">加载中...</text>
        </view>

        <!-- Empty State -->
        <view
          v-else-if="shoppingStore.shoppingList.length === 0"
          class="flex flex-col items-center justify-center py-20"
        >
          <text
            class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4"
            >shopping_cart</text
          >
          <text class="text-text-muted">购物清单是空的</text>
          <text class="text-sm text-text-muted mt-2">添加一些要买的东西吧</text>
        </view>

        <!-- Shopping Items -->
        <view v-else class="space-y-3">
          <ShoppingItem
            v-for="item in shoppingStore.shoppingList"
            :key="item.id"
            :item="item"
            @toggle="handleToggle"
            @delete="confirmDelete"
          />
        </view>
      </view>
    </scroll-view>

    <!-- Bottom Action Button -->
    <view
      v-if="shoppingStore.purchasedItems.length > 0"
      class="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-[#FAFAFA] dark:from-background-dark via-[#FAFAFA]/90 dark:via-background-dark/90 to-transparent"
    >
      <view
        @click="confirmCompleteAndStock"
        class="w-full bg-primary hover:bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <text class="material-symbols-outlined">inventory_2</text>
        <text>完成采购并入库</text>
      </view>
    </view>

    <!-- Category Picker -->
    <u-popup
      :show="showCategoryPicker"
      mode="bottom"
      @close="showCategoryPicker = false"
    >
      <view
        class="bg-white dark:bg-surface-dark p-6 rounded-t-3xl"
      >
        <text
          class="block text-lg font-bold text-text-main dark:text-white mb-4"
          >选择分类</text
        >
        <view class="grid grid-cols-3 gap-3">
          <view
            v-for="cat in categories"
            :key="cat"
            @click="selectCategory(cat)"
            class="p-4 rounded-xl text-center cursor-pointer transition-all"
            :class="
              selectedCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white'
            "
          >
            <text class="font-bold">{{ categoryLabel[cat] }}</text>
          </view>
        </view>
      </view>
    </u-popup>

    <!-- Delete Confirmation Modal -->
    <up-modal
      :show="showDeleteModal"
      title="确认删除"
      content="确定要删除这个购物项吗？"
      showCancelButton
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
      @close="showDeleteModal = false"
    ></up-modal>

    <!-- Complete Stock Modal -->
    <up-modal
      :show="showCompleteModal"
      title="完成采购"
      :content="`确定要将 ${shoppingStore.purchasedItems.length} 个已购买的食材入库吗？`"
      showCancelButton
      @confirm="handleCompleteAndStock"
      @cancel="showCompleteModal = false"
      @close="showCompleteModal = false"
    ></up-modal>

    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useShoppingStore } from "@/stores/shopping";
import { useGroupStore } from "@/stores/group";
import CmInput from "@/components/CmInput/CmInput.vue";
import ShoppingItem from "./components/ShoppingItem.vue";
import type { ShoppingCategory } from "@/types/shopping";

const shoppingStore = useShoppingStore();
const groupStore = useGroupStore();

const newItemName = ref("");
const selectedCategory = ref<ShoppingCategory>("other");
const showCategoryPicker = ref(false);
const refreshing = ref(false);
const uToastRef = ref();
const showDeleteModal = ref(false);
const showCompleteModal = ref(false);
const itemToDelete = ref<string>("");

// 活跃成员（正在采购的成员）
const activeMembers = computed(() => {
  if (!groupStore.currentGroup?.members) return [];

  // TODO: 后续可以根据实际采购状态筛选活跃成员
  // 目前返回所有成员
  return groupStore.currentGroup.members.map((member) => ({
    name: member.nickname,
    avatarUrl: member.avatarUrl || "https://via.placeholder.com/32",
  }));
});

const categories: ShoppingCategory[] = [
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

const categoryLabel: Record<ShoppingCategory, string> = {
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

const purchaseProgress = computed(() => {
  if (shoppingStore.stats.total === 0) return 0;
  return Math.round(
    (shoppingStore.stats.purchased / shoppingStore.stats.total) * 100
  );
});

const activeMemberNames = computed(() => {
  return activeMembers.value.map((m) => m.name).join("、");
});

onMounted(async () => {
  if (groupStore.currentGroup) {
    // 加载组成员信息
    await groupStore.fetchGroupMembers(groupStore.currentGroup.id);
    // 加载购物清单
    await loadShoppingList();
  }
});

async function loadShoppingList() {
  if (!groupStore.currentGroup) return;

  try {
    await shoppingStore.fetchShoppingList(groupStore.currentGroup.id);
  } catch (error) {
    uToastRef.value?.show({
      type: "error",
      message: "加载购物清单失败",
    });
  }
}

async function handleAddItem() {
  if (!newItemName.value.trim()) {
    uToastRef.value?.show({
      type: "warning",
      message: "请输入购物项名称",
    });
    return;
  }

  if (!groupStore.currentGroup) {
    uToastRef.value?.show({
      type: "error",
      message: "请先加入家庭组",
    });
    return;
  }

  try {
    await shoppingStore.addItem(groupStore.currentGroup.id, {
      name: newItemName.value.trim(),
      category: selectedCategory.value,
    });
    newItemName.value = "";
    uToastRef.value?.show({
      type: "success",
      message: "添加成功",
    });
  } catch (error) {
    uToastRef.value?.show({
      type: "error",
      message: "添加失败",
    });
  }
}

function selectCategory(category: ShoppingCategory) {
  selectedCategory.value = category;
  showCategoryPicker.value = false;
}

async function handleToggle(itemId: string) {
  try {
    await shoppingStore.togglePurchased(itemId);
  } catch (error) {
    uToastRef.value?.show({
      type: "error",
      message: "操作失败",
    });
  }
}

function confirmDelete(itemId: string) {
  itemToDelete.value = itemId;
  showDeleteModal.value = true;
}

async function handleDelete() {
  try {
    await shoppingStore.deleteItem(itemToDelete.value);
    showDeleteModal.value = false;
    itemToDelete.value = "";
    uToastRef.value?.show({
      type: "success",
      message: "删除成功",
    });
  } catch (error) {
    uToastRef.value?.show({
      type: "error",
      message: "删除失败",
    });
  }
}

function confirmCompleteAndStock() {
  if (!groupStore.currentGroup) return;
  showCompleteModal.value = true;
}

async function handleCompleteAndStock() {
  if (!groupStore.currentGroup) return;

  try {
    // TODO: 实现入库逻辑
    await shoppingStore.clearPurchased(groupStore.currentGroup.id);
    showCompleteModal.value = false;
    uToastRef.value?.show({
      type: "success",
      message: "已完成采购并入库",
    });
  } catch (error) {
    uToastRef.value?.show({
      type: "error",
      message: "操作失败",
    });
  }
}

async function handleRefresh() {
  refreshing.value = true;
  try {
    await loadShoppingList();
  } finally {
    refreshing.value = false;
  }
}

function handleShare() {
  // TODO: 实现分享功能
  uToastRef.value?.show({
    type: "info",
    message: "分享功能开发中",
  });
}

function handleInviteMembers() {
  uni.navigateTo({
    url: "/pages/group/invite",
  });
}

function goBack() {
  uni.navigateBack();
}
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 4px 20px -2px rgba(29, 22, 12, 0.05);
}

.shadow-glow {
  box-shadow: 0 8px 24px -4px rgba(255, 159, 10, 0.3);
}
</style>
