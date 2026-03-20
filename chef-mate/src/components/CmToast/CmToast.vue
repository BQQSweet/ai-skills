<template>
  <view
    v-if="visible"
    class="fixed inset-x-0 top-0 z-[99999] pointer-events-none flex items-start justify-center px-4"
    :class="wrapperClass"
    :style="wrapperStyle"
  >
    <view
      class="cm-toast-card pointer-events-auto flex max-w-[85vw] items-center gap-3 rounded-full px-5 py-3 transition-[transform,opacity] duration-250 ease-out"
      :class="[cardMotionClass, typeStyles[currentType].accentClass]"
    >
      <text
        class="cm-toast-icon material-symbols-outlined text-[20px] leading-none"
        :class="[
          typeStyles[currentType].iconClass,
          currentType === 'loading' ? 'animate-spin' : '',
        ]"
      >
        {{ typeStyles[currentType].icon }}
      </text>

      <text
        class="max-w-[65vw] truncate text-[15px] font-semibold leading-[1.2] tracking-[0.01em]"
        :class="typeStyles[currentType].textClass"
      >
        {{ currentMessage }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";

type ToastType = "success" | "error" | "warning" | "loading" | "default";
type ToastPhase = "entering" | "shown" | "leaving";

interface ShowOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

const visible = ref(false);
const phase = ref<ToastPhase>("entering");
const currentMessage = ref("");
const currentType = ref<ToastType>("default");
const isWeb = typeof window !== "undefined" && typeof document !== "undefined";
const nativeStatusBarHeight = ref(getStatusBarHeight());
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
let animationTimer: ReturnType<typeof setTimeout> | null = null;

const typeStyles: Record<
  ToastType,
  { icon: string; accentClass: string; iconClass: string; textClass: string }
> = {
  success: {
    icon: "check_circle",
    accentClass: "text-[#4ADE80]",
    iconClass: "text-[#4ADE80]",
    textClass: "text-[#4ADE80]",
  },
  error: {
    icon: "warning",
    accentClass: "text-[#F87171]",
    iconClass: "text-[#F87171]",
    textClass: "text-[#F87171]",
  },
  warning: {
    icon: "warning",
    accentClass: "text-[#F59E0B]",
    iconClass: "text-[#F59E0B]",
    textClass: "text-[#F59E0B]",
  },
  loading: {
    icon: "sync",
    accentClass: "text-[#FF9D1A]",
    iconClass: "text-[#FF9D1A]",
    textClass: "text-[#FF9D1A]",
  },
  default: {
    icon: "info",
    accentClass: "text-[#9A5B00]",
    iconClass: "text-[#9A5B00]",
    textClass: "text-[#9A5B00]",
  },
};

const wrapperClass = computed(() =>
  isWeb ? "cm-toast-wrap cm-toast-wrap--web" : "cm-toast-wrap",
);

const wrapperStyle = computed(() =>
  isWeb
    ? { paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)" }
    : { paddingTop: `${nativeStatusBarHeight.value + 20}px` },
);

const cardMotionClass = computed(() => {
  if (phase.value === "shown") {
    return "translate-y-0 scale-100 opacity-100";
  }

  if (phase.value === "leaving") {
    return "translate-y-1 scale-[0.985] opacity-0";
  }

  return "-translate-y-3 scale-[0.98] opacity-100";
});

function getStatusBarHeight() {
  if (isWeb) return 0;

  try {
    return Math.max(uni.getSystemInfoSync().statusBarHeight || 0, 0);
  } catch {
    return 0;
  }
}

function clearTimers() {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }

  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
}

const show = (options: ShowOptions | string) => {
  clearTimers();

  if (typeof options === "string") {
    currentMessage.value = options;
    currentType.value = "default";
  } else {
    currentMessage.value = options.message;
    currentType.value = options.type || "default";
  }

  visible.value = true;
  phase.value = "entering";
  animationTimer = setTimeout(() => {
    phase.value = "shown";
    animationTimer = null;
  }, 20);

  if (currentType.value !== "loading") {
    const duration =
      typeof options === "object" && options.duration ? options.duration : 2000;
    autoCloseTimer = setTimeout(() => {
      close();
    }, duration);
  }
};

const close = () => {
  if (!visible.value) return;

  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }

  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }

  phase.value = "leaving";
  animationTimer = setTimeout(() => {
    visible.value = false;
    phase.value = "entering";
    animationTimer = null;
  }, 250);
};

onUnmounted(() => {
  clearTimers();
});

// 暴露供父组件调用
defineExpose({
  show,
  close,
});
</script>

<style scoped>
.cm-toast-wrap--web {
  padding-top: calc(constant(safe-area-inset-top) + 20px);
  padding-top: calc(env(safe-area-inset-top, 0px) + 20px);
}

.cm-toast-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 0.5px solid rgba(234, 234, 234, 0.92);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.cm-toast-icon {
  font-variation-settings:
    "FILL" 0,
    "wght" 300,
    "GRAD" 0,
    "opsz" 20;
}
</style>
