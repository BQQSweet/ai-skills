<template>
  <view class="flex items-center justify-between px-6 pb-4 pt-12">
    <view class="flex items-center gap-4">
      <view class="relative cursor-pointer" @click="handleProfileClick">
        <image
          class="h-12 w-12 rounded-full border-2 border-white shadow-sm bg-gray-100 dark:border-[#2d2418]"
          :src="avatarUrl || defaultAvatar"
          mode="aspectFill"
        />
        <view
          class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-[#2d2418]"
        ></view>
      </view>

      <view>
        <text
          class="block text-sm font-medium text-[#a17c45] leading-tight dark:text-orange-200/80"
        >
          {{ greeting }}
        </text>
        <text
          class="mt-1 block text-xl font-bold leading-tight text-[#1d160c] dark:text-white"
        >
          {{ nickname }}
        </text>
      </view>
    </view>

    <view
      class="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1d160c] shadow-[0_4px_20px_-2px_rgba(29,22,12,0.08)] transition-colors active:scale-95 dark:bg-[#2d2418] dark:text-white"
      @click="handleNotification"
    >
      <text class="material-symbols-outlined text-[22px]">notifications</text>
      <view
        v-if="unreadCount > 0"
        class="absolute right-[8px] top-[8px] h-2 w-2 rounded-full border border-white bg-red-500 dark:border-[#2d2418]"
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
  uni.navigateTo({ url: "/pages/profile/index" });
};

const handleNotification = () => {
  // TODO: 跳转到消息列表页
  uni.$u.toast("跳转到消息列表");
};
</script>
