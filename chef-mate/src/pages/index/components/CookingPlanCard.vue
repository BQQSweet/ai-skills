<template>
  <view class="px-6">
    <view class="mb-4 flex items-center justify-between">
      <text class="text-lg font-bold text-[#1d160c] dark:text-white">
        今日烹饪计划
      </text>
      <view class="flex items-center gap-2">
        <view
          class="plan-refresh-trigger"
          :class="{ 'plan-refresh-trigger--disabled': refreshing }"
          @click="handleRefreshClick"
        >
          <text class="plan-refresh-trigger__label">
            {{ refreshing ? "更新中" : "换一批" }}
          </text>
        </view>
        <text class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {{ mealTag }}
        </text>
      </view>
    </view>

    <swiper
      class="h-[420px]"
      circular
      :indicator-dots="true"
      indicator-active-color="#ff9d0a"
      indicator-color="rgba(255,255,255,0.4)"
      previous-margin="0"
      next-margin="40rpx"
    >
      <swiper-item v-for="(item, index) in recipes" :key="item.id || index">
        <view class="h-full w-full box-border bg-transparent pb-8 pr-4">
          <view
            class="flex h-full flex-col overflow-hidden rounded-[32rpx] bg-white shadow-[0_4px_20px_-2px_rgba(29,22,12,0.08)] dark:bg-[#2d2418]"
          >
            <view class="relative h-48 w-full overflow-hidden rounded-[24px]">
              <image
                :src="item.cover_url || defaultImageUrl"
                mode="aspectFill"
                class="h-full w-full object-cover"
              />
              <view class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></view>

              <view class="absolute right-3 top-3 flex gap-2">
                <button
                  class="m-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/20 p-0 text-white backdrop-blur-md after:hidden active:opacity-80"
                  @click.stop="handleFavorite"
                >
                  <text class="material-symbols-outlined text-[18px]">favorite</text>
                </button>
                <button
                  class="m-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/20 p-0 text-white backdrop-blur-md after:hidden active:opacity-80"
                  @click.stop="handleShare"
                >
                  <text class="material-symbols-outlined text-[18px]">share</text>
                </button>
              </view>
            </view>

            <view class="flex flex-1 flex-col justify-between gap-4 p-4">
              <view>
                <view
                  v-if="item.tags && item.tags.length > 0"
                  class="mb-2 flex flex-wrap items-center gap-2"
                >
                  <text
                    v-for="(tag, idx) in item.tags.slice(0, 2)"
                    :key="'tag-' + idx"
                    class="rounded-full border border-primary/10 bg-orange-50 px-2.5 py-1 text-[10px] font-medium text-primary"
                  >
                    {{ tag }}
                  </text>
                  <text
                    class="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500"
                  >
                    {{ ingredientSummary(item) }}
                  </text>
                </view>

                <view class="flex items-center justify-between gap-3">
                  <view class="space-y-1">
                    <text class="block text-lg font-bold text-[#1d160c] dark:text-white">
                      {{ item.title }}
                    </text>
                    <view class="flex flex-wrap items-center gap-1.5 text-xs text-[#a17c45] dark:text-orange-200/60">
                      <text>{{ item.cook_time || 0 }}分钟</text>
                      <text class="opacity-30">|</text>
                      <text>{{ item.difficulty || "简单" }}</text>
                    </view>
                  </view>
                </view>
              </view>

              <view class="flex gap-3">
                <button
                  class="m-0 flex h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border-none bg-primary text-sm font-bold text-white shadow-[0_4px_20px_-2px_rgba(255,157,10,0.4)] after:hidden active:scale-[0.98] active:opacity-80"
                  @click="handleStartCooking(item)"
                >
                  <text class="material-symbols-outlined text-lg">skillet</text>
                  <text>开始下厨</text>
                </button>
                <button
                  class="m-0 flex h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary/40 bg-transparent text-sm font-bold text-primary after:hidden active:scale-[0.98] active:opacity-80"
                  @click="handleViewSteps(item)"
                >
                  <text class="material-symbols-outlined text-lg">list_alt</text>
                  <text>查看步骤</text>
                </button>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import type { Recipe } from "@/services/recipe";

const props = withDefaults(
  defineProps<{
    recipes?: Recipe[];
    mealTag?: string;
    refreshing?: boolean;
    memberAvatars?: string[];
    extraMemberCount?: number;
  }>(),
  {
    recipes: () => [],
    mealTag: "晚餐推荐",
    refreshing: false,
    memberAvatars: () => [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1xaCumzLqpzkvNproVHkvr7kbITVW7Rrrq_K0jEWYv6MVKLYtxpM9wRnDNa9ch7uia3rw-Vksvv_gBgaOAjk4Et6k7-z-9zXXEh18GBMTX24La3vLU0D4pxKYKG6Lc9_MQYgnOsU0cfFo3JEOxiWPsZxEAzGjXFEvDT3GNIfrKyTVlh4befBHCsI041Bs1uikL95epvlGanoUCMVkHM8INwVyBO56nfmFHMmCDFw9Px9vmWoW_FOPWM8IZEc9ZXfxQSA6gY52Bc8n",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMjBXwdgX9O5A9OyGhveJuCy1ou4rtfeI9iP79ElvVJrJzGBDmoiwPfZTSOoIU5O_UUxZEZbUppuxHI4eqVffk8goJJp45M1YxkcoBf6l8njM9VppTY76QsErYo1QyBYzAm0M_xqt0Q5Zsb0fGYFs-P6iH6aKhNrSo86EFLAn5nBY7um8EWYvbfuRffgtgHlaqU1ZtMT8UijqxmW_Cz690QO8yuVbVrVoulJxUkGonHHfNzTrFUICJEPRn_TjbXAMW7I347SaMFWS_",
    ],
    extraMemberCount: 2,
  },
);

const emit = defineEmits<{
  refresh: [];
}>();

const defaultImageUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAgpI_IYcGM8oAcWZRTUBl3Vr2rGLHDvyThJDCZFmjiUk8AOcFOviu_oi9jDFeg3xfV2A2ZcLZ0v5la4N_u150o2Fbv_3fUZYxcdXMC_KT_EZ5gsU-2SBs3rCzuZHurAOftI_PZhb8NKSBovhNXpZ_RdMhTs5fwc8Hs_o98xRxPTIdT65NFYdqrE9MrH59O6MGKwffYBcdvcIkcaySy8tTodJU8IEI9AN-R7H_kZIYdZoWiVQ8XxzpYJEDWRJtib94CnadM6IAClRxT";

const handleFavorite = () => {
  uni.$u.toast("收藏功能开发中");
};

const handleShare = () => {
  uni.$u.toast("分享功能开发中");
};

const handleRefreshClick = () => {
  if (props.refreshing) {
    return;
  }

  emit("refresh");
};

const handleViewSteps = (recipe: Recipe) => {
  uni.$u.toast(`${recipe.title} 的步骤页开发中`);
};

const ingredientSummary = (recipe: Recipe) =>
  recipe.ingredients?.slice(0, 2).map((item) => item.name).join("/") || "家常";

const handleStartCooking = (recipe: Recipe) => {
  const query = [
    `recipeId=${encodeURIComponent(recipe.id || "")}`,
    `recipeTitle=${encodeURIComponent(recipe.title || "")}`,
    `ingredients=${encodeURIComponent(
      JSON.stringify(recipe.ingredients || []),
    )}`,
  ].join("&");

  uni.navigateTo({
    url: `/pages/shopping/index?${query}`,
  });
};
</script>

<style scoped>
.plan-refresh-trigger {
  display: inline-flex;
  min-width: 108rpx;
  height: 64rpx;
  padding: 0 24rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999rpx;
  background: #ffffff;
  box-sizing: border-box;
  box-shadow: 0 8rpx 24rpx -8rpx rgba(255, 157, 10, 0.35);
}

.plan-refresh-trigger__label {
  color: #ff9d0a;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.plan-refresh-trigger--disabled {
  opacity: 0.6;
}
</style>
