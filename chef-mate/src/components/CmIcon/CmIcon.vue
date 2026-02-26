<template>
  <view
    class="cm-icon-wrapper"
    :class="[customClass]"
    :style="[computedStyle, customStyle]"
    @click="onClick"
  >
    <!-- 多色 SVG 静态文件渲染模式 (支持本地 static/svgs 目录) -->
    <image
      v-if="isSvg"
      class="cm-icon-svg"
      :src="`/static/svgs/${name.replace(/^icon-/, '')}.svg`"
      mode="aspectFit"
    ></image>
    <!-- 单色字体渲染模式 (Font-class) -->
    <text v-else class="iconfont" :class="[`icon-${name}`]"></text>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    /** 图标名称，不需要带 icon- 前缀 */
    name: string;
    /** 图标颜色，如果不传则继承父元素颜色（主要用于单色 Font-class 模式） */
    color?: string;
    /** 图标大小，支持直接传数字（默认 px）或带单位的字符串，如 '24rpx', '2rem' */
    size?: number | string;
    /** 是否使用 SVG 模式渲染（支持多色），默认为 false。如果传入 true，需要确保全局已引入 iconfont.js */
    isSvg?: boolean;
    /** 额外的自定义 class */
    customClass?: string;
    /** 额外的自定义样式 */
    customStyle?: Record<string, any>;
  }>(),
  {
    color: "",
    size: 24,
    isSvg: false,
    customClass: "",
    customStyle: () => ({}),
  },
);

const emit = defineEmits<{
  (e: "click", event: Event): void;
}>();

const computedStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.color) {
    style.color = props.color;
  }

  if (props.size) {
    style.fontSize =
      typeof props.size === "number" ? `${props.size}px` : props.size;

    // 如果是 svg 模式，通常还需要确保包裹层的高宽和字体大小一致
    if (props.isSvg) {
      style.width = style.fontSize;
      style.height = style.fontSize;
    }
  }

  return style;
});

function onClick(e: Event) {
  emit("click", e);
}
</script>

<style scoped>
.cm-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.iconfont {
  font-family: "iconfont" !important;
  font-style: normal;
  line-height: 1;
  text-align: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.cm-icon-svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
