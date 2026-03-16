<template>
  <view class="relative overflow-hidden rounded-2xl">
    <!-- Action Buttons (revealed on swipe up) -->
    <view
      class="absolute bottom-0 left-0 right-0 z-20 flex gap-2 p-3 justify-center bg-gradient-to-t from-white via-white to-white/80"
      :class="
        showActions ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      "
      style="transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <button
        class="flex-1 m-0 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold flex items-center justify-center gap-1 border border-blue-100 after:hidden active:scale-95 transition-transform"
        @click.stop="$emit('edit', item)"
      >
        <text>编辑</text>
      </button>
      <button
        class="flex-1 m-0 px-3 py-2.5 rounded-xl bg-red-50 text-red-500 text-xs font-semibold flex items-center justify-center gap-1 border border-red-100 after:hidden active:scale-95 transition-transform"
        @click.stop="$emit('delete', item)"
      >
        <text>出库</text>
      </button>
    </view>

    <!-- Card Content -->
    <view
      class="bg-white rounded-2xl p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] relative flex flex-col transition-all"
      :class="[
        item.selected
          ? 'border-2 border-primary'
          : 'border border-slate-100 opacity-90',
        item.customCardClass,
      ]"
      :style="{
        transform: `translateY(${offsetY}px)`,
        transition: isDragging
          ? 'none'
          : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }"
      @click="handleClick"
      @touchstart="onTouchStart"
      @touchmove.stop.prevent="onTouchMove"
      @touchend="onTouchEnd"
    >
      <view class="absolute top-2 left-2 z-10">
        <view
          v-if="item.selected"
          class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm"
        >
          <text class="material-symbols-outlined text-[18px] font-bold"
            >check</text
          >
        </view>
        <view
          v-else
          class="w-6 h-6 rounded-full border-2 border-slate-200 bg-white shadow-sm"
        ></view>
      </view>

      <view
        v-if="item.statusType"
        class="absolute top-3 right-3 w-2 h-2 rounded-full z-10"
        :class="statusBadgeColor"
      ></view>

      <view
        class="aspect-square rounded-xl mb-3 overflow-hidden relative w-full flex items-center justify-center"
        :class="item.bgClass"
      >
        <image
          v-if="item.image"
          :alt="item.image"
          class="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
          :class="item.customImageClass || 'opacity-90'"
          :style="item.customImageStyle || ''"
          :src="item.image"
        />
        <text v-else class="text-[48px] leading-none">{{
          item.emoji || "📦"
        }}</text>
      </view>

      <view class="flex flex-col gap-1 mt-auto">
        <text
          class="font-bold text-base"
          :class="item.selected ? 'text-slate-800' : 'text-slate-700'"
          >{{ item.name }}</text
        >
        <text class="text-slate-400 text-xs">{{ item.quantity }}</text>

        <view
          v-if="item.statusText"
          class="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md w-fit"
          :class="statusTagColor"
        >
          <text class="material-symbols-outlined text-[14px]">{{
            item.statusIcon
          }}</text>
          <text class="text-xs font-semibold">{{ item.statusText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { FridgeItemUI } from "@/types/fridge";

const props = defineProps<{
  item: FridgeItemUI;
}>();

const emit = defineEmits(["toggle-select", "edit", "delete"]);

// ---------- 上滑手势 ----------
const isDragging = ref(false);
const showActions = ref(false);
const offsetY = ref(0);
let startY = 0;
let startX = 0;
let moved = false;

const THRESHOLD = 40; // 滑动触发阈值
const ACTION_HEIGHT = -56; // 露出操作按钮的偏移量

const onTouchStart = (e: any) => {
  const touch = e.touches[0];
  startY = touch.clientY;
  startX = touch.clientX;
  isDragging.value = true;
  moved = false;
};

const onTouchMove = (e: any) => {
  const touch = e.touches[0];
  const deltaY = touch.clientY - startY;
  const deltaX = touch.clientX - startX;

  // 如果水平滑动幅度大于垂直，忽略
  if (Math.abs(deltaX) > Math.abs(deltaY)) return;

  // 垂直滑动时阻止页面滚动
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();

  // 只处理上滑
  if (deltaY < 0) {
    moved = true;
    // 限制最大偏移
    offsetY.value = Math.max(deltaY * 0.6, ACTION_HEIGHT);
  } else if (showActions.value) {
    // 已展开时向下滑收回
    moved = true;
    offsetY.value = Math.min(deltaY * 0.6 + ACTION_HEIGHT, 0);
  }
};

const onTouchEnd = () => {
  isDragging.value = false;

  if (offsetY.value < -THRESHOLD) {
    // 超过阈值，展开操作按钮
    offsetY.value = ACTION_HEIGHT;
    showActions.value = true;
  } else {
    // 收回
    offsetY.value = 0;
    showActions.value = false;
  }
};

const handleClick = () => {
  if (moved) return; // 滑动过程中不触发点击
  if (showActions.value) {
    // 点击收回
    offsetY.value = 0;
    showActions.value = false;
    return;
  }
  emit("toggle-select", props.item);
};

// ---------- 状态样式 ----------
const statusBadgeColor = computed(() => {
  switch (props.item.statusType) {
    case "warning":
      return "bg-yellow-400";
    case "success":
      return "bg-green-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-slate-300";
  }
});

const statusTagColor = computed(() => {
  switch (props.item.statusType) {
    case "warning":
      return "text-yellow-600 bg-yellow-50";
    case "success":
      return "text-green-700 bg-green-50";
    case "error":
      return "text-red-600 bg-red-50";
    default:
      return "text-slate-600 bg-slate-50";
  }
});
</script>
