<template>
  <view
    v-if="visible"
    class="fixed inset-x-0 top-0 z-[10020] pointer-events-none"
    :class="wrapperClass"
    :style="wrapperStyle"
  >
    <view
      class="cm-top-notice-bar pointer-events-auto flex w-full items-center justify-between gap-4 px-6 py-2.5 transition-[transform,opacity] duration-250 ease-out"
      :class="[barMotionClass, typeStyles[currentType].accentClass]"
    >
      <view class="flex min-w-0 flex-1 items-center gap-3">
        <text
          class="cm-top-notice-bar__icon material-symbols-outlined shrink-0 text-[20px] leading-none"
          :class="[
            typeStyles[currentType].iconClass,
            currentType === 'loading' ? 'animate-spin' : '',
          ]"
        >
          {{ typeStyles[currentType].icon }}
        </text>
        <text
          class="truncate text-sm font-medium tracking-tight"
          :class="typeStyles[currentType].textClass"
        >
          {{ currentMessage }}
        </text>
      </view>

      <view
        class="flex h-7 w-7 shrink-0 items-center justify-center"
        @click="close"
      >
        <text
          class="material-symbols-outlined text-[18px] leading-none transition-opacity active:opacity-70"
          :class="typeStyles[currentType].closeClass"
        >
          close
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";

type ToastType = "success" | "error" | "warning" | "loading" | "default";
type NoticePhase = "entering" | "shown" | "leaving";

interface ShowOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

const DEFAULT_DURATION = 2000;
const ENTER_DELAY = 20;
const EXIT_DURATION = 250;

const visible = ref(false);
const phase = ref<NoticePhase>("entering");
const currentMessage = ref("");
const currentType = ref<ToastType>("default");
const isWeb = typeof window !== "undefined" && typeof document !== "undefined";
const nativeStatusBarHeight = ref(getStatusBarHeight());
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
let animationTimer: ReturnType<typeof setTimeout> | null = null;

const typeStyles: Record<
  ToastType,
  {
    icon: string;
    accentClass: string;
    iconClass: string;
    textClass: string;
    closeClass: string;
  }
> = {
  success: {
    icon: "check_circle",
    accentClass: "text-[#3d6e15]",
    iconClass: "text-[#3d6e15]",
    textClass: "text-[#3d6e15]",
    closeClass: "text-[#3d6e15]/40",
  },
  error: {
    icon: "error",
    accentClass: "text-[#ff7f50]",
    iconClass: "text-[#ff7f50]",
    textClass: "text-[#ff7f50]",
    closeClass: "text-[#ff7f50]/40",
  },
  warning: {
    icon: "warning",
    accentClass: "text-[#d97706]",
    iconClass: "text-[#d97706]",
    textClass: "text-[#b45309]",
    closeClass: "text-[#d97706]/40",
  },
  loading: {
    icon: "sync",
    accentClass: "text-orange-500",
    iconClass: "text-orange-500",
    textClass: "text-orange-700",
    closeClass: "text-orange-500/40",
  },
  default: {
    icon: "info",
    accentClass: "text-[#7c5400]",
    iconClass: "text-[#7c5400]",
    textClass: "text-[#6b4a00]",
    closeClass: "text-[#7c5400]/40",
  },
};

const wrapperClass = computed(() =>
  isWeb ? "cm-top-notice-wrap cm-top-notice-wrap--web" : "cm-top-notice-wrap",
);

const wrapperStyle = computed(() =>
  isWeb
    ? { paddingTop: "env(safe-area-inset-top, 0px)" }
    : { paddingTop: `${nativeStatusBarHeight.value}px` },
);

const barMotionClass = computed(() => {
  if (phase.value === "shown") {
    return "translate-y-0 opacity-100";
  }

  if (phase.value === "leaving") {
    return "-translate-y-2 opacity-0";
  }

  return "-translate-y-4 opacity-100";
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

function show(options: ShowOptions | string) {
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
  }, ENTER_DELAY);

  if (currentType.value !== "loading") {
    const duration =
      typeof options === "object" && options.duration ? options.duration : DEFAULT_DURATION;
    autoCloseTimer = setTimeout(() => {
      close();
    }, duration);
  }
}

function close() {
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
  }, EXIT_DURATION);
}

onUnmounted(() => {
  clearTimers();
});

defineExpose({
  show,
  close,
});
</script>

<style scoped>
.cm-top-notice-wrap--web {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top, 0px);
}

.cm-top-notice-bar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.05);
}

.cm-top-notice-bar__icon {
  font-variation-settings:
    "FILL" 1,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
}
</style>
