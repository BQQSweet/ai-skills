<template>
  <view
    class="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800"
  >
    <view
      class="flex items-center justify-between px-4 h-11 pb-safe-top mt-safe-top"
    >
      <view
        class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 flex items-center justify-center h-10 w-10"
        @click="$emit('back')"
      >
        <text
          class="material-symbols-outlined text-slate-700 dark:text-slate-300 text-[24px] font-normal"
          >arrow_back</text
        >
      </view>
      <text
        class="text-lg font-bold text-slate-800 dark:text-white font-display tracking-wide"
        >AI 灵感食谱</text
      >
      <view
        class="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative flex items-center justify-center h-10 w-10"
      >
        <text
          class="material-symbols-outlined text-slate-700 dark:text-slate-300 text-[24px] font-normal"
          >history</text
        >
        <view
          class="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(255,157,10,0.8)]"
        ></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineEmits<{
  (e: "back"): void;
}>();
</script>
