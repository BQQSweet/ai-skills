<template>
  <view
    class="fixed bottom-0 left-0 right-0 px-6 pb-safe pt-4 flex justify-center z-50 pointer-events-none"
  >
    <view
      class="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent -z-10 h-32 bottom-0"
    ></view>
    <button
      @click="$emit('start')"
      class="bg-primary text-white w-full max-w-sm h-14 rounded-full shadow-[0_10px_20px_-5px_rgba(255,159,10,0.4)] flex items-center justify-center gap-3 active:scale-[0.98] transition-transform m-0 after:hidden pointer-events-auto border-none mb-6 relative overflow-hidden"
    >
      <!-- Shine effect -->
      <view
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"
      ></view>

      <view
        class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm relative z-10"
      >
        <text
          class="material-symbols-outlined text-[20px]"
          :style="{ fontVariationSettings: '\'FILL\' 1' }"
          >mic</text
        >
      </view>
      <text class="text-[17px] font-bold relative z-10"
        >开始烹饪 (语音模式)</text
      >
      <text
        class="material-symbols-outlined text-[18px] ml-1 opacity-60 relative z-10"
        >arrow_forward_ios</text
      >
    </button>
  </view>
</template>

<script setup lang="ts">
defineEmits<{
  (e: "start"): void;
}>();
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
