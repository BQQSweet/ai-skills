<template>
  <view
    class="sticky top-0 z-20 flex items-center justify-between bg-[#fafaf8]/80 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+16px)] backdrop-blur-[18px]"
  >
    <view class="flex min-w-0 items-center gap-3">
      <button
        class="m-0 flex h-11 w-11 items-center justify-center rounded-full border-none bg-white/75 text-[#c46f18] shadow-[0_14px_28px_-18px_rgba(15,23,42,0.2)] backdrop-blur after:hidden active:scale-95"
        @click="$emit('back')"
      >
        <text class="material-symbols-outlined text-[22px]">arrow_back</text>
      </button>
      <view class="min-w-0">
        <text class="block text-[22px] italic leading-none text-slate-900 text-notoserifsc">
          视频解析食谱
        </text>
        <text class="mt-1 block text-[11px] font-semibold uppercase tracking-[0.26em] text-[#c46f18]/80">
          ChefMate Lab
        </text>
      </view>
    </view>

    <view class="w-11"></view>
  </view>
</template>

<script setup lang="ts">
defineEmits<{
  back: [];
}>();
</script>
