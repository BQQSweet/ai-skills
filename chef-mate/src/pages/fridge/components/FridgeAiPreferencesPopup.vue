<template>
  <up-popup
    v-model:show="show"
    mode="bottom"
    round="24"
    :closeable="true"
  >
    <view class="p-5 pb-safe w-full bg-white dark:bg-surface-dark">
      <view class="text-center mb-6 mt-2">
        <text class="text-lg font-bold text-slate-800 dark:text-white">
          定制专属灵感
        </text>
      </view>

      <view class="mb-5">
        <view class="flex justify-between items-center mb-3">
          <text class="text-sm font-bold text-slate-700 dark:text-slate-200">
            用餐场景
          </text>
          <text class="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
            自动匹配当前时间
          </text>
        </view>
        <view class="flex flex-wrap gap-2">
          <view
            v-for="meal in mealOptions"
            :key="meal"
            @click="$emit('update:mealType', meal)"
            class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
            :class="
              mealType === meal
                ? 'bg-primary text-white border-primary shadow-[0_4px_10px_rgba(255,159,10,0.3)]'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700'
            "
          >
            {{ meal }}
          </view>
        </view>
      </view>

      <view class="mb-5">
        <text
          class="text-sm font-bold block text-slate-700 dark:text-slate-200 mb-3"
        >
          想要什么口味？（可选）
        </text>
        <view class="flex flex-wrap gap-2">
          <view
            v-for="taste in tasteOptions"
            :key="taste"
            @click="$emit('toggle-taste', taste)"
            class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
            :class="
              selectedTaste === taste
                ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-[0_4px_10px_rgba(139,92,246,0.3)]'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700'
            "
          >
            {{ taste }}
          </view>
        </view>
      </view>

      <view class="mb-8">
        <text
          class="text-sm font-bold block text-slate-700 dark:text-slate-200 mb-3"
        >
          用餐人数
        </text>
        <view
          class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl w-max"
        >
          <view
            class="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center active:scale-95 touch-none"
            @click="$emit('decrease-servings')"
          >
            <text
              class="material-symbols-outlined text-slate-600 dark:text-slate-300"
            >
              remove
            </text>
          </view>
          <text class="text-lg font-bold w-12 text-center">{{ servings }} 人</text>
          <view
            class="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center active:scale-95 touch-none"
            @click="$emit('increase-servings')"
          >
            <text
              class="material-symbols-outlined text-slate-600 dark:text-slate-300"
            >
              add
            </text>
          </view>
        </view>
      </view>

      <button
        class="w-full bg-gradient-to-br mb-10 from-primary to-[#ffb340] text-white rounded-2xl h-14 font-bold text-base shadow-[0_4px_15px_rgba(255,159,10,0.25)] flex items-center justify-center gap-2 transform active:scale-[0.98] transition-transform m-0 after:hidden border-none"
        @click="$emit('confirm')"
      >
        <text
          class="material-symbols-outlined text-[20px]"
          :style="{ fontVariationSettings: '\'FILL\' 1' }"
        >
          auto_awesome
        </text>
        开始生成食谱
      </button>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  show: boolean;
  mealOptions: readonly string[];
  tasteOptions: readonly string[];
  mealType: string;
  selectedTaste: string;
  servings: number;
}>();

const emit = defineEmits<{
  "update:show": [value: boolean];
  "update:mealType": [value: string];
  "toggle-taste": [value: string];
  "increase-servings": [];
  "decrease-servings": [];
  confirm: [];
}>();

const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit("update:show", value),
});
</script>
