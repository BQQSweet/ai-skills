<template>
  <CmBottomSheet
    :show="show"
    :close-on-click-overlay="true"
    :safe-area-inset-bottom="true"
    :panel-class="
      'recipe-steps-preview-sheet flex h-[75vh] flex-col bg-[#fcfaf8] dark:bg-[#2d2418]'
    "
    @update:show="emit('update:show', $event)"
    @close="emit('close')"
  >
    <template #header>
      <view class="shrink-0 px-6 pt-4">
        <view
          class="flex items-start justify-between gap-4 border-b border-black/5 pb-5 dark:border-white/10"
        >
          <view class="min-w-0 flex-1">
            <view class="flex items-center gap-2 text-primary">
              <text class="material-symbols-outlined text-[24px]">menu_book</text>
              <text class="text-sm font-bold tracking-[0.24em] text-primary/80">
                STEP PREVIEW
              </text>
            </view>
            <text class="mt-3 block text-[22px] font-black leading-tight text-[#1d160c] dark:text-white">
              {{ previewTitle }}
            </text>
            <text class="mt-2 block text-sm font-medium text-[#a17c45] dark:text-orange-200/70">
              {{ previewMeta }}
            </text>
          </view>

          <view
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm active:scale-95 dark:bg-white/10 dark:text-slate-300"
            @click="emit('update:show', false)"
          >
            <text class="material-symbols-outlined text-[22px]">close</text>
          </view>
        </view>
      </view>
    </template>

    <view class="flex h-full min-h-0 flex-1 overflow-hidden">
      <scroll-view
        scroll-y
        enable-flex
        class="h-full flex-1 min-h-0 px-6 py-6"
        style="height: 100%;"
      >
        <view v-if="displaySteps.length > 0" class="flex flex-col gap-7 pb-2">
          <view
            v-for="(step, index) in displaySteps"
            :key="`${recipe?.id || 'preview'}-${index}`"
            class="flex gap-4"
          >
            <view class="flex w-10 shrink-0 flex-col items-center">
              <view
                class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-black text-primary"
              >
                {{ index + 1 }}
              </view>
              <view
                v-if="index < displaySteps.length - 1"
                class="mt-2 w-[4rpx] flex-1 rounded-full bg-primary/15"
              />
            </view>

            <view class="min-w-0 flex-1 pb-2">
              <view class="flex items-center gap-2">
                <text class="text-base font-black text-[#1d160c] dark:text-white">
                  {{ stepHeading(index) }}
                </text>
                <text
                  v-if="step.duration_min"
                  class="rounded-full bg-primary/10 px-2 py-1 text-[22rpx] font-bold text-primary"
                >
                  {{ step.duration_min }} 分钟
                </text>
              </view>
              <text class="mt-2 block text-sm leading-7 text-[#7a6140] dark:text-orange-200/75">
                {{ step.instruction }}
              </text>
            </view>
          </view>
        </view>

        <view
          v-else
          class="flex min-h-full flex-col items-center justify-center rounded-[32rpx] border border-dashed border-slate-200 bg-white/60 px-8 text-center dark:border-white/10 dark:bg-white/5"
        >
          <view
            class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <text class="material-symbols-outlined text-[32px]">receipt_long</text>
          </view>
          <text class="mt-4 text-base font-bold text-[#1d160c] dark:text-white">
            暂无步骤信息
          </text>
          <text class="mt-2 text-sm leading-6 text-slate-400">
            当前推荐结果里还没有可预览的步骤内容，请稍后再试。
          </text>
        </view>
      </scroll-view>
    </view>

    <template #footer>
      <view
        class="grid grid-cols-2 gap-3 border-t border-black/5 bg-[#fcfaf8]/96 px-6 pb-6 pt-4 backdrop-blur-sm dark:border-white/10 dark:bg-[#2d2418]/96"
      >
        <button
          class="m-0 flex h-12 items-center justify-center rounded-2xl border border-primary/25 bg-transparent text-sm font-bold text-primary after:hidden active:scale-[0.98]"
          @click="emit('update:show', false)"
        >
          <text>关闭</text>
        </button>
        <button
          class="m-0 flex h-12 items-center justify-center gap-2 rounded-2xl border-none bg-primary text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(255,157,10,0.72)] after:hidden active:scale-[0.98] disabled:opacity-60"
          :disabled="!canEnterDetails"
          @click="emit('enter-details')"
        >
          <text class="material-symbols-outlined text-[20px]">play_circle</text>
          <text>进入完整步骤</text>
        </button>
      </view>
    </template>
  </CmBottomSheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Recipe, RecipeStep } from "@/types/recipe";

const props = defineProps<{
  show: boolean;
  recipe: Recipe | null;
}>();

const emit = defineEmits<{
  "update:show": [value: boolean];
  "enter-details": [];
  close: [];
}>();

const displaySteps = computed<RecipeStep[]>(() => props.recipe?.steps || []);

const previewTitle = computed(() =>
  props.recipe?.title
    ? `${props.recipe.title} · 步骤预览`
    : "菜谱步骤预览",
);

const previewMeta = computed(() => {
  const cookTime = props.recipe?.cook_time || 0;
  const servings = props.recipe?.servings || 1;
  return `预计耗时 ${cookTime} 分钟 · 适合 ${servings} 人份`;
});

const canEnterDetails = computed(() => !!props.recipe);

function stepHeading(index: number) {
  return `步骤 ${index + 1}`;
}
</script>

<style scoped>
.recipe-steps-preview-sheet {
  color: #1d160c;
}
</style>
