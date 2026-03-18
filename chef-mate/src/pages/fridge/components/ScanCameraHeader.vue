<template>
  <view
    class="absolute top-0 left-0 right-0 z-20 px-5 pt-14 pb-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent"
  >
    <view class="text-white active:opacity-70" @click="$emit('close')">
      <text class="material-symbols-outlined text-[28px]">arrow_back</text>
    </view>
    <text class="text-white font-bold text-lg">扫描食材标签</text>
    <view class="w-7"></view>
  </view>
</template>

<script setup lang="ts">
defineEmits<{
  close: [];
}>();
</script>
