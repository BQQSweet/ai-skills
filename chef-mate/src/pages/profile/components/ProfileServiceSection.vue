<template>
  <view class="px-6 pt-4">
    <text
      class="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4 block"
    >
      更多服务
    </text>
    <view class="flex flex-col gap-2">
      <view
        v-for="item in items"
        :key="item.key"
        class="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800"
        @click="$emit('select', item.key)"
      >
        <view class="flex items-center gap-3">
          <text class="material-symbols-outlined text-slate-400">
            {{ item.icon }}
          </text>
          <text class="text-slate-700 dark:text-slate-200 font-medium">
            {{ item.title }}
          </text>
        </view>
        <text class="material-symbols-outlined text-slate-300 text-sm">
          chevron_right
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  items: readonly {
    key: string;
    title: string;
    icon: string;
  }[];
}>();

defineEmits<{
  select: [key: string];
}>();
</script>
