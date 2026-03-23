<template>
  <view class="min-h-screen overflow-hidden bg-[#fafaf8] text-slate-900">
    <view class="pointer-events-none fixed inset-0 overflow-hidden">
      <view
        class="absolute left-[-10%] top-[-6%] h-[54vw] w-[54vw] rounded-full bg-[#ffdcb2]/45 blur-[78px]"
      ></view>
      <view
        class="absolute bottom-[12%] right-[-14%] h-[52vw] w-[52vw] rounded-full bg-[#fff1dc] blur-[86px]"
      ></view>
      <view
        class="absolute inset-0 opacity-40"
        style="background-image: radial-gradient(circle at 1px 1px, rgba(196,111,24,0.08) 1px, transparent 0); background-size: 24px 24px;"
      ></view>
    </view>

    <VideoRecipeHeader @back="goBack" />

    <scroll-view scroll-y class="relative z-10 min-h-0 px-5 pb-10">
      <view class="flex flex-col gap-6 pb-[calc(env(safe-area-inset-bottom)+28px)]">
        <VideoRecipeUploadCard
          :status="videoJob.status"
          :selected-file="videoJob.selectedFile"
          :cover-url="videoJob.coverUrl"
          :can-submit="videoJob.canSubmit"
          :mode="videoJob.mode"
          @pick-local="videoJob.chooseLocalVideo"
          @clear-file="videoJob.clearSelectedVideo"
          @update:mode="videoJob.setMode"
          @submit="videoJob.submitSelectedVideo"
        />

        <VideoRecipeProgressCard
          v-if="videoJob.status === 'uploading' || videoJob.status === 'processing'"
          :status="videoJob.status"
          :job="videoJob.jobStatus"
          :selected-file="videoJob.selectedFile"
        />

        <VideoRecipeFailureCard
          v-if="videoJob.status === 'failed'"
          :error="videoJob.errorMessage"
          @retry="videoJob.resetForRetry"
        />

        <VideoRecipeResultCard
          v-if="videoJob.status === 'done' && videoJob.recipe"
          :recipe="videoJob.recipe"
          :ingredients="videoJob.displayIngredients"
          :mode="videoJob.mode"
          :regenerating="videoJob.regenerating"
          :shopping-loading="videoJob.classifyingIngredients"
          @toggle-mode="videoJob.regenerateWithMode"
          @view-steps="videoJob.openRecipeSteps"
          @generate-shopping="handleGenerateShopping"
        />

        <view
          class="rounded-[36rpx] border border-white/80 bg-white/72 p-6 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.18)] backdrop-blur-[18px]"
        >
          <text class="block text-[11px] font-black uppercase tracking-[0.28em] text-[#c46f18]/75">
            解析提醒
          </text>
          <view class="mt-4 flex flex-col gap-3 text-sm leading-6 text-slate-600">
            <view class="flex items-start gap-3">
              <view class="mt-1 h-2 w-2 rounded-full bg-[#ff9d0a]"></view>
              <text class="flex-1">尽量拍到主要食材和关键操作，抽帧识别会更稳定。</text>
            </view>
            <view class="flex items-start gap-3">
              <view class="mt-1 h-2 w-2 rounded-full bg-[#ff9d0a]"></view>
              <text class="flex-1">如果视频里有讲解语音，步骤、份量和火候会更完整。</text>
            </view>
            <view class="flex items-start gap-3">
              <view class="mt-1 h-2 w-2 rounded-full bg-[#ff9d0a]"></view>
              <text class="flex-1">解析完成后会自动对比冰箱库存，缺的食材可一键生成购物清单。</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

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
  </view>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import RecipeIngredientSelectionSheet from "@/components/RecipeIngredientSelectionSheet.vue";
import { useRecipeIngredientSelection } from "@/composables/useRecipeIngredientSelection";
import VideoRecipeHeader from "./components/from-video/VideoRecipeHeader.vue";
import VideoRecipeUploadCard from "./components/from-video/VideoRecipeUploadCard.vue";
import VideoRecipeProgressCard from "./components/from-video/VideoRecipeProgressCard.vue";
import VideoRecipeResultCard from "./components/from-video/VideoRecipeResultCard.vue";
import VideoRecipeFailureCard from "./components/from-video/VideoRecipeFailureCard.vue";
import { useVideoRecipeJob } from "./composables/useVideoRecipeJob";

const videoJob = reactive(useVideoRecipeJob());
const ingredientSelection = reactive(useRecipeIngredientSelection());

onLoad(() => {
  void videoJob.resumeActiveJob();
});

onShow(() => {
  void videoJob.resumeActiveJob();
});

const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: "/pages/fridge/index" });
    },
  });
};

function handleGenerateShopping() {
  videoJob.openShoppingList();

  if (!videoJob.recipe) {
    return;
  }

  if (
    videoJob.classifyingIngredients
    || videoJob.ingredientClassificationError
    || !videoJob.shoppingSelectableIngredients.length
  ) {
    return;
  }

  void ingredientSelection.openWithClassifiedIngredients({
    recipeId: videoJob.recipe.id || undefined,
    recipeTitle: videoJob.recipe.title || "协作采购清单",
    items: videoJob.shoppingSelectableIngredients,
  });
}
</script>
