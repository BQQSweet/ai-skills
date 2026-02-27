<template>
  <view class="pl-6 mb-8 mt-2">
    <view class="flex items-center justify-between mb-4 pr-6">
      <text class="text-lg font-bold text-text-main dark:text-white"
        >今日烹饪计划</text
      >
      <text
        class="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full"
        >{{ mealTag }}</text
      >
    </view>

    <swiper
      class="h-[380px]"
      circular
      :indicator-dots="true"
      indicator-active-color="#ff9d0a"
      previous-margin="0"
      next-margin="50rpx"
    >
      <swiper-item v-for="(item, index) in recipes" :key="item.id || index">
        <!-- 间距和底部指示器留白 -->
        <view class="w-full h-full pr-4 pb-8 box-border bg-transparent">
          <view
            class="relative w-full h-full rounded-[30rpx] bg-white dark:bg-[#2d2418] shadow-[0_4px_20px_-2px_rgba(29,22,12,0.08)] flex flex-col"
            style="transform: translateZ(0)"
          >
            <!-- Image Area -->
            <view
              class="relative flex-1 w-full overflow-hidden rounded-t-[30rpx]"
            >
              <view
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"
              ></view>
              <image
                :src="item.cover_url || defaultImageUrl"
                mode="aspectFill"
                class="absolute inset-0 h-full w-full transition-transform duration-700 hover:scale-105"
              />
              <view class="absolute top-4 right-4 z-20 flex gap-2">
                <button
                  class="w-9 h-9 p-0 m-0 rounded-full bg-black/20 backdrop-blur-md border border-solid border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-danger active:bg-white active:text-danger transition-all after:hidden"
                  @click.stop="handleFavorite"
                >
                  <text
                    class="material-symbols-outlined text-[20px] leading-none"
                    >favorite</text
                  >
                </button>
                <button
                  class="w-9 h-9 p-0 m-0 rounded-full bg-black/20 backdrop-blur-md border border-solid border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary active:bg-white active:text-primary transition-all after:hidden"
                  @click.stop="handleShare"
                >
                  <text
                    class="material-symbols-outlined text-[20px] leading-none"
                    >share</text
                  >
                </button>
              </view>
              <!-- Floating Dish Name -->
              <view class="absolute bottom-4 left-4 right-4 z-20 text-white">
                <view
                  class="flex flex-wrap items-center gap-2 mb-2"
                  v-if="item.tags && item.tags.length > 0"
                >
                  <text
                    v-for="(tag, idx) in item.tags.slice(0, 3)"
                    :key="'tag-' + idx"
                    class="text-[10px] px-2 py-0.5 rounded bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium"
                    >{{ tag }}</text
                  >
                </view>
                <text class="block text-2xl font-bold mb-2 truncate">{{
                  item.title
                }}</text>
                <view
                  class="flex items-center gap-2 text-sm font-medium text-white/90 flex-wrap"
                >
                  <view
                    class="flex text-xs items-center gap-1 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg shrink-0"
                  >
                    <text class="material-symbols-outlined !text-sm"
                      >schedule</text
                    >
                    <text>{{ item.cook_time || 0 }}分钟</text>
                  </view>
                  <view
                    class="flex text-xs items-center gap-1 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg shrink-0"
                  >
                    <text class="material-symbols-outlined !text-sm"
                      >equalizer</text
                    >
                    <text>{{ item.difficulty || "简单" }}</text>
                  </view>
                </view>
              </view>
            </view>
            <!-- Action Area -->
            <view
              class="p-4 flex items-center justify-between gap-4 shrink-0 bg-white dark:bg-[#2d2418] rounded-b-[30rpx]"
            >
              <button
                class="w-full m-0 bg-primary hover:bg-orange-600 border-none after:hidden active:opacity-80 active:scale-[0.98] text-white font-bold h-[52px] rounded-xl transition-all shadow-[0_4px_20px_-2px_rgba(255,157,10,0.4)] flex items-center justify-center gap-2"
                @click="handleStartCooking(item)"
              >
                <text class="material-symbols-outlined text-[20px] leading-none"
                  >skillet</text
                >
                <text class="text-sm text-white font-bold leading-none"
                  >开始下厨</text
                >
              </button>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import type { Recipe } from "@/services/recipe";

withDefaults(
  defineProps<{
    recipes?: Recipe[];
    mealTag?: string;
    memberAvatars?: string[];
    extraMemberCount?: number;
  }>(),
  {
    recipes: () => [],
    mealTag: "晚餐推荐",
    memberAvatars: () => [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1xaCumzLqpzkvNproVHkvr7kbITVW7Rrrq_K0jEWYv6MVKLYtxpM9wRnDNa9ch7uia3rw-Vksvv_gBgaOAjk4Et6k7-z-9zXXEh18GBMTX24La3vLU0D4pxKYKG6Lc9_MQYgnOsU0cfFo3JEOxiWPsZxEAzGjXFEvDT3GNIfrKyTVlh4befBHCsI041Bs1uikL95epvlGanoUCMVkHM8INwVyBO56nfmFHMmCDFw9Px9vmWoW_FOPWM8IZEc9ZXfxQSA6gY52Bc8n",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMjBXwdgX9O5A9OyGhveJuCy1ou4rtfeI9iP79ElvVJrJzGBDmoiwPfZTSOoIU5O_UUxZEZbUppuxHI4eqVffk8goJJp45M1YxkcoBf6l8njM9VppTY76QsErYo1QyBYzAm0M_xqt0Q5Zsb0fGYFs-P6iH6aKhNrSo86EFLAn5nBY7um8EWYvbfuRffgtgHlaqU1ZtMT8UijqxmW_Cz690QO8yuVbVrVoulJxUkGonHHfNzTrFUICJEPRn_TjbXAMW7I347SaMFWS_",
    ],
    extraMemberCount: 2,
  },
);

const defaultImageUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAgpI_IYcGM8oAcWZRTUBl3Vr2rGLHDvyThJDCZFmjiUk8AOcFOviu_oi9jDFeg3xfV2A2ZcLZ0v5la4N_u150o2Fbv_3fUZYxcdXMC_KT_EZ5gsU-2SBs3rCzuZHurAOftI_PZhb8NKSBovhNXpZ_RdMhTs5fwc8Hs_o98xRxPTIdT65NFYdqrE9MrH59O6MGKwffYBcdvcIkcaySy8tTodJU8IEI9AN-R7H_kZIYdZoWiVQ8XxzpYJEDWRJtib94CnadM6IAClRxT";

const handleFavorite = () => {
  uni.$u.toast("收藏功能开发中");
};

const handleShare = () => {
  uni.$u.toast("分享功能开发中");
};

const handleStartCooking = (recipe: Recipe) => {
  // TODO: 跳转到烹饪引导页
  uni.$u.toast(`开始下厨: ${recipe.title}`);
};
</script>
