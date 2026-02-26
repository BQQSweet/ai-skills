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
        <view
          class="w-10 h-10 rounded-xl flex items-center justify-center"
          :class="item.iconBg"
        >
          <text
            class="material-symbols-outlined text-xl font-light"
            :class="item.iconColor"
            >{{ item.icon }}</text
          >
        </view>
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
    alerts?: ExpiryAlert[];
  }>(),
  {
    alerts: () => [
      {
        icon: "set_meal",
        title: "肉类即将到期",
        subtitle: "请尽快使用",
        iconBg: "bg-red-50 dark:bg-red-900/20",
        iconColor: "text-red-500",
        dotColor: "bg-red-500",
        subtitleColor: "text-red-500",
      },
      {
        icon: "eco",
        title: "蔬菜存放3天",
        subtitle: "建议尽快烹饪",
        iconBg: "bg-orange-50 dark:bg-orange-900/20",
        iconColor: "text-amber-500",
        dotColor: "bg-amber-500",
      },
      {
        icon: "egg",
        title: "鸡蛋库存充足",
        subtitle: "保质期良好",
        iconBg: "bg-gray-50 dark:bg-gray-800",
        iconColor: "text-gray-400",
        dimmed: true,
      },
    ],
  },
);

const hasUrgent = computed(() =>
  props.alerts.some((a) => a.dotColor?.includes("red")),
);

const handleViewAll = () => {
  // TODO: 跳转到冰箱/过期食材详情页
  uni.$u.toast("查看全部过期预警（开发中）");
};

const handleAlertClick = (alert: ExpiryAlert) => {
  // TODO: 跳转到对应食材详情
  uni.$u.toast(`${alert.title}（开发中）`);
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
