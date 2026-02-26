<template>
  <view class="px-6 mb-8 mt-2">
    <view class="flex items-center justify-between mb-4">
      <text class="text-lg font-bold text-text-main dark:text-white"
        >今日烹饪计划</text
      >
      <text
        class="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full"
        >{{ mealTag }}</text
      >
    </view>
    <view
      class="relative w-full rounded-[30rpx] bg-white dark:bg-[#2d2418] shadow-[0_4px_20px_-2px_rgba(29,22,12,0.08)] overflow-hidden group"
    >
      <!-- Image Area -->
      <view class="relative h-64 w-full overflow-hidden">
        <view
          class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"
        ></view>
        <image
          :src="imageUrl"
          mode="aspectFill"
          class="h-full w-full transition-transform duration-700 hover:scale-105"
        />
        <!-- Floating Dish Name -->
        <view class="absolute bottom-4 left-4 right-4 z-20 text-white">
          <text class="block text-2xl font-bold mb-2">{{ title }}</text>
          <view
            class="flex items-center gap-3 text-sm font-medium text-white/90"
          >
            <view
              class="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg"
            >
              <text class="material-symbols-outlined text-[16px]"
                >schedule</text
              >
              <text>{{ cookTime }}分钟</text>
            </view>
            <view
              class="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg"
            >
              <text class="material-symbols-outlined text-[16px]"
                >equalizer</text
              >
              <text>{{ difficulty }}</text>
            </view>
          </view>
        </view>
      </view>
      <!-- Action Area -->
      <view class="p-4 flex items-center justify-between gap-4">
        <view class="flex -space-x-2 overflow-hidden items-center pl-1">
          <image
            v-for="(avatar, index) in memberAvatars.slice(0, 2)"
            :key="index"
            class="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#2d2418] object-cover"
            :src="avatar"
            mode="aspectFill"
          />
          <view
            v-if="extraMemberCount > 0"
            class="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white dark:ring-[#2d2418] bg-orange-100 text-xs font-bold text-primary"
            >+{{ extraMemberCount }}</view
          >
        </view>
        <button
          class="flex-1 m-0 bg-primary hover:bg-orange-600 border-none after:hidden active:opacity-80 active:scale-[0.98] text-white font-bold h-12 rounded-[20rpx] transition-all shadow-[0_4px_20px_-2px_rgba(255,157,10,0.4)] flex items-center justify-center gap-2"
          @click="handleStartCooking"
        >
          <text class="text-[15px] text-white font-bold leading-none"
            >开始下厨</text
          >
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    imageUrl?: string;
    cookTime?: number;
    difficulty?: string;
    mealTag?: string;
    memberAvatars?: string[];
    extraMemberCount?: number;
  }>(),
  {
    title: "西红柿炒鸡蛋",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgpI_IYcGM8oAcWZRTUBl3Vr2rGLHDvyThJDCZFmjiUk8AOcFOviu_oi9jDFeg3xfV2A2ZcLZ0v5la4N_u150o2Fbv_3fUZYxcdXMC_KT_EZ5gsU-2SBs3rCzuZHurAOftI_PZhb8NKSBovhNXpZ_RdMhTs5fwc8Hs_o98xRxPTIdT65NFYdqrE9MrH59O6MGKwffYBcdvcIkcaySy8tTodJU8IEI9AN-R7H_kZIYdZoWiVQ8XxzpYJEDWRJtib94CnadM6IAClRxT",
    cookTime: 15,
    difficulty: "简单",
    mealTag: "晚餐推荐",
    memberAvatars: () => [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1xaCumzLqpzkvNproVHkvr7kbITVW7Rrrq_K0jEWYv6MVKLYtxpM9wRnDNa9ch7uia3rw-Vksvv_gBgaOAjk4Et6k7-z-9zXXEh18GBMTX24La3vLU0D4pxKYKG6Lc9_MQYgnOsU0cfFo3JEOxiWPsZxEAzGjXFEvDT3GNIfrKyTVlh4befBHCsI041Bs1uikL95epvlGanoUCMVkHM8INwVyBO56nfmFHMmCDFw9Px9vmWoW_FOPWM8IZEc9ZXfxQSA6gY52Bc8n",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMjBXwdgX9O5A9OyGhveJuCy1ou4rtfeI9iP79ElvVJrJzGBDmoiwPfZTSOoIU5O_UUxZEZbUppuxHI4eqVffk8goJJp45M1YxkcoBf6l8njM9VppTY76QsErYo1QyBYzAm0M_xqt0Q5Zsb0fGYFs-P6iH6aKhNrSo86EFLAn5nBY7um8EWYvbfuRffgtgHlaqU1ZtMT8UijqxmW_Cz690QO8yuVbVrVoulJxUkGonHHfNzTrFUICJEPRn_TjbXAMW7I347SaMFWS_",
    ],
    extraMemberCount: 2,
  },
);

const handleStartCooking = () => {
  // TODO: 跳转到烹饪引导页
  uni.$u.toast("开始下厨（开发中）");
};
</script>
