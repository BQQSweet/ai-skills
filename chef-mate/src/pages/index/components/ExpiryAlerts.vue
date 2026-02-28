<template>
  <view class="pl-6 pb-8">
    <view class="flex items-center justify-between pr-6 mb-4">
      <view class="flex items-center gap-2">
        <text class="text-lg font-bold text-text-main dark:text-white"
          >过期预警</text
        >
        <view class="flex h-2 w-2 relative" v-if="hasUrgent">
          <view
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"
          ></view>
          <view
            class="relative inline-flex h-2 w-2 rounded-full bg-red-500"
          ></view>
        </view>
      </view>
      <text
        class="text-sm font-medium text-text-muted dark:text-orange-200 hover:text-primary active:opacity-70"
        @click="handleViewAll"
        >查看全部</text
      >
    </view>

    <scroll-view
      scroll-x
      class="whitespace-nowrap w-full no-scrollbar"
      :show-scrollbar="false"
    >
      <view
        v-for="(item, index) in alerts"
        :key="index"
        class="inline-flex flex-col justify-between gap-3 w-[160px] h-[120px] p-4 rounded-[24rpx] bg-white dark:bg-[#2d2418] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden align-top"
        :class="[
          index < alerts.length - 1 ? 'mr-4' : 'mr-6',
          item.dimmed ? 'opacity-60' : '',
        ]"
        @click="handleAlertClick(item)"
      >
        <!-- Status Dot -->
        <view v-if="item.dotColor" class="absolute top-3 right-3">
          <view class="w-2 h-2 rounded-full" :class="item.dotColor"></view>
        </view>
        <!-- Icon -->
        <!-- <view
          class="w-10 h-10 rounded-xl flex items-center justify-center"
          :class="item.iconBg"
        >
          <text
            class="material-symbols-outlined text-xl font-light"
            :class="item.iconColor"
            >{{ item.icon }}</text
          >
        </view> -->
        <!-- Text -->
        <view>
          <text
            class="block font-bold text-text-main dark:text-white text-[15px]"
            >{{ item.title }}</text
          >
          <text
            class="block text-xs mt-1 font-medium"
            :class="item.subtitleColor || 'text-text-muted dark:text-gray-400'"
            >{{ item.subtitle }}</text
          >
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface ExpiryAlert {
  icon: string;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  dotColor?: string;
  subtitleColor?: string;
  dimmed?: boolean;
}

const props = withDefaults(
  defineProps<{
    items?: any[];
  }>(),
  {
    items: () => [],
  },
);

// Map items to alerts based on expiry logic
const alerts = computed<ExpiryAlert[]>(() => {
  if (!props.items || props.items.length === 0) {
    return [
      {
        icon: "inventory_2",
        title: "冰箱暂无食材",
        subtitle: "快去录入吧",
        iconBg: "bg-gray-50 dark:bg-gray-800",
        iconColor: "text-gray-400",
        dimmed: true,
      },
    ];
  }

  // Calculate days difference
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const processed: ExpiryAlert[] = [];

  for (const item of props.items) {
    const expireDate = new Date(item.expire_date);
    const expDay = new Date(
      expireDate.getFullYear(),
      expireDate.getMonth(),
      expireDate.getDate(),
    );
    const diffTime = expDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const createdDate = new Date(item.created_at || now);
    const storedTime =
      today.getTime() -
      new Date(
        createdDate.getFullYear(),
        createdDate.getMonth(),
        createdDate.getDate(),
      ).getTime();
    const storedDays = Math.floor(storedTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || item.status === "expired") {
      processed.push({
        icon: "set_meal",
        title: `${item.name}已过期`,
        subtitle: "建议立即清理",
        iconBg: "bg-red-50 dark:bg-red-900/20",
        iconColor: "text-red-500",
        dotColor: "bg-red-500",
        subtitleColor: "text-red-500",
        days: diffDays,
      } as ExpiryAlert & { days: number });
    } else if (diffDays <= 3 || item.status === "expiring") {
      processed.push({
        icon: "eco",
        title: `${item.name}即将到期`,
        subtitle: `剩余 ${diffDays} 天`,
        iconBg: "bg-orange-50 dark:bg-orange-900/20",
        iconColor: "text-amber-500",
        dotColor: "bg-amber-500",
        days: diffDays,
      } as ExpiryAlert & { days: number });
    } else if (storedDays >= 3) {
      processed.push({
        icon: "kitchen",
        title: `${item.name}存放较久`,
        subtitle: `已存放 ${storedDays} 天`,
        iconBg: "bg-blue-50 dark:bg-blue-900/20",
        iconColor: "text-blue-500",
        dotColor: "bg-blue-500",
        days: diffDays, // Use diffDays for sorting priority (expiring > stored long)
      } as ExpiryAlert & { days: number });
    }
  }

  if (processed.length === 0) {
    return [
      {
        icon: "eco",
        title: "全部食材保鲜中",
        subtitle: "继续保持哦",
        iconBg: "bg-green-50 dark:bg-green-900/20",
        iconColor: "text-green-500",
        dimmed: true,
      },
    ];
  }

  // Sort by urgency: shortest days first
  return processed.sort((a: any, b: any) => a.days - b.days);
});

const hasUrgent = computed(() =>
  alerts.value.some((a) => a.dotColor?.includes("red")),
);

const handleViewAll = () => {
  // TODO: 跳转到冰箱/过期食材详情页
  uni.$u.toast("查看全部过期预警（开发中）");
};

const handleAlertClick = (alert: ExpiryAlert) => {
  // Try to redirect to fridge root since we don't have individual detail pages
  uni.switchTab({ url: "/pages/fridge/index" });
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
