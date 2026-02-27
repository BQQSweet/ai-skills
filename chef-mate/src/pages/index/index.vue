<template>
  <view
    class="relative flex flex-col min-h-screen w-full bg-background-light dark:bg-[#231b0f] text-text-main dark:text-white font-sans transition-colors duration-200 overflow-hidden"
  >
    <!-- Header -->
    <HomeHeader
      :nickname="nickname"
      :avatar-url="avatarUrl"
      :unread-count="1"
    />

    <!-- Scrollable Content -->
    <scroll-view
      scroll-y
      class="flex-1 overflow-y-auto no-scrollbar space-y-8"
      :show-scrollbar="false"
    >
      <CookingPlanCard
        v-if="recommendedRecipes.length > 0"
        :recipes="recommendedRecipes"
        :meal-tag="mealTag"
      />
      <view
        v-else
        class="px-6 mb-8 mt-2 h-64 flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-[30rpx] mx-6"
      >
        <text class="text-sm text-gray-400">正在为您推荐今日菜单...</text>
      </view>

      <ExpiryAlerts />
      <FamilyFeed />
      <!-- Safe Area Spacing + Tab bar height -->
      <view class="h-10"></view>
    </scroll-view>

    <!-- Bottom Navigation Component -->
    <CmTabBar :current="0" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import HomeHeader from "./components/HomeHeader.vue";
import CookingPlanCard from "./components/CookingPlanCard.vue";
import ExpiryAlerts from "./components/ExpiryAlerts.vue";
import FamilyFeed from "./components/FamilyFeed.vue";
import CmTabBar from "@/components/CmTabBar/CmTabBar.vue";
import { useUserStore } from "@/stores/user";
import { getRecommendedRecipes, type Recipe } from "@/services/recipe";

const userStore = useUserStore();

// TODO: 从 userStore 获取
const nickname = computed(() => userStore.userInfo?.nickname || "Chef");
const avatarUrl = computed(() => userStore.userInfo?.avatarUrl);

// 推荐食谱
const recommendedRecipes = ref<Recipe[]>([]);
const mealTag = ref("今日推荐");

onShow(async () => {
  try {
    const res = await getRecommendedRecipes();
    if (res && res.length > 0) {
      // 传递整个数组给轮播组件
      recommendedRecipes.value = res;

      // 简单的时间段处理标签
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 10) mealTag.value = "早餐推荐";
      else if (hour >= 10 && hour < 14) mealTag.value = "午餐推荐";
      else if (hour >= 14 && hour < 17) mealTag.value = "下午茶推荐";
      else if (hour >= 17 && hour < 21) mealTag.value = "晚餐推荐";
      else mealTag.value = "夜宵推荐";
    }
  } catch (err) {
    console.error("获取推荐食谱失败:", err);
  }
});
</script>

<style scoped>
.font-sans {
  font-family: "Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", sans-serif;
}

/* 隐藏滚动条 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
