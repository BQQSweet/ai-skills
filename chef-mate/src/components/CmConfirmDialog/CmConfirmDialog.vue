<template>
  <u-popup
    :show="show"
    mode="center"
    :round="0"
    bg-color="transparent"
    :overlay-style="overlayStyle"
    :close-on-click-overlay="closeOnClickOverlay"
    @close="handleClose"
  >
    <view class="mx-6 w-[640rpx] max-w-full rounded-[48rpx] bg-white px-8 pb-8 pt-8 shadow-[0_24px_60px_-24px_rgba(29,22,12,0.35)]">
      <view
        v-if="iconName"
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        :class="iconWrapperClass"
      >
        <text class="material-symbols-outlined text-[28px]" :class="iconClass">
          {{ iconName }}
        </text>
      </view>

      <text class="block text-center text-[20px] font-black text-slate-900">
        {{ title }}
      </text>
      <text
        v-if="displayDescription"
        class="mx-auto mt-3 block max-w-[520rpx] text-center text-[15px] leading-7 text-slate-400"
      >
        {{ displayDescription }}
      </text>

      <view class="mt-6 flex flex-col gap-3">
        <template v-if="variant === 'confirm'">
          <view
            class="flex h-14 items-center justify-center rounded-[28rpx] text-base font-bold text-white transition-all"
            :class="confirmButtonClass"
            @click="handleConfirm"
          >
            <text>{{ confirmText }}</text>
          </view>
        </template>
        <template v-else>
          <view
            v-for="action in actions"
            :key="action.key"
            class="flex h-14 items-center justify-center rounded-[28rpx] text-base font-bold transition-all"
            :class="getActionButtonClass(action.tone)"
            @click="handleSelect(action.key)"
          >
            <text>{{ action.label }}</text>
          </view>
        </template>
        <view
          class="flex h-14 items-center justify-center rounded-[28rpx] bg-[#f5f5f7] text-base font-medium text-slate-500 transition-all active:scale-[0.98]"
          @click="handleCancel"
        >
          <text>{{ cancelText }}</text>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Tone = "primary" | "danger";
type Variant = "confirm" | "actions";
type ActionTone = Tone | "default";

interface DialogAction {
  key: string;
  label: string;
  tone?: ActionTone;
}

const props = withDefaults(
  defineProps<{
    show: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    iconName?: string;
    tone?: Tone;
    closeOnClickOverlay?: boolean;
    disabled?: boolean;
    variant?: Variant;
    actions?: DialogAction[];
    actionDescription?: string;
  }>(),
  {
    description: "",
    confirmText: "确认",
    cancelText: "取消",
    iconName: "warning",
    tone: "primary",
    closeOnClickOverlay: true,
    disabled: false,
    variant: "confirm",
    actions: () => [],
    actionDescription: "",
  },
);

const emit = defineEmits<{
  "update:show": [value: boolean];
  confirm: [];
  cancel: [];
  close: [];
  select: [key: string];
}>();

const overlayStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const iconWrapperClass = computed(() =>
  props.tone === "danger" ? "bg-red-50" : "bg-orange-50",
);

const iconClass = computed(() =>
  props.tone === "danger" ? "text-red-500" : "text-primary",
);

const confirmButtonClass = computed(() =>
  props.disabled
    ? "bg-primary/40"
    : props.tone === "danger"
      ? "bg-red-500 shadow-[0_14px_30px_-18px_rgba(239,68,68,0.65)] active:scale-[0.98]"
      : "bg-primary shadow-[0_14px_30px_-18px_rgba(255,157,10,0.75)] active:scale-[0.98]",
);

const displayDescription = computed(() =>
  props.variant === "actions"
    ? props.actionDescription || props.description
    : props.description,
);

function getActionButtonClass(tone: ActionTone = "default") {
  if (props.disabled) {
    return "bg-slate-100 text-slate-400";
  }

  if (tone === "danger") {
    return "bg-red-500 text-white shadow-[0_14px_30px_-18px_rgba(239,68,68,0.65)] active:scale-[0.98]";
  }

  if (tone === "primary") {
    return "bg-primary text-white shadow-[0_14px_30px_-18px_rgba(255,157,10,0.75)] active:scale-[0.98]";
  }

  return "bg-[#f5f5f7] text-slate-700 active:scale-[0.98]";
}

function handleClose() {
  if (props.disabled) return;
  emit("update:show", false);
  emit("close");
}

function handleCancel() {
  if (props.disabled) return;
  emit("update:show", false);
  emit("cancel");
}

function handleConfirm() {
  if (props.disabled) return;
  emit("confirm");
}

function handleSelect(key: string) {
  if (props.disabled) return;
  emit("select", key);
}
</script>
