<template>
  <view class="mt-12 rounded-[32rpx] bg-white px-6 py-10 text-center shadow-soft">
    <view
      class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
    >
      <text class="material-symbols-outlined text-4xl">group</text>
    </view>
    <text class="mt-5 block text-xl font-black">还没有加入家庭组</text>
    <text class="mt-2 block text-sm text-text-muted leading-6">
      创建一个新的家庭厨房，或者通过邀请码加入家人的厨房空间。
    </text>
    <view
      class="mt-6 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center"
      @click="$emit('open')"
    >
      <text>创建家庭组</text>
    </view>
    <view
      class="mt-3 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center"
      @click="$emit('open')"
    >
      <text>输入邀请码加入</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineEmits<{
  open: [];
}>();
</script>
