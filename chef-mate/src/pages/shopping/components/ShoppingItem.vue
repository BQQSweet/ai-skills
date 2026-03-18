<template>
  <view
    class="relative overflow-hidden rounded-[24rpx] bg-white p-4 shadow-[0_4px_20px_-2px_rgba(29,22,12,0.05)] transition-all"
    :class="cardClass"
  >
    <ShoppingItemStatus
      :status-banner="statusBanner"
      :source-text="sourceText"
      :status-meta="statusMeta"
      :has-in-fridge="item.hasInFridge"
      :fridge-matched-name="item.fridgeMatchedName"
    />

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
              :class="{
                'line-through decoration-slate-400 text-slate-400':
                  item.status === 'purchased',
              }"
            >
              {{ item.name }}
            </text>
            <text class="mt-1 block text-sm font-medium text-slate-500">
              {{ quantityText }}
            </text>
          </view>

          <ShoppingItemActions
            :show-top-action-bar="showTopActionBar"
            :show-claim-icon-button="showClaimIconButton"
            :show-assign-icon-button="showAssignIconButton"
            :show-delete-icon-button="showDeleteIconButton"
            :show-assigned-avatar="showAssignedAvatar"
            :assignee-initial="assigneeInitial"
            :assignee-avatar-class="assigneeAvatarClass"
            :claim-icon-name="claimIconName"
            :claim-icon-class="claimIconClass"
            :claim-icon-text-class="claimIconTextClass"
            :assign-button-class="assignButtonClass"
            :assign-icon-text-class="assignIconTextClass"
            @claim="$emit('claim', item.id)"
            @assign="$emit('assign', item)"
            @delete="$emit('delete', item.id)"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ShoppingItem } from "@/types/shopping";
import ShoppingItemActions from "./ShoppingItemActions.vue";
import ShoppingItemStatus from "./ShoppingItemStatus.vue";
import { useShoppingItemPresentation } from "../composables/useShoppingItemPresentation";

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

const {
  quantityText,
  cardClass,
  showCheckedIcon,
  checkboxHitAreaClass,
  checkboxClass,
  assigneeInitial,
  assigneeAvatarClass,
  sourceText,
  statusBanner,
  statusMeta,
  showClaimIconButton,
  showAssignIconButton,
  showDeleteIconButton,
  showTopActionBar,
  showAssignedAvatar,
  titleAreaStyle,
  claimIconName,
  claimIconClass,
  claimIconTextClass,
  assignButtonClass,
  assignIconTextClass,
  canToggle,
} = useShoppingItemPresentation({
  item: () => props.item,
  canAssign: () => Boolean(props.canAssign),
  currentUserId: () => props.currentUserId,
  isTransitioningToCompleted: () => Boolean(props.isTransitioningToCompleted),
});

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
