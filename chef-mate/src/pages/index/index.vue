<template>
  <CmPageShell
    :background-class="'relative flex min-h-screen w-full flex-col overflow-hidden bg-[#fcfaf8] font-sans text-text-main transition-colors duration-200 dark:bg-background-dark dark:text-white'"
    :header-class="'z-20 bg-[#fcfaf8]/95 px-0 backdrop-blur-md dark:bg-background-dark/95'"
    :use-scroll-view="false"
    :content-class="'flex min-h-0 flex-1 flex-col'"
    :header-offset-style="homeHeaderOffsetStyle"
  >
    <template #header>
      <HomeHeader
        :nickname="nickname"
        :avatar-url="avatarUrl"
        :unread-count="1"
      />
    </template>

    <scroll-view
      :scroll-y="!showRecipePreview"
      class="flex-1 overflow-y-auto no-scrollbar"
      :class="{ 'home-scroll-locked': showRecipePreview }"
      :show-scrollbar="false"
    >
      <view>
        <CookingPlanCard
          v-if="recommendedRecipes.length > 0"
          :recipes="recommendedRecipes"
          :meal-tag="mealTag"
          :refreshing="recommendRefreshing"
          @refresh="handleRefreshRecommendations"
          @start-cooking="ingredientSelection.openIngredientSelection"
          @view-steps="handleOpenRecipePreview"
        />
        <view
          v-else
          class="mx-6 mt-2 flex h-72 items-center justify-center rounded-[32rpx] border border-white/60 bg-white/70 px-6 text-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-black/20"
        >
          <text class="text-sm text-slate-400">{{
            recommendPlaceholderText
          }}</text>
        </view>

        <ExpiryAlerts :items="fridgeItems" />
        <FamilyFeed />
      </view>
    </scroll-view>

    <RecipeStepsPreviewSheet
      :show="showRecipePreview"
      :recipe="previewRecipe"
      @update:show="handleRecipePreviewVisibilityChange"
      @enter-details="handleEnterRecipeDetails"
    />

    <RecipeIngredientSelectionSheet
      :show="ingredientSelection.showIngredientSelectionSheet"
      :recipe-title="ingredientSelection.selectionRecipeTitle"
      :items="ingredientSelection.classifiedRecipeIngredients"
      :selected-keys="ingredientSelection.selectedIngredientKeys"
      :confirming="ingredientSelection.confirmingIngredientSelection"
      @update:show="
        $event
          ? null
          : ingredientSelection.closeIngredientSelection()
      "
      @toggle="ingredientSelection.toggleIngredientSelection"
      @confirm="ingredientSelection.confirmSelectedIngredients"
      @close="ingredientSelection.handleIngredientSelectionClosed"
    />

    <template #footer>
      <CmTabBar :current="0" />
    </template>
  </CmPageShell>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from "vue";
import { onReady, onShow } from "@dcloudio/uni-app";
import HomeHeader from "./components/HomeHeader.vue";
import CookingPlanCard from "./components/CookingPlanCard.vue";
import ExpiryAlerts from "./components/ExpiryAlerts.vue";
import FamilyFeed from "./components/FamilyFeed.vue";
import RecipeIngredientSelectionSheet from "./components/RecipeIngredientSelectionSheet.vue";
import { useRecipeIngredientSelection } from "./composables/useRecipeIngredientSelection";
import CmTabBar from "@/components/CmTabBar/CmTabBar.vue";
import RecipeStepsPreviewSheet from "@/pages/recipe/components/RecipeStepsPreviewSheet.vue";
import { useUserStore } from "@/stores/user";
import { useFeedStore } from "@/stores/feed";
import { useGroupStore } from "@/stores/group";
import { useRecipeStore } from "@/stores/recipe";
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
const recipeStore = useRecipeStore();
const homeHeaderHeight = ref(128);
const ingredientSelection = reactive(useRecipeIngredientSelection());

// TODO: 从 userStore 获取
const nickname = computed(() => userStore.userInfo?.nickname || "Chef");
const avatarUrl = computed(() => userStore.userInfo?.avatarUrl);
const homeHeaderOffsetStyle = computed(() => ({
  paddingTop: `${homeHeaderHeight.value}px`,
}));

// 推荐食谱
const recommendedRecipes = ref<Recipe[]>([]);
const previewRecipe = ref<Recipe | null>(null);
const mealTag = ref("今日推荐");
const recommendRefreshing = ref(false);
const recommendLoading = ref(true);
const showRecipePreview = ref(false);

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

function handleOpenRecipePreview(recipe: Recipe) {
  previewRecipe.value = recipe;
  showRecipePreview.value = true;
}

function handleRecipePreviewVisibilityChange(value: boolean) {
  showRecipePreview.value = value;

  if (!value) {
    previewRecipe.value = null;
  }
}

function handleEnterRecipeDetails() {
  if (!previewRecipe.value) {
    return;
  }

  recipeStore.setCurrentRecipe(previewRecipe.value);
  showRecipePreview.value = false;
  previewRecipe.value = null;

  uni.navigateTo({
    url: "/pages/recipe/cooking-steps",
  });
}

const measureHomeHeader = async () => {
  await nextTick();

  const query = uni.createSelectorQuery();
  query.select(".home-header-root").boundingClientRect((rect) => {
    const targetRect = Array.isArray(rect) ? rect[0] : rect;
    if (
      !targetRect ||
      typeof targetRect.height !== "number" ||
      targetRect.height <= 0
    ) {
      return;
    }
    homeHeaderHeight.value = Math.ceil(targetRect.height);
  });
  query.exec();
};

onReady(() => {
  void measureHomeHeader();
});

onShow(async () => {
  try {
    void measureHomeHeader();
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
      fridgeItems.value =
        (fridgeRes as FridgeItem[] & { data?: FridgeItem[] })?.data ||
        (fridgeRes as FridgeItem[]);
    }

    applyRecommendationResponse(recipeRes);
  } catch (err) {
    console.error("获取推荐食谱失败:", err);
  } finally {
    recommendLoading.value = false;
  }
});

watch(nickname, async () => {
  await measureHomeHeader();
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

.home-scroll-locked {
  overflow: hidden;
}
</style>
