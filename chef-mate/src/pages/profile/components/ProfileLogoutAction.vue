<template>
  <view class="px-6 pt-8 pb-4">
    <view
      class="flex items-center justify-center rounded-2xl border border-red-100 bg-red-50/80 py-4 text-red-500 active:opacity-70"
      :class="loggingOut ? 'opacity-70' : ''"
      @click="$emit('logout')"
    >
      <text class="material-symbols-outlined text-lg">logout</text>
      <text class="ml-2 text-sm font-bold">
        {{ loggingOut ? "退出中..." : "退出登录" }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  loggingOut: boolean;
}>();

defineEmits<{
  logout: [];
}>();
</script>
