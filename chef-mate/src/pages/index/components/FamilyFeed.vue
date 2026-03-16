<template>
  <view class="px-6 pb-6 mt-2">
    <view class="flex items-center justify-between mb-4">
      <text class="text-lg font-bold text-text-main dark:text-white"
        >家庭协作</text
      >
    </view>
    <view
      class="rounded-[24rpx] bg-white dark:bg-[#2d2418] shadow-[0_4px_20px_-2px_rgba(29,22,12,0.06)] p-1 overflow-hidden"
    >
      <!-- Loading State -->
      <view
        v-if="feedStore.loading && feedStore.feedList.length === 0"
        class="flex items-center justify-center py-12"
      >
        <text class="text-text-muted">加载中...</text>
      </view>

      <!-- Empty State -->
      <view
        v-else-if="feedStore.feedList.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <text class="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">
          family_restroom
        </text>
        <text class="text-text-muted text-sm">暂无家庭动态</text>
      </view>

      <!-- Feed Items -->
      <view
        v-else
        v-for="(item, index) in displayItems"
        :key="item.id"
        class="flex items-center gap-4 p-4"
        :class="{
          'border-b border-gray-50 dark:border-slate-800/50':
            index < displayItems.length - 1,
        }"
        @click="handleFeedClick(item)"
      >
        <view class="relative">
          <image
            class="w-10 h-10 rounded-full object-cover bg-gray-100"
            :src="item.avatarUrl || 'https://via.placeholder.com/40'"
            mode="aspectFill"
          />
          <view
            class="absolute -bottom-1 -right-1 border-2 p-2.5 border-white dark:border-[#2d2418] rounded-full w-4 h-4 flex items-center justify-center"
            :class="getBadgeStyle(item.actionType).bg"
          >
            <text
              class="material-symbols-outlined text-[10px] font-bold"
              :class="getBadgeStyle(item.actionType).iconColor"
              >{{ getBadgeStyle(item.actionType).icon }}</text
            >
          </view>
        </view>
        <view class="flex-1">
          <view class="text-sm text-text-main dark:text-white leading-normal">
            <text class="font-bold">{{ item.userName }}</text>
            {{ item.action || "" }}
            <text
              class="font-bold"
              :class="
                canOpenShoppingList(item)
                  ? 'text-primary cursor-pointer active:opacity-70'
                  : 'text-primary'
              "
              @click.stop="openShoppingList(item)"
            >
              {{ item.target }}
            </text>
            {{ item.actionSuffix || "" }}
          </view>
          <text class="block text-xs text-text-muted mt-1">{{
            formatTime(item.createdAt)
          }}</text>
        </view>
      </view>
    </view>

    <!-- Quick Action Button -->
    <button
      class="w-full mt-4 bg-primary/10 border border-primary/20 dark:border-primary/30 after:hidden flex items-center justify-center gap-2 py-1 h-[52px] rounded-xl text-primary hover:bg-primary/20 transition-colors active:opacity-70"
      @click="handleGoShopping"
    >
      <text class="font-bold text-[15px] leading-none">去买菜</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useFeedStore } from "@/stores/feed";
import { useGroupStore } from "@/stores/group";
import type { FeedItem, FeedActionType } from "@/types/feed";

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
  // TODO: 根据动作类型跳转到对应页面
  console.log("Feed item clicked:", item);
};

const canOpenShoppingList = (item: FeedItem) =>
  item.actionType === "shopping_added" && Boolean(item.targetId);

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
