<template>
  <view class="px-6 py-2">
    <view
      class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-soft border border-primary/10"
    >
      <view class="flex flex-col items-center">
        <text
          class="text-xs font-semibold text-primary uppercase tracking-widest mb-4"
        >
          您的厨房邀请码
        </text>
        <view
          class="bg-[#FAFAFA] dark:bg-gray-900 w-full py-6 rounded-lg mb-6 border-2 border-dashed border-primary/20 flex items-center justify-center"
        >
          <text
            class="text-4xl font-black tracking-[0.2em] text-text-main dark:text-white"
          >
            {{ inviteCode || "------" }}
          </text>
        </view>
        <view
          @click="$emit('copy')"
          class="w-full bg-primary hover:bg-orange-500 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20 cursor-pointer"
        >
          <text class="material-symbols-outlined">content_copy</text>
          <text>复制邀请码</text>
        </view>
        <text class="text-[10px] text-text-muted mt-4">
          该邀请码长期有效，可随时刷新
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  inviteCode?: string;
}>();

defineEmits<{
  copy: [];
}>();
</script>
