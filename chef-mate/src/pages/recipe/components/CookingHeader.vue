<template>
  <view
    class="flex items-center justify-between p-6 pt-[calc(env(safe-area-inset-top)+20px)] w-full box-border z-20"
  >
    <view
      @click="$emit('exit')"
      class="flex items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer"
    >
      <text class="material-symbols-outlined text-2xl">close</text>
      <text class="text-lg font-medium">退出</text>
    </view>

    <view class="flex flex-col items-center gap-2">
      <text class="text-primary text-xl font-bold tracking-widest"
        >{{ currentStep }} / {{ totalSteps }}</text
      >
      <view class="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <view
          class="h-full bg-primary rounded-full transition-all duration-300"
          :style="{ width: progressPercent + '%' }"
        ></view>
      </view>
    </view>

    <view
      @click="$emit('prev')"
      class="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors cursor-pointer opacity-0"
      :class="{ 'opacity-100': canGoPrev }"
    >
      <text class="material-symbols-outlined text-2xl">chevron_left</text>
      <text class="text-lg font-bold">上一步</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  canGoPrev: boolean;
}>();

defineEmits<{
  exit: [];
  prev: [];
}>();
</script>
