<template>
  <u-popup :show="show" mode="bottom" :round="24" @close="$emit('update:show', false)">
    <view class="bg-white dark:bg-surface-dark p-6 rounded-t-3xl">
      <text class="block text-lg font-bold text-text-main dark:text-white mb-4">
        选择分类
      </text>
      <view class="grid grid-cols-3 gap-3">
        <view
          v-for="category in categories"
          :key="category"
          class="p-4 rounded-xl text-center cursor-pointer transition-all"
          :class="
            selectedCategory === category
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white'
          "
          @click="$emit('select', category)"
        >
          <text class="material-symbols-outlined text-xl">{{ icons[category] }}</text>
          <text class="mt-2 block font-bold">{{ labels[category] }}</text>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import type { ShoppingCategory } from "@/types/shopping";

defineProps<{
  show: boolean;
  categories: ShoppingCategory[];
  selectedCategory: ShoppingCategory;
  labels: Record<ShoppingCategory, string>;
  icons: Record<ShoppingCategory, string>;
}>();

defineEmits<{
  "update:show": [value: boolean];
  select: [category: ShoppingCategory];
}>();
</script>
