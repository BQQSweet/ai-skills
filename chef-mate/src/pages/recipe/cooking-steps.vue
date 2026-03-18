<template>
  <CmPageShell
    :background-class="
      'bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col relative w-full overflow-x-hidden'
    "
    :header-class="
      'z-50 bg-background-light/80 dark:bg-background-dark/80 border-b border-slate-100 dark:border-slate-800 backdrop-blur-md px-4 py-4 mt-safe-top pb-safe-top'
    "
    :content-padding-class="'max-w-md mx-auto w-full px-4 pt-6'"
    :footer-class="
      'fixed bottom-0 left-0 right-0 p-6 flex flex-col items-center z-50 pointer-events-none pb-safe'
    "
    :header-offset-class="'pt-[96px]'"
    @back="goBack"
  >
    <template #title>
      <view class="text-center">
        <text class="block text-base font-bold text-slate-900 dark:text-white">
          {{ recipe?.title || "食谱详情" }}
        </text>
        <text
          class="block text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5"
        >
          完整烹饪步骤
        </text>
      </view>
    </template>

    <template #right>
      <view
        class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <text class="material-symbols-outlined text-slate-700 dark:text-slate-300">
          more_horiz
        </text>
      </view>
    </template>

    <view class="flex flex-col gap-5">
      <CookingStepCard
        v-for="(step, index) in recipe?.steps"
        :key="index"
        :step="step"
        :index="Number(index) + 1"
        :is-last="Number(index) === (recipe?.steps?.length ?? 0) - 1"
        :has-qa="(qaRecords[Number(index)]?.length || 0) > 0"
        @ask="handleAsk(Number(index), step)"
      />

      <StepTipsCard />
    </view>

    <template #footer>
      <view
        class="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent -z-10 h-40 bottom-0 pointer-events-none"
      ></view>
      <button
        @click="startGuide"
        class="m-0 pointer-events-auto bg-primary text-white w-full max-w-sm h-14 rounded-full shadow-[0_8px_25px_rgba(255,159,10,0.3)] flex items-center justify-center gap-3 text-lg font-bold active:scale-[0.97] transition-all group relative overflow-hidden after:hidden border-none text-[17px]"
      >
        <view
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none"
        ></view>
        <view
          class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
        >
          <text class="material-symbols-outlined text-[22px]">mic</text>
        </view>
        <text>开始烹饪 (语音模式)</text>
        <text class="material-symbols-outlined text-[20px] opacity-60 ml-1">
          arrow_forward_ios
        </text>
      </button>
      <text
        class="block mt-3 text-[11px] text-slate-400 font-medium pointer-events-auto"
      >
        使用语音控制，无需触碰手机
      </text>
    </template>

    <StepQaPopup
      v-model:show="showQaPopup"
      v-model:question-input="questionInput"
      :active-step="activeStep"
      :active-qa-history="activeQaHistory"
      :is-asking="isAsking"
      :scroll-top="scrollTop"
      @submit="submitQuestion"
    />
  </CmPageShell>
</template>

<script setup lang="ts">
import { useStepQa } from "./composables/useStepQa";
import CookingStepCard from "./components/CookingStepCard.vue";
import StepQaPopup from "./components/StepQaPopup.vue";
import StepTipsCard from "./components/StepTipsCard.vue";

const {
  recipe,
  showQaPopup,
  activeStep,
  questionInput,
  isAsking,
  scrollTop,
  qaRecords,
  activeQaHistory,
  handleAsk,
  submitQuestion,
} = useStepQa();

const goBack = () => {
  uni.navigateBack();
};

const startGuide = () => {
  uni.navigateTo({
    url: "/pages/recipe/cooking-guide",
  });
};
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
.pb-safe-top {
  padding-bottom: env(safe-area-inset-top);
}
.mt-safe-top {
  margin-top: env(safe-area-inset-top);
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
