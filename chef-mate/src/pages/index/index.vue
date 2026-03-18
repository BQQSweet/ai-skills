<template>
  <view
    class="relative flex flex-col min-h-screen w-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-sans transition-colors duration-200 overflow-hidden"
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
        :refreshing="recommendRefreshing"
        @refresh="handleRefreshRecommendations"
      />
      <view
        v-else
        class="px-6 mb-8 mt-2 h-64 flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-[30rpx] mx-6"
      >
        <text class="text-sm text-gray-400">{{ recommendPlaceholderText }}</text>
      </view>

      <ExpiryAlerts :items="fridgeItems" />
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
import { useFeedStore } from "@/stores/feed";
import { useGroupStore } from "@/stores/group";
import {
  getRecommendedRecipes,
  type Recipe,
  type RecommendedRecipesResponse,
  type RecommendedRecipesResult,
} from "@/services/recipe";
import { getFridgeItems } from "@/services/fridge";
import type { FridgeItem } from "@/types/fridge";

const userStore = useUserStore();
const groupStore = useGroupStore();
const feedStore = useFeedStore();

// TODO: 从 userStore 获取
const nickname = computed(() => userStore.userInfo?.nickname || "Chef");
const avatarUrl = computed(() => userStore.userInfo?.avatarUrl);

// 推荐食谱
const recommendedRecipes = ref<Recipe[]>([]);
const mealTag = ref("今日推荐");
const recommendRefreshing = ref(false);
const recommendLoading = ref(true);

// 冰箱食材
const fridgeItems = ref<FridgeItem[]>([]);

async function loadRecommendedRecipes(refresh = false) {
  const recipeRes = await getRecommendedRecipes(refresh);
  applyRecommendationResponse(recipeRes);
}

const recommendPlaceholderText = computed(() =>
  recommendLoading.value ? "正在为您推荐今日菜单..." : "暂无推荐食谱，稍后再试",
);

function applyRecommendationResponse(recipeRes: RecommendedRecipesResult) {
  if (Array.isArray(recipeRes)) {
    recommendedRecipes.value = recipeRes;
    mealTag.value = getDefaultMealTag();
    return;
  }

  const normalizedResponse = recipeRes as RecommendedRecipesResponse;
  recommendedRecipes.value = normalizedResponse.recipes || [];
  mealTag.value = normalizedResponse.mealTag || getDefaultMealTag();
}

function getDefaultMealTag() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "早餐推荐";
  if (hour >= 10 && hour < 14) return "午餐推荐";
  if (hour >= 14 && hour < 17) return "下午茶推荐";
  if (hour >= 17 && hour < 21) return "晚餐推荐";
  return "夜宵推荐";
}

async function handleRefreshRecommendations() {
  try {
    recommendRefreshing.value = true;
    recommendLoading.value = true;
    await loadRecommendedRecipes(true);
  } catch (err) {
    console.error("获取推荐食谱失败:", err);
  } finally {
    recommendRefreshing.value = false;
    recommendLoading.value = false;
  }
}

onShow(async () => {
  try {
    recommendLoading.value = true;
    if (!groupStore.currentGroup) {
      await groupStore.fetchMyGroups();
    }

    const [recipeRes, fridgeRes] = await Promise.all([
      getRecommendedRecipes(),
      groupStore.currentGroup
        ? getFridgeItems(groupStore.currentGroup.id)
        : Promise.resolve([] as FridgeItem[]),
    ]);

    if (groupStore.currentGroup) {
      await feedStore.fetchFeedList(groupStore.currentGroup.id, true);
    } else {
      feedStore.clearFeed();
    }

    if (fridgeRes) {
      fridgeItems.value = (fridgeRes as FridgeItem[] & { data?: FridgeItem[] })?.data || fridgeRes as FridgeItem[];
    }

    applyRecommendationResponse(recipeRes);
  } catch (err) {
    console.error("获取推荐食谱失败:", err);
  } finally {
    recommendLoading.value = false;
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
