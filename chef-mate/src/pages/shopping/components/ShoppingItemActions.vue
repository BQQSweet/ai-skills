<template>
  <view v-if="showTopActionBar" class="flex shrink-0 items-center gap-2">
    <view
      v-if="showClaimIconButton"
      class="flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer"
      :class="claimIconClass"
      @click.stop="$emit('claim')"
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
      @click.stop="$emit('assign')"
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
      @click.stop="$emit('delete')"
    >
      <text class="material-symbols-outlined text-[18px] leading-none">delete</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  showTopActionBar: boolean;
  showClaimIconButton: boolean;
  showAssignIconButton: boolean;
  showDeleteIconButton: boolean;
  showAssignedAvatar: boolean;
  assigneeInitial: string;
  assigneeAvatarClass: string;
  claimIconName: string;
  claimIconClass: string;
  claimIconTextClass: string;
  assignButtonClass: string;
  assignIconTextClass: string;
}>();

defineEmits<{
  claim: [];
  assign: [];
  delete: [];
}>();
</script>
