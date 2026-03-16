<template>
  <view
    class="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-soft border border-slate-50 dark:border-gray-800 flex items-start gap-4"
    :class="{ 'opacity-60': item.status === 'purchased' }"
  >
    <!-- Checkbox -->
    <view class="mt-1">
      <view
        @click="$emit('toggle', item.id)"
        class="w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all"
        :class="
          item.status === 'purchased'
            ? 'border-primary'
            : 'border-slate-200 dark:border-gray-600'
        "
      >
        <text
          v-if="item.status === 'purchased'"
          class="material-symbols-outlined text-primary text-lg"
          >check_circle</text
        >
      </view>
    </view>

    <!-- Content -->
    <view class="flex-1">
      <view class="flex items-center justify-between">
        <text
          class="font-bold text-text-main dark:text-white"
          :class="{ 'line-through': item.status === 'purchased' }"
        >
          {{ item.name }}
        </text>

        <!-- Status Badge -->
        <view
          v-if="item.status === 'purchased' && item.purchasedByName"
          class="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg"
        >
          <image
            v-if="item.purchasedBy"
            class="w-4 h-4 rounded-full object-cover"
            src="https://via.placeholder.com/32"
            mode="aspectFill"
          />
          <text
            class="text-[10px] text-green-600 dark:text-green-400 font-bold"
            >已买到</text
          >
        </view>
        <view
          v-else-if="item.status === 'pending'"
          class="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg"
        >
          <text class="text-[10px] text-primary font-bold">待认领</text>
        </view>
      </view>

      <text class="text-sm text-text-sub dark:text-text-muted mt-0.5">
        {{ item.quantity }}{{ item.unit }} · {{ categoryLabel[item.category] }}
      </text>
    </view>

    <!-- Delete Button -->
    <view
      @click="$emit('delete', item.id)"
      class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
    >
      <text class="material-symbols-outlined text-red-500 text-lg"
        >delete</text
      >
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ShoppingItem, ShoppingCategory } from "@/types/shopping";

defineProps<{
  item: ShoppingItem;
}>();

defineEmits<{
  toggle: [itemId: string];
  edit: [item: ShoppingItem];
  delete: [itemId: string];
}>();

const categoryLabel: Record<ShoppingCategory, string> = {
  vegetable: "蔬菜",
  meat: "肉类",
  seafood: "海鲜",
  fruit: "水果",
  seasoning: "调料",
  dairy: "乳制品",
  grain: "粮油",
  snack: "零食",
  beverage: "饮料",
  other: "其他",
};
</script>
