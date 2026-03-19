<template>
  <view class="mb-5 flex rounded-full bg-white/80 p-1 shadow-sm backdrop-blur">
    <view
      v-for="item in items"
      :key="item.value"
      class="flex-1 rounded-full px-4 py-3 text-center text-sm font-bold transition-all"
      :class="
        modelValue === item.value
          ? 'bg-primary text-white shadow-[0_10px_20px_-14px_rgba(255,157,10,0.8)]'
          : 'text-text-muted'
      "
      @click="$emit('update:modelValue', item.value)"
    >
      <text>{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { AuthMode } from "@/types/user";

defineProps<{
  modelValue: AuthMode;
}>();

defineEmits<{
  "update:modelValue": [value: AuthMode];
}>();

const items: Array<{ label: string; value: AuthMode }> = [
  { label: "登录", value: "login" },
  { label: "注册", value: "register" },
];
</script>
