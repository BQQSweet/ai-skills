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
  xs: "px-2 py-1 text-[10px]",
  sm: "px-3 py-1 text-[11px]",
};

const toneClassMap: Record<Variant, Record<Tone, string>> = {
  soft: {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    info: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300",
    neutral: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300",
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
    `inline-flex items-center justify-center rounded-full font-bold leading-none ${sizeClassMap[props.size]} ${toneClassMap[props.variant][props.tone]}`,
);
</script>
