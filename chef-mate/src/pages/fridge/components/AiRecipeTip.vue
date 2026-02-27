<template>
  <view
    class="bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-2xl p-4 flex gap-3 items-start mb-8"
  >
    <text
      class="material-symbols-outlined text-[#8B5CF6] text-[20px] mt-0.5"
      :style="{ fontVariationSettings: '\'FILL\' 1' }"
      >info</text
    >
    <view class="text-xs text-[#8B5CF6]/90 leading-relaxed flex-1">
      <text class="font-bold">AI 建议：</text>
      <text
        >这个食谱非常适合使用“语音模式”进行。您可以边做边问我如何控制油温，或者询问食材替代方案。</text
      >
    </view>
  </view>
</template>

<script setup lang="ts"></script>
