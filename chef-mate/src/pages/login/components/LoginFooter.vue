<template>
  <view class="flex-1 flex flex-col justify-end items-center pt-8 pb-4 gap-8">
    <view class="w-full flex flex-col items-center gap-4">
      <view class="relative w-full flex items-center justify-center opacity-40">
        <view class="flex-1 h-px bg-gray-300"></view>
        <text class="px-4 text-xs text-text-muted bg-background-light">
          其他登录方式
        </text>
        <view class="flex-1 h-px bg-gray-300"></view>
      </view>
      <view
        class="w-12 h-12 rounded-full bg-wechat/10 border border-wechat/20 flex items-center justify-center transition-colors cursor-pointer active:bg-wechat/20 active:scale-95"
        @click="$emit('wechat-login')"
      >
        <CmIcon name="weixin" is-svg size="48rpx"></CmIcon>
      </view>
    </view>

    <view
      class="flex items-start gap-2 max-w-[320px] text-center cursor-pointer"
      @click="$emit('toggle-terms')"
    >
      <view class="pt-0.5">
        <view
          class="w-4 h-4 border border-gray-300 rounded flex items-center justify-center transition-all duration-200"
          :class="agreedToTerms ? 'bg-primary border-primary' : ''"
        >
          <text
            v-if="agreedToTerms"
            class="text-white text-[12px] leading-none font-bold material-symbols-outlined"
          >
            check
          </text>
        </view>
      </view>
      <view class="text-xs text-text-muted leading-relaxed text-left">
        我在阅读并同意
        <text
          class="text-primary px-0.5 inline-block active:underline"
          @click.stop="$emit('agreement')"
        >
          用户协议
        </text>
        和
        <text
          class="text-primary px-0.5 inline-block active:underline"
          @click.stop="$emit('privacy')"
        >
          隐私保护指引
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import CmIcon from "@/components/CmIcon/CmIcon.vue";

defineProps<{
  agreedToTerms: boolean;
}>();

defineEmits<{
  "wechat-login": [];
  "toggle-terms": [];
  agreement: [];
  privacy: [];
}>();
</script>
