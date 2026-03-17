<template>
  <view v-if="items.length > 0" class="mt-8">
    <view
      class="flex cursor-pointer items-center justify-between gap-4"
      @click="$emit('toggle-show')"
    >
      <view class="flex items-center gap-2 text-slate-500">
        <text
          class="material-symbols-outlined transition-transform duration-300"
          :class="{ 'rotate-90': show }"
        >
          arrow_right
        </text>
        <text class="text-base font-semibold">已完成 / 冰箱已有 ({{ items.length }})</text>
      </view>
    </view>

    <view v-if="show" class="mt-4 rounded-[24rpx] bg-white/80 px-3 py-2 shadow-soft">
      <view
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-4 py-3"
        :class="{
          'border-b border-dashed border-slate-200':
            item.id !== items[items.length - 1]?.id,
        }"
      >
        <view
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all"
          :class="
            item.hasInFridge && item.status !== 'purchased'
              ? 'bg-amber-100 text-amber-600'
              : restoringMap[item.id]
                ? 'bg-primary/75 text-white opacity-80'
                : 'bg-primary text-white shadow-[0_6px_12px_-8px_rgba(255,157,10,0.85)]'
          "
          :style="{
            cursor:
              item.status === 'purchased' && !item.hasInFridge ? 'pointer' : 'default',
          }"
          @click.stop="$emit('restore', item)"
        >
          <text class="material-symbols-outlined text-[14px]">
            {{ item.hasInFridge && item.status !== "purchased" ? "inventory_2" : "check" }}
          </text>
        </view>
        <view class="min-w-0 flex-1">
          <text
            class="block text-sm font-medium text-slate-500"
            :class="{ 'line-through decoration-slate-400': item.status === 'purchased' }"
          >
            {{ item.name }}
          </text>
          <text class="mt-1 block text-xs text-slate-400">
            {{ item.quantity }}{{ item.unit }} · {{ completedMeta(item) }}
          </text>
        </view>
        <view
          class="rounded-full px-2 py-1 text-[10px] font-bold"
          :class="
            item.hasInFridge && item.status !== 'purchased'
              ? 'bg-amber-50 text-amber-600'
              : 'bg-slate-100 text-slate-500'
          "
        >
          {{
            item.hasInFridge && item.status !== "purchased"
              ? "库存"
              : item.purchasedByName || "完成"
          }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ShoppingItem } from "@/types/shopping";
import { getCompletedMeta } from "../constants/shopping";

defineProps<{
  items: ShoppingItem[];
  show: boolean;
  restoringMap: Record<string, boolean>;
}>();

defineEmits<{
  "toggle-show": [];
  restore: [item: ShoppingItem];
}>();

const completedMeta = getCompletedMeta;
</script>
