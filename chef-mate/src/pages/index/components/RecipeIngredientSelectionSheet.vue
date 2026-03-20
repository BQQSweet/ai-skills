<template>
  <CmBottomSheet
    :show="show"
    max-height="80vh"
    scrollable-body
    body-class="px-6 py-5"
    :close-on-click-overlay="true"
    :drag-to-close="true"
    :show-drag-handle="true"
    :safe-area-inset-bottom="true"
    panel-class="recipe-ingredient-selection-sheet bg-[#fcfaf8] dark:bg-[#2d2418]"
    @update:show="emit('update:show', $event)"
    @close="emit('close')"
  >
    <template #header>
      <view class="shrink-0 px-6 pt-4">
        <view
          class="flex items-center justify-between gap-4 border-b border-black/5 pb-5 dark:border-white/10"
        >
          <view class="min-w-0 flex-1">
            <view class="flex items-center gap-2 text-primary">
              <text class="material-symbols-outlined text-[22px]">shopping_basket</text>
              <text class="text-sm font-bold tracking-[0.24em] text-primary/80">
                SELECT INGREDIENTS
              </text>
            </view>
            <text class="mt-3 block text-[22px] font-black leading-tight text-[#1d160c] dark:text-white">
              {{ recipeTitle || "选择要加入的原料" }}
            </text>
            <text class="mt-2 block text-sm font-medium text-[#a17c45] dark:text-orange-200/70">
              食材默认加入采购清单，调料按需勾选即可
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

    <view class="flex flex-col gap-6 pb-2">
      <view v-if="ingredientItems.length > 0" class="flex flex-col gap-3">
        <view class="flex items-center justify-between">
          <text class="text-base font-black text-[#1d160c] dark:text-white">
            食材
          </text>
          <text class="text-xs font-semibold text-primary/80">
            默认已选
          </text>
        </view>
        <view class="flex flex-col gap-3">
          <view
            v-for="item in ingredientItems"
            :key="item.key"
            class="flex items-center gap-4 rounded-[28rpx] border border-[#f0e4d4] bg-[#fffaf2] px-4 py-4 shadow-[0_12px_28px_-24px_rgba(109,76,44,0.2)]"
            @click="emit('toggle', item.key)"
          >
            <view
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all"
              :class="
                isSelected(item.key)
                  ? 'border-primary bg-primary text-white'
                  : 'border-[#dbcab4] bg-white text-transparent'
              "
            >
              <text class="material-symbols-outlined text-[16px]">check</text>
            </view>
            <view class="min-w-0 flex-1">
              <text class="block truncate text-[16px] font-black text-[#1d160c] dark:text-white">
                {{ item.name }}
              </text>
              <text class="mt-1 block text-sm font-medium text-[#8b6b44] dark:text-orange-200/70">
                {{ item.quantity }}{{ item.unit }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="seasoningItems.length > 0" class="flex flex-col gap-3">
        <view class="flex items-center justify-between">
          <text class="text-base font-black text-[#1d160c] dark:text-white">
            调料
          </text>
          <text class="text-xs font-semibold text-slate-400">
            按需勾选
          </text>
        </view>
        <view class="flex flex-col gap-3">
          <view
            v-for="item in seasoningItems"
            :key="item.key"
            class="flex items-center gap-4 rounded-[28rpx] border border-[#efe4d3] bg-[#f7f2ea] px-4 py-4 shadow-[0_10px_24px_-20px_rgba(109,76,44,0.18)]"
            @click="emit('toggle', item.key)"
          >
            <view
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all"
              :class="
                isSelected(item.key)
                  ? 'border-primary bg-primary text-white'
                  : 'border-[#dbcab4] bg-white text-transparent'
              "
            >
              <text class="material-symbols-outlined text-[16px]">check</text>
            </view>
            <view class="min-w-0 flex-1">
              <text class="block truncate text-[16px] font-black text-[#1d160c] dark:text-white">
                {{ item.name }}
              </text>
              <text class="mt-1 block text-sm font-medium text-[#8b6b44] dark:text-orange-200/70">
                {{ item.quantity }}{{ item.unit }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <template #footer>
      <view
        class="grid grid-cols-2 gap-3 border-t border-black/5 bg-[#fcfaf8]/96 px-6 pb-6 pt-4 backdrop-blur-sm dark:border-white/10 dark:bg-[#2d2418]/96"
      >
        <button
          class="m-0 flex h-12 items-center justify-center rounded-2xl border border-primary/25 bg-transparent text-sm font-bold text-primary after:hidden active:scale-[0.98] disabled:opacity-60"
          :disabled="confirming"
          @click="emit('update:show', false)"
        >
          <text>取消</text>
        </button>
        <button
          class="m-0 flex h-12 items-center justify-center gap-2 rounded-2xl border-none bg-primary text-sm font-bold text-white shadow-[0_12px_28px_-16px_rgba(255,157,10,0.72)] after:hidden active:scale-[0.98] disabled:opacity-60"
          :disabled="confirming"
          @click="emit('confirm')"
        >
          <text class="material-symbols-outlined text-[18px]">playlist_add</text>
          <text>{{ confirming ? "加入中..." : "加入采购清单" }}</text>
        </button>
      </view>
    </template>
  </CmBottomSheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CmBottomSheet from "@/components/CmBottomSheet/CmBottomSheet.vue";
import type { ClassifiedRecipeIngredient } from "@/types/shopping";

type SelectableClassifiedRecipeIngredient = ClassifiedRecipeIngredient & {
  key: string;
};

const props = defineProps<{
  show: boolean;
  recipeTitle: string;
  items: SelectableClassifiedRecipeIngredient[];
  selectedKeys: string[];
  confirming: boolean;
}>();

const emit = defineEmits<{
  "update:show": [value: boolean];
  close: [];
  toggle: [key: string];
  confirm: [];
}>();

const ingredientItems = computed(() =>
  props.items.filter((item) => item.type === "ingredient"),
);
const seasoningItems = computed(() =>
  props.items.filter((item) => item.type === "seasoning"),
);

function isSelected(key: string) {
  return props.selectedKeys.includes(key);
}
</script>
