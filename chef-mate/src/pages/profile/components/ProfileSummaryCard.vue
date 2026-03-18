<template>
  <view class="flex p-6">
    <view class="flex w-full flex-col gap-6">
      <view class="flex items-center gap-5">
        <image
          class="aspect-square rounded-full h-24 w-24 border-4 border-white dark:border-slate-800 shadow-sm"
          :src="avatarUrl"
          mode="aspectFill"
        ></image>
        <view class="flex flex-col justify-center">
          <view class="flex items-center gap-2">
            <text
              class="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight"
            >
              {{ profileName }}
            </text>
            <text
              class="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold"
            >
              {{ kitchenRank }}
            </text>
          </view>
          <view
            class="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-1"
          >
            <text class="material-symbols-outlined text-sm">home</text>
            <text>{{ currentKitchenName }}</text>
          </view>
          <text class="text-primary text-sm font-semibold mt-1">
            {{ kitchenLevelText }}
          </text>
          <text class="text-slate-400 text-xs mt-1">
            {{ phoneText }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  profileName: string;
  avatarUrl: string;
  currentKitchenName: string;
  kitchenRank: string;
  kitchenLevelText: string;
  phoneText: string;
}>();
</script>
