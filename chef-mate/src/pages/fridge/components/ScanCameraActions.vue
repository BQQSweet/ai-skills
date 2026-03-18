<template>
  <view
    class="absolute bottom-0 left-0 right-0 z-20 pb-safe px-5 bg-gradient-to-t from-black/80 to-transparent"
  >
    <view class="flex items-center justify-center py-8">
      <button
        class="w-[72px] h-[72px] rounded-full bg-white border-4 border-white/30 flex items-center justify-center m-0 p-0 after:hidden active:scale-90 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        :class="isCapturing ? 'opacity-60' : ''"
        :disabled="isCapturing"
        @click="$emit('capture')"
      >
        <view
          v-if="isCapturing"
          class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"
        ></view>
        <text
          v-else
          class="material-symbols-outlined text-primary text-[36px]"
          :style="{ fontVariationSettings: '\'FILL\' 1' }"
        >
          photo_camera
        </text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  isCapturing: boolean;
}>();

defineEmits<{
  capture: [];
}>();
</script>
