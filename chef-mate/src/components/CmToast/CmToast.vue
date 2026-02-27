<template>
  <view
    v-if="visible"
    class="fixed inset-0 z-[99999] pointer-events-none flex justify-center items-start pt-[15vh] transition-opacity duration-300"
    :class="opacity > 0 ? 'opacity-100' : 'opacity-0'"
  >
    <view
      class="flex items-center gap-2.5 px-5 py-3.5 rounded-[20rpx] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] max-w-[85vw] transform transition-transform duration-300 pointer-events-auto"
      :class="[
        opacity > 0 ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95',
        typeStyles[currentType].bg,
      ]"
    >
      <text
        v-if="currentType !== 'loading'"
        class="material-symbols-outlined text-[20px]"
        :style="{ fontVariationSettings: '\'FILL\' 1' }"
        :class="typeStyles[currentType].iconColor"
      >
        {{ typeStyles[currentType].icon }}
      </text>
      <!-- Loading spinner -->
      <view
        v-else
        class="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"
      ></view>

      <text
        class="text-[15px] font-medium leading-relaxed tracking-wide truncate max-w-[65vw]"
        :class="typeStyles[currentType].textColor"
      >
        {{ currentMessage }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

type ToastType = "success" | "error" | "warning" | "loading" | "default";

interface ShowOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

const visible = ref(false);
const opacity = ref(0);
const currentMessage = ref("");
const currentType = ref<ToastType>("default");
let hideTimer: ReturnType<typeof setTimeout> | null = null;

const typeStyles: Record<
  ToastType,
  { bg: string; icon: string; iconColor: string; textColor: string }
> = {
  success: {
    bg: "bg-green-50/95 backdrop-blur-md border border-green-200/50",
    icon: "check_circle",
    iconColor: "text-green-500",
    textColor: "text-green-800",
  },
  error: {
    bg: "bg-red-50/95 backdrop-blur-md border border-red-200/50",
    icon: "error",
    iconColor: "text-red-500",
    textColor: "text-red-800",
  },
  warning: {
    bg: "bg-orange-50/95 backdrop-blur-md border border-orange-200/50",
    icon: "warning",
    iconColor: "text-orange-500",
    textColor: "text-orange-800",
  },
  loading: {
    bg: "bg-white/95 backdrop-blur-md border border-gray-100",
    icon: "sync",
    iconColor: "text-primary",
    textColor: "text-slate-700",
  },
  default: {
    bg: "bg-slate-800/90 backdrop-blur-md",
    icon: "info",
    iconColor: "text-white/90",
    textColor: "text-white/90",
  },
};

const show = (options: ShowOptions | string) => {
  if (hideTimer) clearTimeout(hideTimer);

  if (typeof options === "string") {
    currentMessage.value = options;
    currentType.value = "default";
  } else {
    currentMessage.value = options.message;
    currentType.value = options.type || "default";
  }

  visible.value = true;
  // 小延迟确保 DOM 渲染，才能有过渡效果
  setTimeout(() => {
    opacity.value = 1;
  }, 20);

  if (currentType.value !== "loading") {
    const duration =
      typeof options === "object" && options.duration ? options.duration : 2000;
    hideTimer = setTimeout(() => {
      close();
    }, duration);
  }
};

const close = () => {
  opacity.value = 0;
  hideTimer = setTimeout(() => {
    visible.value = false;
  }, 300); // Wait for transition
};

// 暴露供父组件调用
defineExpose({
  show,
  close,
});
</script>

<style scoped></style>
