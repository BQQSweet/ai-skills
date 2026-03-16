<template>
  <view
    class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen pb-20 flex flex-col relative w-full overflow-x-hidden"
  >
    <!-- Header -->
    <view
      class="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800"
    >
      <view
        class="flex items-center justify-between px-4 py-4 mt-safe-top pb-safe-top"
      >
        <view
          @click="goBack"
          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
        >
          <text
            class="material-symbols-outlined text-slate-700 dark:text-slate-300"
            >arrow_back_ios_new</text
          >
        </view>
        <view class="text-center">
          <text
            class="block text-base font-bold text-slate-900 dark:text-white"
          >
            {{ recipe?.title || "食谱详情" }}
          </text>
          <text
            class="block text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5"
          >
            完整烹饪步骤
          </text>
        </view>
        <view
          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <text
            class="material-symbols-outlined text-slate-700 dark:text-slate-300"
            >more_horiz</text
          >
        </view>
      </view>
    </view>

    <!-- Main Content -->
    <scroll-view
      scroll-y
      class="max-w-md mx-auto w-full px-4 pt-6 flex flex-col gap-5 flex-1 relative z-10"
    >
      <view class="flex flex-col gap-5">
        <CookingStepCard
          v-for="(step, index) in recipe?.steps"
          :key="index"
          :step="step"
          :index="Number(index) + 1"
          :isLast="Number(index) === (recipe?.steps?.length ?? 0) - 1"
          :hasQa="(qaRecords[Number(index)]?.length || 0) > 0"
          @ask="handleAsk(Number(index), step)"
        />

        <view
          class="mt-4 mb-8 p-5 rounded-2xl bg-primary/5 border border-primary/10"
        >
          <view class="flex items-center gap-2 mb-2">
            <text class="material-symbols-outlined text-primary text-xl"
              >lightbulb</text
            >
            <text class="font-bold text-slate-800 dark:text-white text-sm"
              >大厨贴士</text
            >
          </view>
          <text
            class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed block"
          >
            在烹饪过程中遇到任何问题，随时可以点击每一步的“有问题问
            AI”向我寻求帮助！尝试使用底部语音控制，解放双手。
          </text>
        </view>
      </view>
    </scroll-view>

    <!-- FAB -->
    <view
      class="fixed bottom-0 left-0 right-0 p-6 flex flex-col items-center z-50 pointer-events-none pb-safe"
    >
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
        <text class="material-symbols-outlined text-[20px] opacity-60 ml-1"
          >arrow_forward_ios</text
        >
      </button>
      <text
        class="block mt-3 text-[11px] text-slate-400 font-medium pointer-events-auto"
      >
        使用语音控制，无需触碰手机
      </text>
    </view>

    <!-- Global Master Q&A Popup -->
    <up-popup
      v-model:show="showQaPopup"
      mode="bottom"
      round="24"
      :closeable="true"
      :safeAreaInsetBottom="false"
      zIndex="10075"
    >
      <view class="bg-card w-full h-[65vh] flex flex-col pt-4 relative">
        <view
          class="px-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0 pr-10"
        >
          <text
            class="text-lg font-bold text-slate-800 dark:text-white block mt-2"
            >疑问解答</text
          >
          <text class="text-xs text-slate-500 line-clamp-1 mt-1"
            >针对当前操作：{{ activeStep?.instruction }}</text
          >
        </view>

        <scroll-view
          scroll-y
          class="flex-1 px-5 pt-4 pb-20"
          :scroll-top="scrollTop"
        >
          <view
            v-if="!activeQaHistory || activeQaHistory.length === 0"
            class="flex flex-col items-center justify-center h-full opacity-60 pb-10"
          >
            <text class="material-symbols-outlined text-4xl mb-2 text-ai-purple"
              >smart_toy</text
            >
            <text class="text-sm text-center text-slate-500"
              >对这一步有任何疑惑都可以问我哦<br />比如："西红柿要切多大块？"</text
            >
          </view>

          <view v-else class="flex flex-col gap-4">
            <view
              v-for="(msg, idx) in activeQaHistory"
              :key="idx"
              class="flex flex-col"
              :class="msg.role === 'user' ? 'items-end' : 'items-start'"
            >
              <view
                class="max-w-[85%] rounded-2xl p-3 text-sm"
                :class="
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                "
              >
                {{ msg.content }}
              </view>
            </view>
            <view v-if="isAsking" class="flex flex-col items-start">
              <view
                class="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm p-3 flex gap-1 items-center"
              >
                <view
                  class="w-2 h-2 rounded-full bg-ai-purple animate-bounce"
                  style="animation-delay: 0s"
                ></view>
                <view
                  class="w-2 h-2 rounded-full bg-ai-purple animate-bounce"
                  style="animation-delay: 0.2s"
                ></view>
                <view
                  class="w-2 h-2 rounded-full bg-ai-purple animate-bounce"
                  style="animation-delay: 0.4s"
                ></view>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- Fixed Input at the bottom of the popup -->
        <view
          class="absolute bottom-0 left-0 right-0 px-4 py-4 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 pb-safe flex items-center gap-3 z-[10080]"
        >
          <input
            v-model="questionInput"
            class="flex-1 bg-slate-100 dark:bg-slate-800 h-10 rounded-full px-4 text-sm"
            placeholder="输入你的问题..."
            :disabled="isAsking"
            @confirm="submitQuestion"
            confirm-type="send"
            :adjust-position="true"
            :cursor-spacing="20"
          />
          <button
            @click="submitQuestion"
            :disabled="!questionInput.trim() || isAsking"
            class="m-0 w-10 h-10 rounded-full bg-ai-purple text-white flex items-center justify-center disabled:opacity-50 transition-opacity after:hidden border-none shrink-0"
          >
            <text
              class="material-symbols-outlined text-[20px]"
              :style="{ fontVariationSettings: '\'FILL\' 1' }"
              >send</text
            >
          </button>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, reactive, nextTick } from "vue";
import { useRecipeStore } from "@/stores/recipe";
import { askStepQuestion } from "@/services/recipe";
import CookingStepCard from "./components/CookingStepCard.vue";

// Base State
const recipeStore = useRecipeStore();
const recipe = computed(() => recipeStore.currentRecipe);

// QA Popup State
const showQaPopup = ref(false);
const activeStepIndex = ref(-1);
const activeStep = ref<any>(null);
const questionInput = ref("");
const isAsking = ref(false);
const scrollTop = ref(0);

// Map of step index to history
const qaRecords = reactive<
  Record<number, { role: "user" | "ai"; content: string }[]>
>({});

const activeQaHistory = computed(() => {
  if (activeStepIndex.value === -1) return [];
  return qaRecords[activeStepIndex.value] || [];
});

const handleAsk = (index: number, step: any) => {
  activeStepIndex.value = index;
  activeStep.value = step;
  if (!qaRecords[index]) {
    qaRecords[index] = [];
  }
  showQaPopup.value = true;
  scrollToBottom();
};

const scrollToBottom = () => {
  nextTick(() => {
    scrollTop.value = 9999 + Math.random();
  });
};

const submitQuestion = async () => {
  const q = questionInput.value.trim();
  if (!q || isAsking.value || activeStepIndex.value === -1) return;

  qaRecords[activeStepIndex.value].push({ role: "user", content: q });
  questionInput.value = "";
  isAsking.value = true;
  scrollToBottom();

  try {
    const res: any = await askStepQuestion({
      recipeContext: `食谱名称：${recipe.value?.title || "未知"}。${recipe.value?.description || ""}`,
      stepInstruction: activeStep.value?.instruction,
      question: q,
    });

    const answer =
      res && res.data
        ? res.data
        : typeof res === "string"
          ? res
          : JSON.stringify(res);
    qaRecords[activeStepIndex.value].push({ role: "ai", content: answer });
  } catch (err) {
    qaRecords[activeStepIndex.value].push({
      role: "ai",
      content: "抱歉，网络开小差了，请稍后再试。",
    });
  } finally {
    isAsking.value = false;
    scrollToBottom();
  }
};

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
