<template>
  <view class="mt-6 rounded-[24rpx] bg-white px-4 py-4 shadow-soft">
    <view class="flex items-center justify-between gap-3">
      <view>
        <text class="block text-sm font-bold text-slate-900">快速添加</text>
        <text class="mt-1 block text-xs text-text-muted">
          当前分类：{{ currentCategoryLabel }}
        </text>
      </view>
      <view
        class="rounded-full bg-primary/10 px-3 py-2 text-primary"
        @click="$emit('open-category')"
      >
        <text class="text-xs font-bold">切换分类</text>
      </view>
    </view>

    <view class="mt-4 flex items-center gap-2">
      <CmInput
        :model-value="modelValue"
        dark
        placeholder="添加待买食材..."
        custom-class="flex-1"
        input-class="border-transparent bg-[#f8f5ef] pr-4 shadow-none"
        @update:model-value="$emit('update:modelValue', String($event))"
        @keyup.enter="$emit('add')"
      />
      <view
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_20px_-10px_rgba(255,157,10,0.75)] cursor-pointer active:scale-95 transition-transform"
        @click="$emit('add')"
      >
        <text class="material-symbols-outlined text-2xl">add</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import CmInput from "@/components/CmInput/CmInput.vue";

defineProps<{
  modelValue: string;
  currentCategoryLabel: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
  "open-category": [];
  add: [];
}>();
</script>
