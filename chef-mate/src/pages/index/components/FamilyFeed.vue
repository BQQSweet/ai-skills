<template>
  <view class="px-6 pb-6 mt-8">
    <view class="mb-4 flex items-center justify-between">
      <text class="text-lg font-bold text-[#1d160c] dark:text-white">
        家庭协作
      </text>
    </view>

    <view class="relative ml-4 mr-2">
      <view
        v-if="displayItems.length > 0"
        class="timeline-line absolute bottom-0 left-[21px] top-0 w-[1.5px] opacity-40"
      ></view>

      <view
        v-if="feedStore.loading && feedStore.feedList.length === 0"
        class="rounded-[28rpx] bg-white px-6 py-12 text-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:bg-[#2d2418]"
      >
        <text class="text-[#a17c45] dark:text-orange-200/70">加载中...</text>
      </view>

      <view
        v-else-if="feedStore.feedList.length === 0"
        class="rounded-[28rpx] bg-white px-6 py-12 text-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:bg-[#2d2418]"
      >
        <text
          class="material-symbols-outlined mb-2 block text-4xl text-slate-300 dark:text-slate-600"
        >
          family_restroom
        </text>
        <text class="text-sm text-slate-400">暂无家庭动态</text>
      </view>

      <view v-else class="space-y-3">
        <view
          v-for="item in displayItems"
          :key="item.id"
          class="group flex items-center gap-4"
          @click="handleFeedClick(item)"
        >
          <view
            class="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fcfaf8] dark:bg-background-dark"
          >
            <image
              class="size-11 rounded-full object-cover ring-2 ring-white/60 shadow-md dark:ring-[#2d2418]/60"
              :src="resolveAvatarUrl(item.avatarUrl)"
              mode="aspectFill"
            />
            <view
              class="absolute -right-0.5 top-0 size-3 rounded-full border-2 border-white shadow-sm dark:border-[#fcfaf8]"
              :class="getTimelineDotClass(item.actionType)"
            ></view>
          </view>

          <view
            class="glass-card flex-1 rounded-2xl p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-transform group-active:translate-x-1"
          >
            <view
              class="text-[13px] leading-snug text-[#1d160c] dark:text-white"
            >
              <text class="font-bold opacity-80">{{ item.userName }}</text>
              {{ actionText(item.action) }}
              <text
                class="font-bold text-primary"
                :class="
                  canOpenShoppingList(item)
                    ? 'cursor-pointer active:opacity-70'
                    : ''
                "
                @click.stop="openShoppingList(item)"
              >
                {{ item.target }}
              </text>
              {{ actionSuffixText(item.actionSuffix) }}
            </view>
            <view class="mt-1 flex items-center gap-1.5">
              <text class="material-symbols-outlined text-[10px] text-[#a17c45]"
                >schedule</text
              >
              <text class="text-[10px] font-medium text-[#a17c45]/70">
                {{ formatTime(item.createdAt) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <button
      class="relative mt-6 flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border-none bg-gradient-to-br from-[#ffb347] to-[#ffcc33] text-white shadow-[0_8px_20px_-4px_rgba(255,179,71,0.5)] after:hidden active:scale-[0.98]"
      @click="handleGoShopping"
    >
      <text class="material-symbols-outlined text-xl font-bold"
        >shopping_basket</text
      >
      <text class="text-sm font-bold tracking-wide">去买菜</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useFeedStore } from "@/stores/feed";
import { useGroupStore } from "@/stores/group";
import type { FeedItem, FeedActionType } from "@/types/feed";
import { resolveAvatarUrl } from "@/utils/avatar";

const feedStore = useFeedStore();
const groupStore = useGroupStore();

// 只显示前5条动态
const displayItems = computed(() => feedStore.feedList.slice(0, 5));

// 根据动作类型获取徽章样式
function getBadgeStyle(actionType: FeedActionType) {
  const styles = {
    shopping_purchased: {
      icon: "check",
      bg: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-300",
    },
    shopping_reopened: {
      icon: "undo",
      bg: "bg-amber-100 dark:bg-amber-900",
      iconColor: "text-amber-600 dark:text-amber-300",
    },
    shopping_added: {
      icon: "add",
      bg: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-300",
    },
    recipe_cooked: {
      icon: "restaurant",
      bg: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-300",
    },
    fridge_added: {
      icon: "inventory_2",
      bg: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-300",
    },
    fridge_expired: {
      icon: "warning",
      bg: "bg-red-100 dark:bg-red-900",
      iconColor: "text-red-600 dark:text-red-300",
    },
  };

  return styles[actionType] || styles.shopping_added;
}

function getTimelineDotClass(actionType: FeedActionType) {
  const style = getBadgeStyle(actionType);
  if (style.bg.includes("green")) return "bg-green-500";
  if (style.bg.includes("amber")) return "bg-amber-500";
  if (style.bg.includes("purple")) return "bg-purple-500";
  if (style.bg.includes("red")) return "bg-red-500";
  return "bg-blue-500";
}

// 格式化时间
function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString("zh-CN");
}

function actionText(action?: string) {
  return action ? ` ${action} ` : " ";
}

function actionSuffixText(actionSuffix?: string) {
  return actionSuffix ? ` ${actionSuffix}` : "";
}

watch(
  () => groupStore.currentGroup?.id,
  async (groupId) => {
    if (!groupId) {
      feedStore.clearFeed();
      return;
    }

    await feedStore.fetchFeedList(groupId, true);
  },
);

const handleFeedClick = (item: FeedItem) => {
  openShoppingList(item);
};

const canOpenShoppingList = (item: FeedItem) =>
  ["shopping_added", "shopping_purchased", "shopping_reopened"].includes(
    item.actionType,
  ) && Boolean(item.targetId);

const openShoppingList = (item: FeedItem) => {
  if (!canOpenShoppingList(item)) return;

  uni.navigateTo({
    url: `/pages/shopping/index?listId=${encodeURIComponent(item.targetId || "")}`,
  });
};

const handleGoShopping = () => {
  uni.navigateTo({
    url: "/pages/shopping/index",
  });
};
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .glass-card {
  background: rgba(45, 36, 24, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.timeline-line {
  background-image: linear-gradient(to bottom, transparent 50%, #e2e8f0 50%);
  background-size: 1px 12px;
  background-repeat: repeat-y;
}

.dark .timeline-line {
  background-image: linear-gradient(to bottom, transparent 50%, #4a3a25 50%);
}
</style>
