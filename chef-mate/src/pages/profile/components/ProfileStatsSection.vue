<template>
  <view class="flex gap-3 px-6 py-2">
    <view
      v-for="item in items"
      :key="item.label"
      class="flex flex-1 flex-col gap-1 rounded-2xl bg-white dark:bg-slate-800/50 p-4 items-center text-center shadow-sm border border-slate-100 dark:border-slate-700"
    >
      <text class="text-slate-900 dark:text-slate-100 text-2xl font-bold">
        {{ item.value }}
      </text>
      <text class="text-slate-500 dark:text-slate-400 text-xs font-medium">
        {{ item.label }}
      </text>
      <text class="text-slate-400 text-[10px]">{{ item.helper }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  items: readonly {
    value: string;
    label: string;
    helper: string;
  }[];
}>();
</script>
