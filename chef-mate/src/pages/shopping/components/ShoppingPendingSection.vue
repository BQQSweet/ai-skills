<template>
  <view class="mt-6">
    <view class="mb-4 flex items-center justify-between gap-3">
      <view class="flex items-center gap-2">
        <text class="text-xl font-black text-slate-900">待买清单</text>
        <view class="rounded-full bg-primary/10 px-2.5 py-1">
          <text class="text-xs font-bold text-primary">{{ items.length }}</text>
        </view>
      </view>
      <text class="text-xs text-text-muted">{{ description }}</text>
    </view>

    <view
      v-if="loading && totalCount === 0"
      class="flex items-center justify-center py-20"
    >
      <text class="text-text-muted">加载中...</text>
    </view>

    <view
      v-else-if="totalCount === 0"
      class="rounded-[24rpx] bg-white px-6 py-14 text-center shadow-soft"
    >
      <text class="material-symbols-outlined text-5xl text-slate-300">shopping_cart</text>
      <text class="mt-4 block text-base font-bold text-slate-900">购物清单还是空的</text>
      <text class="mt-2 block text-sm text-text-muted">
        添加一些本周要买的食材，让家人一起认领采购任务
      </text>
    </view>

    <view
      v-else-if="items.length === 0"
      class="rounded-[24rpx] bg-white px-6 py-12 text-center shadow-soft"
    >
      <text class="material-symbols-outlined text-5xl text-primary/35">task_alt</text>
      <text class="mt-4 block text-base font-bold text-slate-900">
        当前待买食材已全部处理
      </text>
      <text class="mt-2 block text-sm text-text-muted">
        {{ completedCount > 0 ? "下面还能查看已完成与库存命中的记录" : "继续添加新的采购项吧" }}
      </text>
    </view>

    <view v-else class="space-y-3">
      <ShoppingItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :can-assign="canAssign"
        :current-user-id="currentUserId"
        :is-transitioning-to-completed="Boolean(transitioningMap[item.id])"
        @toggle="$emit('toggle', $event)"
        @claim="$emit('claim', $event)"
        @assign="$emit('assign', $event)"
        @delete="$emit('delete', $event)"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ShoppingItem as ShoppingListItem } from "@/types/shopping";
import ShoppingItem from "./ShoppingItem.vue";

defineProps<{
  loading: boolean;
  totalCount: number;
  items: ShoppingListItem[];
  completedCount: number;
  description: string;
  canAssign: boolean;
  currentUserId: string;
  transitioningMap: Record<string, boolean>;
}>();

defineEmits<{
  toggle: [itemId: string];
  claim: [itemId: string];
  assign: [item: ShoppingListItem];
  delete: [itemId: string];
}>();
</script>
