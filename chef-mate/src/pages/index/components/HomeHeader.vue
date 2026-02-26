<template>
  <view class="flex items-center justify-between px-6 pt-12 pb-4">
    <view class="flex items-center gap-4">
      <view class="relative group cursor-pointer" @click="handleProfileClick">
        <image
          class="w-12 h-12 rounded-full border-2 border-white dark:border-[#2d2418] shadow-sm bg-gray-100"
          :src="avatarUrl || defaultAvatar"
          mode="aspectFill"
        />
        <view
          class="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#2d2418]"
        ></view>
      </view>
      <view>
        <text
          class="block text-sm text-text-muted dark:text-orange-200/80 font-medium leading-tight"
          >{{ greeting }}</text
        >
        <text
          class="block text-xl font-bold text-text-main dark:text-white leading-tight mt-1"
          >{{ nickname }}</text
        >
      </view>
    </view>
    <view
      class="relative w-10 h-10 rounded-full bg-white dark:bg-[#2d2418] shadow-sm text-text-main dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center justify-center active:scale-95"
      @click="handleNotification"
    >
      <text
        class="material-symbols-outlined text-[22px]"
        :style="{ fontVariationSettings: '\'FILL\' 1' }"
        >notifications</text
      >
      <view
        v-if="unreadCount > 0"
        class="absolute top-2 right-[9px] w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#2d2418]"
      ></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";
import defaultAvatar from "@/static/svgs/default_avatar.svg";

const props = withDefaults(
  defineProps<{
    nickname?: string;
    avatarUrl?: string;
    unreadCount?: number;
  }>(),
  {
    nickname: "大厨 Chef",
    avatarUrl: "",
    unreadCount: 1,
  },
);

const greeting = computed(() => {
  const hour = dayjs().hour();
  if (hour < 6) return "凌晨好";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
});

const handleProfileClick = () => {
  // TODO: 跳转到个人信息页
  uni.navigateTo({ url: "/pages/my/index" });
};

const handleNotification = () => {
  // TODO: 跳转到消息列表页
  uni.$u.toast("跳转到消息列表");
};
</script>
