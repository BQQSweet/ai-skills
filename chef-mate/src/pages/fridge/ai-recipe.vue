<template>
  <view
    class="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 relative overflow-x-hidden pb-32"
  >
    <!-- Background Effect -->
    <view class="fixed inset-0 pointer-events-none z-0">
      <view
        class="absolute top-[10%] left-[10%] w-[80vw] h-[80vw] bg-primary/5 rounded-full blur-[80px]"
      ></view>
      <view
        class="absolute bottom-[20%] right-[10%] w-[60vw] h-[60vw] bg-ai-purple/5 rounded-full blur-[80px]"
      ></view>
    </view>

    <!-- Header -->
    <AiRecipeHeader @back="goBack" />

    <!-- Main Content -->
    <scroll-view
      scroll-y
      class="relative z-10 w-full px-4 pt-4 flex flex-col gap-6"
    >
      <!-- Selected Ingredients Section -->
      <AiRecipeIngredients
        :ingredients="ingredientsList"
        @regenerate="fetchRecipe"
      />

      <!-- Recipe Card Section -->
      <AiRecipeCard
        v-if="recipeData"
        :recipe="recipeData"
        :isLoading="isLoading"
      />

      <!-- Loading Skeleton (Initial Load) -->
      <AiRecipeSkeleton v-else />

      <!-- AI Tip Box -->
      <AiRecipeTip />

      <!-- Bottom spacing allowance -->
      <view class="h-24"></view>
    </scroll-view>

    <!-- Fixed Bottom Action Bar -->
    <AiRecipeFab @start="startCookingVoice" />

    <!-- 全局提示 (加载/错误) -->
    <CmToast ref="uToastRef" />
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import CmToast from "@/components/CmToast/CmToast.vue";
import { generateAiRecipe } from "@/services/recipe";
import { useRecipeStore } from "@/stores/recipe";

import AiRecipeHeader from "./components/AiRecipeHeader.vue";
import AiRecipeIngredients from "./components/AiRecipeIngredients.vue";
import AiRecipeCard from "./components/AiRecipeCard.vue";
import AiRecipeSkeleton from "./components/AiRecipeSkeleton.vue";
import AiRecipeTip from "./components/AiRecipeTip.vue";
import AiRecipeFab from "./components/AiRecipeFab.vue";

const uToastRef = ref<any>(null);
const isLoading = ref(true);
const ingredientsList = ref<string[]>([]);
const recipeData = ref<any>(null);

let generateParams: any = { ingredients: [] };

onLoad((options: any) => {
  if (options.ingredients) {
    try {
      generateParams.ingredients = JSON.parse(
        decodeURIComponent(options.ingredients),
      );
    } catch {
      // Ignored
    }
  }
  if (options.taste) generateParams.taste = options.taste;
  if (options.mealType) generateParams.mealType = options.mealType;
  if (options.servings) generateParams.servings = Number(options.servings);

  ingredientsList.value = generateParams.ingredients;
  fetchRecipe();
});

const fetchRecipe = async () => {
  isLoading.value = true;
  if (!recipeData.value) {
    uToastRef.value?.show({
      type: "loading",
      message: "AI大厨正在思考中...",
      duration: 20000,
    });
  } else {
    uToastRef.value?.show({
      type: "loading",
      message: "重新生成中...",
      duration: 20000,
    });
  }

  try {
    const res = await generateAiRecipe(generateParams);
    recipeData.value = res;
    uToastRef.value?.close();
  } catch (err: any) {
    uToastRef.value?.close();
    uToastRef.value?.show({
      type: "error",
      message: err.message || "生成失败",
    });
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: "/pages/fridge/index" });
    },
  });
};

const startCookingVoice = () => {
  if (isLoading.value || !recipeData.value) return;
  useRecipeStore().setCurrentRecipe(recipeData.value);
  uni.navigateTo({
    url: "/pages/recipe/cooking-guide",
  });
};
</script>

<style scoped>
.font-sans {
  font-family: "Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", sans-serif;
}
.font-display {
  font-family: "Plus Jakarta Sans", "Noto Sans SC", sans-serif;
}
</style>
