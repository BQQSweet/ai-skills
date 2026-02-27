<template>
  <view
    class="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#ffcc00] shadow-[0_0_20px_rgba(255,159,10,0.4)] p-4 flex items-center justify-between group active:scale-[0.98] transition-transform"
    @click="handleGenerate"
  >
    <view
      class="absolute inset-0 opacity-30"
      style="
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        background-size: 200% 100%;
      "
    ></view>
    <view class="flex items-center gap-3 relative z-10">
      <view
        class="bg-white/20 p-2 rounded-xl backdrop-blur-md flex items-center justify-center"
      >
        <text
          class="material-symbols-outlined text-white text-2xl"
          :style="{ fontVariationSettings: '\'FILL\' 1' }"
          >magic_button</text
        >
      </view>
      <view>
        <text class="block text-white font-bold text-base leading-tight"
          >AI 灵感食谱</text
        >
        <text class="block text-white/80 text-xs mt-0.5">用现有食材做道菜</text>
      </view>
    </view>
    <text class="material-symbols-outlined text-white relative z-10"
      >chevron_right</text
    >
  </view>
  <up-toast ref="uToastRef"></up-toast>
</template>

<script setup lang="ts">
import { ref } from "vue";

const uToastRef = ref();

const handleGenerate = () => {
  uToastRef.value?.show({
    type: "success",
    message: "正在召唤 AI...",
  });
};
</script>
