<template>
  <view :class="tagClass">
    <slot>{{ text }}</slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Tone = "primary" | "success" | "warning" | "info" | "neutral" | "danger";
type Variant = "soft" | "solid";
type Size = "xs" | "sm";

const props = withDefaults(
  defineProps<{
    text?: string;
    tone?: Tone;
    variant?: Variant;
    size?: Size;
  }>(),
  {
    text: "",
    tone: "neutral",
    variant: "soft",
    size: "sm",
  },
);

const sizeClassMap: Record<Size, string> = {
  xs: "min-h-[36rpx] px-[12rpx] text-[20rpx]",
  sm: "min-h-[44rpx] px-[16rpx] text-[24rpx]",
};

const variantClassMap: Record<Variant, string> = {
  soft: "rounded-[8rpx] border font-medium",
  solid: "rounded-full font-bold text-white",
};

const toneClassMap: Record<Variant, Record<Tone, string>> = {
  soft: {
    primary: "border-[#d9ecff] bg-[#ecf5ff] text-[#409eff]",
    success: "border-[#e1f3d8] bg-[#f0f9eb] text-[#67c23a]",
    warning: "border-[#faecd8] bg-[#fdf6ec] text-[#e6a23c]",
    info: "border-[#d3d4d6] bg-[#f4f4f5] text-[#909399]",
    neutral: "border-[#dcdfe6] bg-[#f5f7fa] text-[#606266]",
    danger: "border-[#fde2e2] bg-[#fef0f0] text-[#f56c6c]",
  },
  solid: {
    primary: "bg-primary text-white",
    success: "bg-green-500 text-white",
    warning: "bg-amber-500 text-white",
    info: "bg-blue-500 text-white",
    neutral: "bg-slate-500 text-white",
    danger: "bg-red-500 text-white",
  },
};

const tagClass = computed(
  () =>
    `inline-flex items-center text-xs justify-center leading-none ${sizeClassMap[props.size]} ${variantClassMap[props.variant]} ${toneClassMap[props.variant][props.tone]}`,
);
</script>
