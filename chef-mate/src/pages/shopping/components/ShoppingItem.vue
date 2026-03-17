<template>
  <view
    class="relative overflow-hidden rounded-[24rpx] bg-white p-4 shadow-[0_4px_20px_-2px_rgba(29,22,12,0.05)] transition-all"
    :class="cardClass"
  >
    <view
      v-if="statusBanner"
      class="absolute right-0 top-0 rounded-bl-[24rpx] bg-primary/10 px-3 py-1"
    >
      <view class="flex items-center gap-1 text-[10px] font-bold uppercase text-primary">
        <text class="material-symbols-outlined text-[12px]">shopping_cart</text>
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

          <view v-if="showTopActionBar" class="flex shrink-0 items-center gap-2">
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
              <text class="material-symbols-outlined text-[18px] leading-none">delete</text>
            </view>
          </view>
        </view>

        <view class="mt-3 flex flex-wrap items-center gap-2 justify-between">
          <view class="flex flex-wrap items-center gap-2">
            <CmTag tone="warning">
              <text>{{ sourceText }}</text>
            </CmTag>
            <CmTag v-if="item.hasInFridge" tone="warning" size="xs">冰箱已有</CmTag>
          </view>

          <text v-if="statusMeta" class="text-[11px] text-slate-400">
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
import type { ShoppingItem } from "@/types/shopping";
import CmTag from "@/components/CmTag/CmTag.vue";
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
