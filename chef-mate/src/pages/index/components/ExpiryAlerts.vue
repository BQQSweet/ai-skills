<template>
  <view class="px-6">
    <view class="mb-4 flex items-center justify-between">
      <view class="flex items-center gap-2">
        <text class="text-lg font-bold text-[#1d160c] dark:text-white">
          过期预警
        </text>
        <view v-if="hasUrgent" class="relative flex h-2 w-2">
          <view
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"
          ></view>
          <view class="relative inline-flex h-2 w-2 rounded-full bg-red-500"></view>
        </view>
      </view>
      <text
        class="text-sm font-medium text-[#a17c45] transition-colors active:opacity-70 dark:text-orange-200"
        @click="handleViewAll"
      >
        查看全部
      </text>
    </view>

    <view v-if="primaryAlerts.length > 0" class="space-y-2.5">
      <view
        v-for="(item, index) in primaryAlerts"
        :key="`${item.title}-${index}`"
        class="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm dark:border-slate-800/50 dark:bg-[#2d2418]"
        @click="handleAlertClick(item)"
      >
        <view
          class="flex size-10 shrink-0 items-center justify-center rounded-xl"
          :class="item.iconBg"
        >
          <image
            v-if="item.imageUrl"
            class="h-full w-full rounded-xl object-cover"
            :src="item.imageUrl"
            mode="aspectFill"
          />
          <text
            v-else
            class="material-symbols-outlined text-2xl"
            :class="item.iconColor"
            :style="{ fontVariationSettings: '\'FILL\' 1' }"
          >
            {{ item.icon }}
          </text>
        </view>

        <view class="min-w-0 flex-1">
          <view class="mb-1 flex items-end justify-between gap-3">
            <text class="truncate text-[12px] font-bold text-[#1d160c] dark:text-white">
              {{ item.title }}
            </text>
            <text
              class="shrink-0 text-[9px] font-bold"
              :class="item.subtitleColor || 'text-[#a17c45]'"
            >
              {{ item.badgeText }}
            </text>
          </view>
          <view class="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <view
              class="h-full rounded-full"
              :class="item.progressColor"
              :style="{ width: item.progressWidth }"
            ></view>
          </view>
        </view>

        <view
          class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_20px_-2px_rgba(255,157,10,0.3)]"
        >
          <text class="material-symbols-outlined text-lg">restaurant</text>
        </view>
      </view>
    </view>

    <view
      v-else
      class="rounded-[28rpx] border border-slate-100 bg-white px-5 py-8 text-center shadow-soft dark:border-slate-800 dark:bg-[#2d2418]"
    >
      <text class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
        eco
      </text>
      <text class="mt-3 block text-base font-bold text-[#1d160c] dark:text-white">
        {{ alerts[0]?.title || "全部食材保鲜中" }}
      </text>
      <text class="mt-2 block text-sm text-slate-400">
        {{ alerts[0]?.subtitle || "继续保持哦" }}
      </text>
    </view>

    <view v-if="secondaryAlerts.length > 0" class="mt-4">
      <text class="ml-1 block text-[10px] font-bold uppercase tracking-wider text-[#a17c45] dark:text-orange-200/60">
        更多预警
      </text>
      <scroll-view
        scroll-x
        class="mt-2 w-full whitespace-nowrap no-scrollbar"
        :show-scrollbar="false"
      >
        <view class="flex items-center gap-4 py-1 pr-6">
          <view
            v-for="(item, index) in secondaryAlerts"
            :key="`${item.title}-${index}`"
            class="flex shrink-0 flex-col items-center gap-2"
            @click="handleAlertClick(item)"
          >
            <view
              class="relative flex size-12 items-center justify-center rounded-xl border border-slate-100 bg-white p-1 shadow-[0_4px_20px_-2px_rgba(29,22,12,0.08)] dark:border-slate-700 dark:bg-[#2d2418]"
            >
              <view
                class="flex h-full w-full items-center justify-center rounded-lg"
                :class="item.iconBg"
              >
                <image
                  v-if="item.imageUrl"
                  class="h-full w-full rounded-lg object-cover"
                  :src="item.imageUrl"
                  mode="aspectFill"
                />
                <text
                  v-else
                  class="material-symbols-outlined text-xl"
                  :class="item.iconColor"
                >
                  {{ item.icon }}
                </text>
              </view>
              <view
                v-if="item.dotColor"
                class="absolute bottom-1 right-1 h-2 w-2 rounded-full border-2 border-white dark:border-[#2d2418]"
                :class="item.dotColor"
              ></view>
            </view>
            <text class="text-[10px] font-medium text-[#a17c45] dark:text-orange-200/80">
              {{ item.shortTitle }}
            </text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { FridgeItem } from "@/types/fridge";
import { calculateExpireDays } from "@/utils/expiry";
import { resolveMediaUrl } from "@/utils/media";

export interface ExpiryAlert {
  icon: string;
  title: string;
  subtitle: string;
  shortTitle: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
  progressColor: string;
  progressWidth: string;
  dotColor?: string;
  subtitleColor?: string;
  imageUrl?: string;
  dimmed?: boolean;
}

type SortableExpiryAlert = ExpiryAlert & {
  days: number;
};

const props = withDefaults(
  defineProps<{
    items?: FridgeItem[];
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
        shortTitle: "空冰箱",
        badgeText: "",
        iconBg: "bg-gray-50 dark:bg-gray-800",
        iconColor: "text-gray-400",
        progressColor: "bg-slate-300",
        progressWidth: "0%",
        dimmed: true,
      },
    ];
  }

  // Calculate days difference
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const processed: SortableExpiryAlert[] = [];

  for (const item of props.items) {
    const diffDays = calculateExpireDays(item.expire_date);
    const imageUrl = resolveMediaUrl(item.photo_url);

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
        shortTitle: item.name,
        badgeText: "立即处理",
        imageUrl,
        iconBg: "bg-red-50 dark:bg-red-900/20",
        iconColor: "text-red-500",
        dotColor: "bg-red-500",
        subtitleColor: "text-red-500",
        progressColor: "bg-gradient-to-r from-orange-400 to-red-500",
        progressWidth: "85%",
        days: diffDays,
      });
    } else if (diffDays <= 3 || item.status === "expiring") {
      processed.push({
        icon: "eco",
        title: `${item.name}即将到期`,
        subtitle: `剩余 ${diffDays} 天`,
        shortTitle: item.name,
        badgeText: `仅剩 ${diffDays} 天`,
        imageUrl,
        iconBg: "bg-orange-50 dark:bg-orange-900/20",
        iconColor: "text-amber-500",
        dotColor: "bg-amber-500",
        progressColor: "bg-amber-500",
        progressWidth: diffDays <= 1 ? "82%" : diffDays === 2 ? "68%" : "56%",
        days: diffDays,
      });
    } else if (storedDays >= 3) {
      processed.push({
        icon: "kitchen",
        title: `${item.name}存放较久`,
        subtitle: `已存放 ${storedDays} 天`,
        shortTitle: item.name,
        badgeText: `${storedDays} 天`,
        imageUrl,
        iconBg: "bg-blue-50 dark:bg-blue-900/20",
        iconColor: "text-blue-500",
        dotColor: "bg-blue-500",
        progressColor: "bg-blue-500",
        progressWidth: storedDays >= 6 ? "70%" : "52%",
        days: diffDays, // Use diffDays for sorting priority (expiring > stored long)
      });
    }
  }

  if (processed.length === 0) {
    return [
      {
        icon: "eco",
        title: "全部食材保鲜中",
        subtitle: "继续保持哦",
        shortTitle: "保鲜中",
        badgeText: "",
        iconBg: "bg-green-50 dark:bg-green-900/20",
        iconColor: "text-green-500",
        progressColor: "bg-green-500",
        progressWidth: "100%",
        dimmed: true,
      },
    ];
  }

  // Sort by urgency: shortest days first
  return processed.sort((a, b) => a.days - b.days);
});

const hasUrgent = computed(() =>
  alerts.value.some((a) => a.dotColor?.includes("red")),
);

const primaryAlerts = computed(() => alerts.value.filter((item) => !item.dimmed).slice(0, 2));

const secondaryAlerts = computed(() =>
  alerts.value.filter((item) => !item.dimmed).slice(2),
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
