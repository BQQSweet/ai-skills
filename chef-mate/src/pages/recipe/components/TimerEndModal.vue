<template>
  <view
    v-if="show"
    class="absolute inset-0 z-50 flex flex-col px-6 pb-12 pt-16"
    style="background: radial-gradient(circle at center, #FF9F0A 0%, #0a0a0a 100%)"
  >
    <!-- Header -->
    <view class="flex justify-center mb-8">
      <view class="flex flex-col items-center gap-2">
        <text class="text-white/80 text-lg font-bold tracking-widest uppercase">
          第{{ currentStep }}步完成
        </text>
        <view class="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
          <view
            class="h-full bg-white rounded-full transition-all duration-300"
            :style="{ width: progressPercent + '%' }"
          ></view>
        </view>
      </view>
    </view>

    <!-- Main Content -->
    <view class="flex-1 flex flex-col items-center justify-center text-center">
      <view class="mb-12">
        <text class="text-6xl font-black text-white">
          🎉 时间到！
        </text>
      </view>

      <view class="w-full bg-white rounded-3xl p-8 shadow-2xl mb-12 transform scale-105">
        <text class="text-gray-500 text-sm font-bold tracking-widest mb-2 uppercase">
          立即执行
        </text>
        <text class="text-background-dark text-4xl font-black leading-tight block mt-2">
          {{ instruction }}
        </text>
        <view class="mt-6 flex justify-center">
          <text class="material-symbols-outlined text-primary text-5xl animate-bounce">
            soup_kitchen
          </text>
        </view>
      </view>
    </view>

    <!-- Footer Actions -->
    <view class="mt-auto">
      <view
        @click="$emit('next')"
        class="w-full bg-primary text-background-dark text-2xl font-black py-7 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer animate-pulse"
      >
        <text>下一步</text>
        <text class="material-symbols-outlined text-3xl font-bold">arrow_forward</text>
      </view>
      <view
        @click="$emit('delay')"
        class="w-full mt-6 text-white/60 font-bold text-lg text-center cursor-pointer"
      >
        延时 1 分钟
      </view>
    </view>

    <!-- Floating Particles -->
    <view class="absolute inset-0 pointer-events-none overflow-hidden">
      <view class="absolute w-3 h-3 bg-white rounded-sm opacity-60 animate-bounce" style="top: 15%; left: 10%;"></view>
      <view class="absolute w-4 h-4 bg-primary rounded-sm opacity-60 animate-bounce" style="top: 25%; right: 15%; animation-delay: 1s;"></view>
      <view class="absolute w-2 h-2 bg-white rounded-sm opacity-60 animate-bounce" style="bottom: 30%; left: 20%; animation-delay: 2s;"></view>
      <view class="absolute w-5 h-5 border-2 border-primary bg-transparent rounded-sm opacity-60 animate-bounce" style="top: 50%; right: 10%; animation-delay: 1.5s;"></view>
      <view class="absolute w-3 h-3 bg-white rounded-full opacity-60 animate-bounce" style="bottom: 15%; right: 25%; animation-delay: 0.5s;"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  currentStep: number;
  progressPercent: number;
  instruction: string;
}>();

defineEmits<{
  next: [];
  delay: [];
}>();
</script>
