<template>
  <u-popup
    :show="isRenderedVisible"
    mode="bottom"
    :round="round"
    :zIndex="zIndex"
    bg-color="transparent"
    :overlay-style="overlayStyle"
    :close-on-click-overlay="closeOnClickOverlay"
    @close="handlePopupClose"
  >
    <view
      class="cm-bottom-sheet-panel"
      :class="panelClass"
      :style="panelStyle"
      @touchmove.stop="handlePanelTouchMove"
      @transitionend="handlePanelTransitionEnd"
    >
      <view
        v-if="showDragHandle"
        class="cm-bottom-sheet-drag-zone"
        @touchstart="handleDragStart"
        @touchmove.stop.prevent="handleDragMove"
        @touchend="handleDragEnd"
        @touchcancel="handleDragCancel"
      >
        <view class="cm-bottom-sheet-drag-handle" />
      </view>

      <view v-if="$slots.header" class="cm-bottom-sheet-header">
        <slot name="header" />
      </view>
      <scroll-view
        v-if="useInternalScrollableBody"
        scroll-y
        enable-flex
        class="cm-bottom-sheet-scroll-body"
        @touchmove.stop="handleScrollableBodyTouchMove"
      >
        <view class="cm-bottom-sheet-scroll-content" :class="bodyClass">
          <slot />
        </view>
      </scroll-view>
      <view
        v-else
        class="cm-bottom-sheet-body"
        :class="[bodyClass, { 'cm-bottom-sheet-body--scrollable': useWebScrollableBody }]"
      >
        <slot />
      </view>
      <view
        v-if="$slots.footer"
        class="cm-bottom-sheet-footer"
        :class="{ 'cm-bottom-sheet-footer--safe': safeAreaInsetBottom }"
      >
        <slot name="footer" />
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useOverlayScrollLock } from "@/composables/useOverlayScrollLock";
import { isWeb } from "@uni-helper/uni-env";

const DRAG_CLOSE_THRESHOLD = 72;

const props = withDefaults(
  defineProps<{
    show: boolean;
    round?: number | string;
    maxHeight?: string;
    scrollableBody?: boolean;
    bodyClass?: string;
    closeOnClickOverlay?: boolean;
    safeAreaInsetBottom?: boolean;
    lockBackgroundScroll?: boolean;
    dragToClose?: boolean;
    showDragHandle?: boolean;
    zIndex?: number | string;
    panelClass?: string;
  }>(),
  {
    round: 32,
    maxHeight: "",
    scrollableBody: false,
    bodyClass: "",
    closeOnClickOverlay: true,
    safeAreaInsetBottom: true,
    lockBackgroundScroll: true,
    dragToClose: true,
    showDragHandle: true,
    zIndex: 10070,
    panelClass: "",
  },
);

const emit = defineEmits<{
  "update:show": [value: boolean];
  close: [];
}>();

const { lockBodyScroll, unlockBodyScroll } = useOverlayScrollLock();
let isScrollLocked = false;
const browserBottomInset = ref(0);
let removeViewportListeners: (() => void) | null = null;
const isRenderedVisible = ref(false);
const dragStartY = ref(0);
const dragOffsetY = ref(0);
const isDragging = ref(false);
const isClosingByGesture = ref(false);
const pendingCloseReason = ref<"gesture" | "overlay" | "dismiss" | null>(null);

const overlayStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.28)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

const useInternalScrollableBody = computed(
  () => props.scrollableBody && !isWeb,
);

const useWebScrollableBody = computed(
  () => props.scrollableBody && isWeb,
);

const panelStyle = computed(() => ({
  "--cm-bottom-sheet-browser-inset": `${browserBottomInset.value}px`,
  transform: isClosingByGesture.value
    ? "translateY(100%)"
    : `translateY(${dragOffsetY.value}px)`,
  maxHeight: props.maxHeight || undefined,
  transition:
    isDragging.value ? "none" : "transform 0.22s ease-out",
}));

function finalizeClose() {
  isRenderedVisible.value = false;
  emit("update:show", false);
  emit("close");
  syncBackgroundScrollLock();
  syncViewportTracking();
}

function getTouchClientY(event: any) {
  return (
    event?.touches?.[0]?.clientY ??
    event?.changedTouches?.[0]?.clientY ??
    null
  );
}

function handleDragStart(event: any) {
  if (!props.dragToClose || !props.show) {
    return;
  }

  const clientY = getTouchClientY(event);
  if (typeof clientY !== "number") {
    return;
  }

  dragStartY.value = clientY;
  dragOffsetY.value = 0;
  isDragging.value = true;
  isClosingByGesture.value = false;
}

function handleDragMove(event: any) {
  if (!props.dragToClose || !isDragging.value) {
    return;
  }

  const clientY = getTouchClientY(event);
  if (typeof clientY !== "number") {
    return;
  }

  const deltaY = clientY - dragStartY.value;
  dragOffsetY.value = Math.max(0, deltaY);
}

function handleDragEnd() {
  if (!isDragging.value) {
    return;
  }

  isDragging.value = false;

  if (dragOffsetY.value >= DRAG_CLOSE_THRESHOLD) {
    requestClose("gesture");
    return;
  }

  dragOffsetY.value = 0;
}

function handleDragCancel() {
  if (!isDragging.value) {
    return;
  }

  isDragging.value = false;
  dragOffsetY.value = 0;
}

function handleScrollableBodyTouchMove() {}

function handlePanelTouchMove() {}

function handlePanelTransitionEnd() {
  if (!isClosingByGesture.value || !pendingCloseReason.value) {
    return;
  }

  finalizeClose();
}

function resetDragState() {
  dragStartY.value = 0;
  dragOffsetY.value = 0;
  isDragging.value = false;
  isClosingByGesture.value = false;
  pendingCloseReason.value = null;
}

function requestClose(reason: "gesture" | "overlay" | "dismiss") {
  if (pendingCloseReason.value) {
    return;
  }

  pendingCloseReason.value = reason;
  isDragging.value = false;
  isClosingByGesture.value = true;
}

function handlePopupClose() {
  requestClose("overlay");
}

function syncBackgroundScrollLock() {
  const shouldLock = (props.show || isRenderedVisible.value) && props.lockBackgroundScroll;

  if (shouldLock && !isScrollLocked) {
    lockBodyScroll();
    isScrollLocked = true;
    return;
  }

  if (!shouldLock && isScrollLocked) {
    unlockBodyScroll();
    isScrollLocked = false;
  }
}

function updateBrowserBottomInset() {
  if (
    !isWeb ||
    typeof window === "undefined" ||
    typeof window.visualViewport === "undefined" ||
    !window.visualViewport
  ) {
    browserBottomInset.value = 0;
    return;
  }

  const { visualViewport } = window;
  const rawInset =
    window.innerHeight - visualViewport.height - visualViewport.offsetTop;

  browserBottomInset.value = Math.max(0, Math.min(120, Math.round(rawInset)));
}

function stopViewportTracking() {
  removeViewportListeners?.();
  removeViewportListeners = null;
  browserBottomInset.value = 0;
}

function startViewportTracking() {
  if (
    !isWeb ||
    typeof window === "undefined" ||
    typeof window.visualViewport === "undefined" ||
    !window.visualViewport ||
    removeViewportListeners
  ) {
    updateBrowserBottomInset();
    return;
  }

  const { visualViewport } = window;
  const syncInset = () => {
    updateBrowserBottomInset();
  };

  visualViewport.addEventListener("resize", syncInset);
  visualViewport.addEventListener("scroll", syncInset);
  removeViewportListeners = () => {
    visualViewport.removeEventListener("resize", syncInset);
    visualViewport.removeEventListener("scroll", syncInset);
  };

  syncInset();
}

function syncViewportTracking() {
  if (props.show || isRenderedVisible.value) {
    startViewportTracking();
    return;
  }

  stopViewportTracking();
}

watch(
  () => [props.show, props.lockBackgroundScroll],
  () => {
    syncBackgroundScrollLock();
  },
  { immediate: true },
);

watch(
  () => props.show,
  (value) => {
    if (value) {
      isRenderedVisible.value = true;
      resetDragState();
    } else if (isRenderedVisible.value && !pendingCloseReason.value) {
      requestClose("dismiss");
    }

    syncViewportTracking();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (!isScrollLocked) {
    stopViewportTracking();
  } else {
    unlockBodyScroll();
    isScrollLocked = false;
    stopViewportTracking();
  }
});
</script>

<style scoped>
.cm-bottom-sheet-panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  height: auto;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
  background: #ffffff;
  box-shadow: 0 -16rpx 80rpx -20rpx rgba(15, 23, 42, 0.2);
}

.cm-bottom-sheet-header {
  flex-shrink: 0;
}

.cm-bottom-sheet-drag-zone {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 16rpx 0 8rpx;
}

.cm-bottom-sheet-drag-handle {
  height: 8rpx;
  width: 96rpx;
  border-radius: 9999rpx;
  background: rgba(203, 213, 225, 0.95);
}

.cm-bottom-sheet-body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.cm-bottom-sheet-body--scrollable {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.cm-bottom-sheet-scroll-body {
  display: block;
  flex: 1;
  min-height: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
}

.cm-bottom-sheet-scroll-content {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.cm-bottom-sheet-scroll-body :deep(.uni-scroll-view) {
  height: 100%;
  max-height: 100%;
}

.cm-bottom-sheet-scroll-body :deep(.uni-scroll-view-content) {
  min-height: 100%;
  height: auto;
}

.cm-bottom-sheet-footer {
  flex-shrink: 0;
}

.cm-bottom-sheet-footer--safe {
  padding-bottom: calc(
    constant(safe-area-inset-bottom) +
      var(--cm-bottom-sheet-browser-inset, 0px)
  );
  padding-bottom: calc(
    env(safe-area-inset-bottom) + var(--cm-bottom-sheet-browser-inset, 0px)
  );
}
</style>
