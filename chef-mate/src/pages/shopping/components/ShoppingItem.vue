<template>
  <view
    class="relative overflow-hidden rounded-[24rpx] bg-white p-4 shadow-[0_4px_20px_-2px_rgba(29,22,12,0.05)] transition-all"
    :class="cardClass"
  >
    <view
      v-if="statusBanner"
      class="absolute right-0 top-0 rounded-bl-[24rpx] bg-primary/10 px-3 py-1"
    >
      <view
        class="flex items-center gap-1 text-[10px] font-bold uppercase text-primary"
      >
        <text class="material-symbols-outlined text-[12px]">
          shopping_cart
        </text>
        {{ statusBanner }}
      </view>
    </view>

    <view class="flex items-start gap-4">
      <view class="shrink-0">
        <view
          class="checkbox-hit-area flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95"
          :class="checkboxHitAreaClass"
          @click.stop="handleToggle"
        >
          <view
            class="pointer-events-none flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all"
            :class="checkboxClass"
          >
            <text
              v-if="showCheckedIcon"
              class="material-symbols-outlined text-[15px] leading-none text-white"
            >
              check
            </text>
            <text
              v-else-if="item.hasInFridge"
              class="material-symbols-outlined text-sm text-amber-500"
            >
              inventory_2
            </text>
          </view>
        </view>
      </view>

      <view class="min-w-0 flex-1">
        <view class="flex items-start justify-between gap-3">
          <view
            class="min-w-0"
            :class="{ 'pr-20': Boolean(statusBanner) }"
            :style="titleAreaStyle"
          >
            <text
              class="block truncate text-[17px] font-black leading-tight text-slate-900"
              :class="{ 'line-through decoration-slate-400 text-slate-400': item.status === 'purchased' }"
            >
              {{ item.name }}
            </text>
            <text class="mt-1 block text-sm font-medium text-slate-500">
              {{ quantityText }}
            </text>
          </view>

          <view
            v-if="showTopActionBar"
            class="flex shrink-0 items-center gap-2"
          >
            <view
              v-if="showClaimIconButton"
              class="flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer"
              :class="claimIconClass"
              @click.stop="$emit('claim', item.id)"
            >
              <text
                class="material-symbols-outlined text-[18px] leading-none"
                :class="claimIconTextClass"
              >
                {{ claimIconName }}
              </text>
            </view>

            <view
              v-if="showAssignIconButton"
              class="flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer"
              :class="assignButtonClass"
              @click.stop="$emit('assign', item)"
            >
              <view
                v-if="showAssignedAvatar"
                class="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                :class="assigneeAvatarClass"
              >
                {{ assigneeInitial }}
              </view>
              <text
                v-else
                class="material-symbols-outlined block text-[18px] leading-none"
                :class="assignIconTextClass"
              >
                person_add
              </text>
            </view>

            <view
              v-if="showDeleteIconButton"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-400 transition-all cursor-pointer active:opacity-80"
              @click.stop="$emit('delete', item.id)"
            >
              <text class="material-symbols-outlined text-[18px] leading-none">
                delete
              </text>
            </view>
          </view>
        </view>

        <view class="mt-3 flex flex-wrap items-center gap-2 justify-between">
          <view class="flex flex-wrap items-center gap-2">
            <view
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
              :class="sourceBadgeClass"
            >
              <text class="material-symbols-outlined text-[14px]">
                {{ sourceIcon }}
              </text>
              <text>{{ sourceText }}</text>
            </view>
            <CmTag v-if="item.hasInFridge" tone="warning" size="xs">
              冰箱已有
            </CmTag>
          </view>

          <text
            v-if="statusMeta"
            class="text-[11px] text-slate-400"
          >
            {{ statusMeta }}
          </text>
        </view>

        <text
          v-if="item.fridgeMatchedName"
          class="mt-2 block text-[11px] text-amber-600"
        >
          冰箱库存中已有 {{ item.fridgeMatchedName }}
        </text>

      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ShoppingItem } from "@/types/shopping";

const props = defineProps<{
  item: ShoppingItem;
  canAssign?: boolean;
  currentUserId?: string;
  isTransitioningToCompleted?: boolean;
}>();

const emit = defineEmits<{
  toggle: [itemId: string];
  claim: [itemId: string];
  assign: [item: ShoppingItem];
  delete: [itemId: string];
}>();

const secondaryText = computed(() => {
  if (props.item.sourceRecipeTitle) return props.item.sourceRecipeTitle;
  if (props.item.source === "manual") return "手动添加";
  return "";
});

const quantityText = computed(() => `${props.item.quantity}${props.item.unit}`);

const cardClass = computed(() => {
  if (props.isTransitioningToCompleted) {
    return "border border-primary/20 transition-to-completed";
  }

  if (props.item.status === "claimed") {
    return "border-l-4 border-primary";
  }

  return "border border-slate-100";
});

const showCheckedIcon = computed(
  () => props.isTransitioningToCompleted || props.item.status === "purchased",
);

const canToggle = computed(() => {
  if (props.isTransitioningToCompleted) return false;
  if (props.item.hasInFridge) return false;
  if (
    props.item.status === "claimed" &&
    props.item.assignedTo !== props.currentUserId
  ) {
    return false;
  }

  return true;
});

const checkboxHitAreaClass = computed(() =>
  canToggle.value
    ? "cursor-pointer"
    : "cursor-not-allowed opacity-70",
);

const checkboxClass = computed(() => {
  if (showCheckedIcon.value) return "border-primary bg-primary shadow-[0_6px_12px_-8px_rgba(255,157,10,0.85)]";
  if (props.item.hasInFridge) return "border-amber-300 bg-amber-50";
  if (!canToggle.value) return "border-slate-200 bg-slate-50";
  return "border-slate-200 dark:border-gray-600";
});

const assigneeDisplay = computed(() => {
  if (!props.item.assignedToName) return "";
  if (props.item.assignedTo === props.currentUserId) return "我";
  return props.item.assignedToName;
});

const assigneeInitial = computed(() =>
  assigneeDisplay.value ? assigneeDisplay.value.slice(0, 1) : "+",
);

const assigneePillClass = computed(() =>
  props.item.status === "claimed"
    ? "bg-[#a855f7]/10 text-[#7e22ce]"
    : "bg-[#3b82f6]/10 text-[#2563eb]",
);

const assigneeAvatarClass = computed(() =>
  props.item.status === "claimed"
    ? "bg-[#a855f7]/15 text-[#7e22ce]"
    : "bg-[#3b82f6]/15 text-[#2563eb]",
);

const sourceIcon = computed(() =>
  props.item.sourceRecipeTitle ? "restaurant_menu" : "inventory_2",
);

const sourceText = computed(() => secondaryText.value || "家庭补货");

const sourceBadgeClass = computed(() =>
  props.item.sourceRecipeTitle
    ? "bg-orange-50 text-orange-700"
    : "bg-slate-100 text-slate-500",
);

const statusBanner = computed(() => {
  if (props.item.status !== "claimed") return "";
  if (props.item.assignedTo === props.currentUserId) return "我在采购";
  if (props.item.assignedToName) return `${props.item.assignedToName} 采购中`;
  return "正在采购中";
});

const statusMeta = computed(() => {
  if (props.item.status === "claimed") {
    if (props.item.assignedTo === props.currentUserId) return "已由你领取";
    if (props.item.assignedToName) return `由 ${props.item.assignedToName} 领取`;
    return "已被领取";
  }

  if (props.item.status === "purchased") {
    return props.item.purchasedByName || "已买到";
  }

  if (props.item.hasInFridge) {
    return "库存已命中";
  }

  return "";
});

const showClaimAction = computed(
  () => !props.item.assignedTo || props.item.assignedTo === props.currentUserId,
);

const showTopActionBar = computed(
  () =>
    !props.item.hasInFridge &&
    props.item.status !== "purchased" &&
    (
      showClaimIconButton.value ||
      showAssignIconButton.value ||
      showDeleteIconButton.value
    ),
);

const showClaimIconButton = computed(
  () =>
    !props.item.hasInFridge &&
    props.item.status !== "purchased" &&
    showClaimAction.value,
);

const showAssignIconButton = computed(
  () =>
    !props.item.hasInFridge &&
    props.item.status !== "purchased" &&
    Boolean(props.canAssign),
);

const showDeleteIconButton = computed(
  () =>
    !props.item.hasInFridge &&
    props.item.status !== "purchased" &&
    Boolean(props.canAssign),
);

const showAssignedAvatar = computed(
  () => showAssignIconButton.value && Boolean(assigneeDisplay.value),
);

const topActionButtonCount = computed(
  () =>
    Number(showClaimIconButton.value) +
    Number(showAssignIconButton.value) +
    Number(showDeleteIconButton.value),
);

const titleAreaStyle = computed(() => {
  if (topActionButtonCount.value >= 3) {
    return { paddingRight: "112rpx" };
  }

  if (topActionButtonCount.value === 2) {
    return { paddingRight: "76rpx" };
  }

  if (topActionButtonCount.value === 1) {
    return { paddingRight: "40rpx" };
  }

  return {};
});

const claimIconName = computed(() =>
  props.item.assignedTo === props.currentUserId ? "task_alt" : "add_task",
);

const claimIconClass = computed(() =>
  props.item.assignedTo === props.currentUserId
    ? "bg-primary text-white shadow-[0_6px_12px_-8px_rgba(255,157,10,0.85)]"
    : "bg-primary/10 text-primary",
);

const claimIconTextClass = computed(() =>
  props.item.assignedTo === props.currentUserId ? "text-white" : "text-primary",
);

const assignButtonClass = computed(() =>
  showAssignedAvatar.value ? assigneePillClass.value : "bg-slate-100 text-slate-400",
);

const assignIconTextClass = computed(() =>
  showAssignedAvatar.value ? "text-current" : "text-slate-400",
);

function handleToggle() {
  if (!canToggle.value) return;

  emit("toggle", props.item.id);
}
</script>

<style scoped>
.checkbox-hit-area {
  -webkit-tap-highlight-color: transparent;
}

.transition-to-completed {
  animation: complete-item-transition 360ms ease forwards;
}

@keyframes complete-item-transition {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  20% {
    opacity: 1;
    transform: translateY(0) scale(1.01);
  }

  60% {
    opacity: 0.96;
    transform: translateY(0) scale(0.995);
  }

  100% {
    opacity: 0;
    transform: translateY(8rpx) scale(0.97);
  }
}
</style>
