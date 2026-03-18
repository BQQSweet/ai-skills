<template>
  <view>
    <view class="flex items-center gap-2 mb-4">
      <text class="material-symbols-outlined text-red-500 text-xl">error</text>
      <text class="text-lg font-bold text-slate-900">过敏源</text>
    </view>
    <view class="flex flex-wrap gap-3">
      <view
        v-for="item in options"
        :key="item"
        @click="$emit('toggle', item)"
        :class="[
          'flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-medium text-sm transition-colors',
          values.includes(item)
            ? 'bg-red-50 border-2 border-red-200 text-red-600'
            : 'bg-white border border-slate-100 text-slate-600 shadow-sm',
        ]"
      >
        <text
          v-if="values.includes(item)"
          class="material-symbols-outlined text-sm"
          >warning</text
        >
        {{ item }}
      </view>
      <view
        @click="$emit('add-custom')"
        class="flex items-center justify-center py-3 px-4 rounded-xl bg-white border border-slate-200 border-dashed text-slate-400 font-medium text-sm active:bg-slate-50"
      >
        + 添加
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  options: readonly string[];
  values: string[];
}>();

defineEmits<{
  toggle: [item: string];
  "add-custom": [];
}>();
</script>
