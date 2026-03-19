<template>
  <CmBottomSheet
    :show="show"
    :close-on-click-overlay="true"
    :drag-to-close="true"
    :show-drag-handle="true"
    :safe-area-inset-bottom="true"
    panel-class="shopping-list-switcher-sheet bg-[#fcfaf8] dark:bg-[#2d2418]"
    @update:show="emit('update:show', $event)"
  >
    <template #header>
      <view class="px-6 pt-4">
        <view
          class="flex items-center justify-between gap-4 border-b border-black/5 pb-5 dark:border-white/10"
        >
          <view class="min-w-0 flex-1">
            <view class="flex items-center gap-2 text-primary">
              <text class="material-symbols-outlined text-[22px]">restaurant_menu</text>
              <text class="text-sm font-bold tracking-[0.24em] text-primary/80">
                SWITCH LIST
              </text>
            </view>
            <text class="mt-3 block text-[22px] font-black leading-tight text-[#1d160c] dark:text-white">
              切换采购清单
            </text>
            <text class="mt-2 block text-sm font-medium text-[#a17c45] dark:text-orange-200/70">
              快速切换当前家庭组里的采购清单
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

    <scroll-view scroll-y class="max-h-[60vh] px-6 py-5">
      <view class="flex flex-col gap-3 pb-2">
        <view
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-4 rounded-[28rpx] border px-4 py-4 transition-all"
          :class="
            item.isActive
              ? 'border-primary/25 bg-primary/5 shadow-[0_16px_36px_-24px_rgba(255,157,10,0.6)]'
              : 'border-transparent bg-white shadow-soft dark:bg-white/5'
          "
          @click="emit('select', item.id)"
        >
          <view class="min-w-0 flex-1">
            <view class="flex items-center gap-2">
              <text class="truncate text-[16px] font-black text-[#1d160c] dark:text-white">
                {{ item.title }}
              </text>
              <CmTag
                :tone="item.sourceTone"
                :variant="item.isActive ? 'solid' : 'soft'"
                size="xs"
              >
                {{ item.sourceLabel }}
              </CmTag>
            </view>
            <text class="mt-2 block text-sm font-medium text-[#a17c45] dark:text-orange-200/70">
              {{ item.statusLabel }}
            </text>
          </view>

          <view
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
            :class="
              item.isActive
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 text-slate-300 dark:border-white/10 dark:text-white/20'
            "
          >
            <text class="material-symbols-outlined text-[18px]">check</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </CmBottomSheet>
</template>

<script setup lang="ts">
import CmBottomSheet from "@/components/CmBottomSheet/CmBottomSheet.vue";
import CmTag from "@/components/CmTag/CmTag.vue";

export interface ShoppingListSwitcherItem {
  id: string;
  title: string;
  sourceLabel: string;
  sourceTone: "primary" | "neutral";
  statusLabel: string;
  isActive: boolean;
}

defineProps<{
  show: boolean;
  items: ShoppingListSwitcherItem[];
}>();

const emit = defineEmits<{
  "update:show": [value: boolean];
  select: [listId: string];
}>();
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 10px 30px -22px rgba(29, 22, 12, 0.2);
}
</style>
