<template>
  <view
    class="overflow-hidden rounded-[36rpx] border border-white/80 bg-white/88 shadow-[0_20px_54px_-34px_rgba(15,23,42,0.18)]"
  >
    <view class="relative h-56 overflow-hidden">
      <image
        v-if="resolvedCoverUrl"
        :src="resolvedCoverUrl"
        class="h-full w-full object-cover"
        mode="aspectFill"
      />
      <view
        v-else
        class="h-full w-full bg-[linear-gradient(135deg,#fff5e6_0%,#ffe6c2_52%,#ffd29d_100%)]"
      ></view>
      <view class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.28)_100%)]"></view>
      <view
        class="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-slate-800 backdrop-blur-[12px]"
      >
        <view class="h-1.5 w-1.5 rounded-full bg-[#4CAF50]"></view>
        解析成功
      </view>
      <view
        v-if="!resolvedCoverUrl"
        class="absolute inset-0 flex items-center justify-center text-[#c46f18]/65"
      >
        <text class="material-symbols-outlined text-[68px]">restaurant</text>
      </view>
    </view>

    <view class="p-6">
      <text class="block text-[30px] italic leading-tight text-slate-900 text-notoserifsc">
        {{ displayTitle }}
      </text>
      <text class="mt-3 block text-sm leading-6 text-slate-600">
        {{ recipe.description || "已根据视频内容生成一份可继续编辑和烹饪的食谱草稿。" }}
      </text>

      <view class="mt-4 flex flex-wrap gap-2">
        <view class="rounded-full bg-[#fff0d9] px-3 py-1.5 text-xs font-semibold text-[#b45309]">
          {{ recipe.cook_time }} 分钟
        </view>
        <view class="rounded-full bg-[#f5f5f4] px-3 py-1.5 text-xs font-semibold text-slate-700">
          {{ recipe.difficulty }}
        </view>
        <view class="rounded-full bg-[#f5f5f4] px-3 py-1.5 text-xs font-semibold text-slate-700">
          {{ recipe.servings }} 人份
        </view>
        <view
          v-for="tag in recipe.tags?.slice(0, 3)"
          :key="tag"
          class="rounded-full bg-[#fff7eb] px-3 py-1.5 text-xs font-semibold text-[#b86a1c]"
        >
          # {{ tag }}
        </view>
      </view>

      <view
        class="mt-5 rounded-[28rpx] border p-4"
        :class="
          mode === 'strict'
            ? 'border-[#f6d5a7] bg-[#fff9f0]'
            : 'border-[#d8e5ff] bg-[#f5f8ff]'
        "
      >
        <view class="flex items-start justify-between gap-4">
          <view class="min-w-0 flex-1">
            <text
              class="block text-[11px] font-black uppercase tracking-[0.22em]"
              :class="mode === 'strict' ? 'text-[#b45309]' : 'text-[#4868a6]'"
            >
              {{ mode === "strict" ? "严格模式" : "允许补全" }}
            </text>
            <text class="mt-2 block text-sm leading-6 text-slate-600">
              {{
                mode === "strict"
                  ? "只保留视频中确认到的步骤，结果更克制也更贴近原始内容。"
                  : "会在视频确认步骤之间补少量 AI 推断步骤，并在步骤里标记 AI 补全。"
              }}
            </text>
          </view>
          <button
            class="m-0 shrink-0 rounded-full border border-[#f0c387] bg-white px-4 py-2 text-xs font-semibold text-[#b45309] after:hidden disabled:opacity-60"
            :disabled="regenerating"
            @click="$emit('toggle-mode', mode === 'strict' ? 'assisted' : 'strict')"
          >
            {{
              regenerating
                ? "重生成中..."
                : mode === "strict"
                  ? "切到补全"
                  : "切到严格"
            }}
          </button>
        </view>
      </view>

      <view v-if="ingredientItems.length > 0" class="mt-6 space-y-3">
        <text class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#ff9d0a]">
          食材
        </text>
        <view class="flex flex-wrap gap-2">
          <view
            v-for="item in ingredientItems"
            :key="`${item.name}-${item.quantity}-${item.unit}`"
            class="rounded-full border px-3 py-1.5 text-[11px] font-bold"
            :class="
              item.inFridge
                ? 'border-[#4CAF50]/20 bg-[#4CAF50]/10 text-[#4CAF50]'
                : 'border-[#ff5252]/20 bg-[#ff5252]/10 text-[#ff5252]'
            "
          >
            {{ item.name }} {{ item.quantity }}{{ item.unit }}
            <text v-if="!item.inFridge"> (缺少)</text>
          </view>
        </view>
      </view>

      <view v-if="seasoningItems.length > 0" class="mt-6 space-y-3">
        <text class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#ff9d0a]">
          调料
        </text>
        <view class="flex flex-wrap gap-2">
          <view
            v-for="item in seasoningItems"
            :key="`${item.name}-${item.quantity}-${item.unit}`"
            class="rounded-full border px-3 py-1.5 text-[11px] font-bold"
            :class="
              item.inFridge
                ? 'border-[#4CAF50]/20 bg-[#4CAF50]/10 text-[#4CAF50]'
                : 'border-[#ff5252]/20 bg-[#ff5252]/10 text-[#ff5252]'
            "
          >
            {{ item.name }} {{ item.quantity }}{{ item.unit }}
            <text v-if="!item.inFridge"> (缺少)</text>
          </view>
        </view>
      </view>

      <view class="mt-6 space-y-4">
        <view class="flex items-center justify-between">
          <text class="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff9d0a]">
            步骤预览
          </text>
          <text class="text-xs text-slate-400">
            共 {{ recipe.steps?.length || 0 }} 步
          </text>
        </view>
        <view class="space-y-4">
          <view
            v-for="(step, index) in displayedSteps"
            :key="`${recipe.id}-step-${index}`"
            class="flex gap-4"
          >
            <text class="min-w-[34px] text-[26px] italic leading-none text-[#ff9d0a]/45 text-notoserifsc">
              {{ String(index + 1).padStart(2, "0") }}
            </text>
            <view class="min-w-0 flex-1">
              <text class="block text-[13px] font-medium leading-7 text-slate-700">
                {{ step.instruction }}
              </text>
              <view class="mt-2 flex flex-wrap items-center gap-2">
                <text class="block text-xs text-slate-400">
                  预计 {{ step.duration_min || 3 }} 分钟
                </text>
                <text
                  v-if="step.estimated"
                  class="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-semibold text-[#4c68a7]"
                >
                  AI补全
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="mt-8 flex flex-col gap-3">
        <button
          class="m-0 w-full rounded-[28rpx] border-none bg-[#ff9d0a] px-4 py-4 text-sm font-semibold tracking-[0.04em] text-white shadow-[0_18px_28px_-18px_rgba(255,157,10,0.9)] transition-all duration-300 after:hidden active:translate-y-[1px] active:scale-[0.985]"
          @click="$emit('view-steps')"
        >
          查看完整步骤
        </button>
        <button
          class="m-0 w-full rounded-[28rpx] border-2 border-[#f0c387] bg-white px-4 py-4 text-sm font-semibold tracking-[0.04em] text-[#b45309] transition-colors after:hidden disabled:opacity-60 active:bg-[#fff7eb]"
          :disabled="shoppingLoading"
          @click="$emit('generate-shopping')"
        >
          {{ shoppingLoading ? "识别分类中..." : "生成购物清单" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { resolveMediaUrl } from "@/utils/media";
import type {
  Recipe,
  VideoRecipeClassifiedIngredient,
  VideoRecipeMode,
} from "@/types/recipe";

const props = defineProps<{
  recipe: Recipe;
  ingredients: VideoRecipeClassifiedIngredient[];
  shoppingLoading: boolean;
  mode: VideoRecipeMode;
  regenerating: boolean;
}>();

defineEmits<{
  "view-steps": [];
  "generate-shopping": [];
  "toggle-mode": [mode: VideoRecipeMode];
}>();

const displayedIngredients = computed(() =>
  props.ingredients.slice(0, 8),
);

const displayedSteps = computed(() => props.recipe.steps.slice(0, 2));
const ingredientItems = computed(() =>
  displayedIngredients.value.filter((item) => item.type === "ingredient"),
);
const seasoningItems = computed(() =>
  displayedIngredients.value.filter((item) => item.type === "seasoning"),
);
const resolvedCoverUrl = computed(() => resolveMediaUrl(props.recipe.cover_url));

const displayTitle = computed(() => {
  const title = String(props.recipe.title || "").trim();

  if (!title) {
    return "视频解析食谱";
  }

  if (/�/.test(title)) {
    return "视频解析食谱";
  }

  const compact = title.replace(/\s+/g, "");
  const asciiHeavy =
    compact.length > 0
      ? ((compact.match(/[A-Za-z0-9]/g)?.length || 0) / compact.length) >= 0.75
      : false;
  const digitHeavy =
    compact.length > 0
      ? ((compact.match(/\d/g)?.length || 0) / compact.length) >= 0.5
      : false;
  const hasChinese = /[\u4e00-\u9fff]/.test(title);

  if ((asciiHeavy || digitHeavy) && !hasChinese) {
    return "视频解析食谱";
  }

  if (/^wx(file|_camera)|^tmp|^temp|^video/i.test(title)) {
    return "视频解析食谱";
  }

  return title;
});
</script>
