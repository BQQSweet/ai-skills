<template>
  <view
    class="p-6 pb-[calc(env(safe-area-inset-bottom)+20px)] w-full box-border z-20 shrink-0 flex gap-4"
  >
    <view
      class="flex-1 bg-primary hover:bg-primary/90 text-background-dark text-xl font-black py-4 rounded-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
      @click="$emit('next')"
    >
      <text>{{ isLastStep ? "完成烹饪" : "下一步" }}</text>
      <text class="material-symbols-outlined text-2xl font-bold">
        {{ isLastStep ? "done_all" : "arrow_forward" }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  isLastStep: boolean;
}>();

defineEmits<{
  next: [];
}>();
</script>
