<template>
  <view
    class="w-full bg-white dark:bg-surface-dark rounded-xl p-6 flex flex-col items-center text-center shadow-2xl shadow-primary/10 relative overflow-hidden shrink-0 mt-4 h-[40vh]"
  >
    <!-- Scrollable Instruction Text -->
    <view class="flex-1 w-full overflow-y-auto flex items-center justify-center mb-4">
      <text
        class="text-[#1a1a1a] dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-tight"
      >
        步骤 {{ stepNumber }}：{{ instruction }}
      </text>
    </view>

    <!-- Voice Feedback Icon -->
    <view
      class="flex items-center gap-4 bg-primary/10 px-6 py-3 rounded-full transition-opacity shrink-0"
      :class="isVoicePlaying ? 'opacity-100' : 'opacity-50'"
    >
      <view
        class="voice-wave h-6"
        :class="{ 'is-playing': isVoicePlaying }"
      >
        <view class="wave-bar h-3"></view>
        <view class="wave-bar h-5"></view>
        <view class="wave-bar h-4"></view>
        <view class="wave-bar h-6"></view>
        <view class="wave-bar h-3"></view>
      </view>
      <text class="text-primary font-bold text-lg">
        {{ isVoicePlaying ? "正在为您朗读..." : "语音助手就绪" }}
      </text>
    </view>

    <!-- Subtle Decorative Element -->
    <view
      class="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"
    ></view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  stepNumber: number;
  instruction: string;
  isVoicePlaying: boolean;
}>();
</script>

<style scoped>
.voice-wave {
  display: flex;
  align-items: center;
  gap: 3px;
}
.wave-bar {
  width: 3px;
  background-color: theme('colors.primary.DEFAULT');
  border-radius: 99px;
  animation: pulse 1.5s infinite ease-in-out alternate;
}
.wave-bar:nth-child(1) {
  animation-delay: 0.1s;
}
.wave-bar:nth-child(2) {
  animation-delay: 0.3s;
}
.wave-bar:nth-child(3) {
  animation-delay: 0s;
}
.wave-bar:nth-child(4) {
  animation-delay: 0.4s;
}
.wave-bar:nth-child(5) {
  animation-delay: 0.2s;
}

@keyframes pulse {
  0% {
    transform: scaleY(0.5);
  }
  100% {
    transform: scaleY(1.5);
  }
}
</style>
