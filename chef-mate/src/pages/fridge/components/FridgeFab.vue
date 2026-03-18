<template>
  <view>
    <!-- FAB Menu Overlay -->
    <view
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[45] transition-opacity duration-300"
      :class="
        isFabOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      "
      @click="isFabOpen = false"
    ></view>

    <view class="fab-stack">
      <!-- FAB Menu Items -->
      <view
        class="fab-menu"
        :class="
          isFabOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-4 opacity-0 pointer-events-none'
        "
      >
        <view class="flex items-center gap-3">
          <text
            class="text-slate-700 font-medium text-sm bg-white/90 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm"
            >扫描录入</text
          >
          <button
            class="w-12 h-12 rounded-full bg-white border border-primary/20 flex items-center justify-center text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-slate-50 transition-all active:scale-95 m-0 p-0 after:hidden"
            @click="handleAction('camera')"
          >
            <text class="material-symbols-outlined text-[24px]"
              >photo_camera</text
            >
          </button>
        </view>
        <view class="flex items-center gap-3">
          <text
            class="text-slate-700 font-medium text-sm bg-white/90 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm"
            >语音录入</text
          >
          <button
            class="w-12 h-12 rounded-full bg-white border border-primary/20 flex items-center justify-center text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-slate-50 transition-all active:scale-95 m-0 p-0 after:hidden"
            @click="handleAction('mic')"
          >
            <text class="material-symbols-outlined text-[24px]">mic</text>
          </button>
        </view>
        <view class="flex items-center gap-3">
          <text
            class="text-slate-700 font-medium text-sm bg-white/90 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm"
            >手动输入</text
          >
          <button
            class="w-12 h-12 rounded-full bg-white border border-primary/20 flex items-center justify-center text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-slate-50 transition-all active:scale-95 m-0 p-0 after:hidden"
            @click="handleAction('edit')"
          >
            <text class="material-symbols-outlined text-[24px]">edit</text>
          </button>
        </view>
      </view>

      <button
        class="fab-button"
        :class="isFabOpen ? 'fab-button-hidden' : ''"
        @click="$emit('ai-recipe')"
      >
        <text
          class="material-symbols-outlined text-[28px]"
          :style="{ fontVariationSettings: '\'FILL\' 1' }"
        >
          magic_button
        </text>
      </button>

      <!-- FAB Main Button -->
      <button class="fab-button" @click="isFabOpen = !isFabOpen">
        <text
          class="material-symbols-outlined text-[32px] font-bold transition-transform duration-300"
          :class="isFabOpen ? 'rotate-45' : ''"
        >
          add
        </text>
      </button>
    </view>
    <ScanCamera v-model:show="showScanCamera" @added="onItemAdded" />
    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ScanCamera from "./ScanCamera.vue";

const emit = defineEmits<{
  added: [];
  "ai-recipe": [];
}>();

const isFabOpen = ref(false);
const showScanCamera = ref(false);
const uToastRef = ref();

const handleAction = (type: string) => {
  isFabOpen.value = false;
  if (type === "camera") {
    showScanCamera.value = true;
  } else if (type === "mic") {
    uToastRef.value?.show({ message: "语音录入开发中", type: "default" });
  } else if (type === "edit") {
    uToastRef.value?.show({ message: "手动录入开发中", type: "default" });
  }
};

const onItemAdded = () => {
  uToastRef.value?.show({ message: "食材已添加到冰箱", type: "success" });
  emit("added");
};
</script>

<style scoped>
.fab-stack {
  --fab-size: 112rpx;
  --fab-gap: 40rpx;
  --fab-right: 48rpx;
  --fab-bottom-base: 176rpx;
  position: fixed;
  right: var(--fab-right);
  bottom: calc(var(--fab-bottom-base) + constant(safe-area-inset-bottom));
  bottom: calc(var(--fab-bottom-base) + env(safe-area-inset-bottom));
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--fab-gap);
}

.fab-button {
  width: var(--fab-size);
  height: var(--fab-size);
  border-radius: 9999px;
  border: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff9d0a;
  color: #ffffff;
  box-shadow:
    0 16rpx 40rpx -8rpx rgba(255, 159, 10, 0.4),
    0 8rpx 16rpx -8rpx rgba(255, 159, 10, 0.2);
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.fab-button::after {
  display: none;
}

.fab-button-hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.9);
}

.fab-menu {
  position: absolute;
  right: 0;
  bottom: calc(var(--fab-size) + var(--fab-gap));
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 32rpx;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
</style>
