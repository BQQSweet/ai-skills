<template>
  <view
    class="rounded-[36rpx] border border-[#ff5252]/10 bg-[#ff5252]/[0.045] p-7 text-center shadow-[0_18px_48px_-30px_rgba(255,82,82,0.22)]"
  >
    <view class="flex flex-col items-center gap-5">
      <view
        class="flex h-14 w-14 items-center justify-center rounded-full bg-[#ff5252]/10 text-[#ff5252]"
      >
        <text class="material-symbols-outlined text-[28px]">error</text>
      </view>
      <view class="min-w-0">
        <text class="block text-lg font-bold text-slate-900">
          解析超时
        </text>
        <text class="mt-2 block text-sm leading-6 text-slate-500">
          {{ error || "视频解析失败，请重新选择视频或稍后再试。" }}
        </text>
      </view>
    </view>

    <button
      class="m-0 rounded-full border-none bg-[#ff5252] px-8 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_-20px_rgba(255,82,82,0.55)] after:hidden active:scale-95"
      @click="$emit('retry')"
    >
      重新上传
    </button>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  error: string;
}>();

defineEmits<{
  retry: [];
}>();
</script>
