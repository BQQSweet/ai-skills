<template>
  <view class="flex-1 flex flex-col justify-end items-center pt-4 pb-5">
    <view
      class="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[22px] flex items-center justify-center shadow-[0_10px_15px_-3px_rgba(var(--primary),0.1)] mb-4 backdrop-blur-sm overflow-hidden"
    >
      <image
        class="w-full h-full object-cover"
        src="/static/logo.png"
        mode="aspectFill"
      ></image>
    </view>
    <text
      class="text-[38px] text-quicksand font-bold tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-1"
    >
      ChefMate
    </text>
    <view class="flex items-center justify-center gap-2 mt-0.5 mb-1.5">
      <view
        class="text-md flex items-center text-notoserifsc font-medium text-text-muted tracking-wide"
      >
        {{ subtitle }}
        <view
          class="w-1 h-1 mx-1 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-pulse"
        ></view>
        {{ description }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { AuthMode } from "@/types/user";

const props = defineProps<{
  authMode: AuthMode;
}>();

const subtitle = computed(() =>
  props.authMode === "login" ? "让做饭" : "注册账号",
);

const description = computed(() =>
  props.authMode === "login" ? "变简单" : "开启家庭厨房协作",
);
</script>
