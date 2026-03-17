<template>
  <view
    class="mt-2 overflow-hidden rounded-[28rpx] bg-white shadow-[0_18px_45px_-24px_rgba(245,158,11,0.55)] border border-primary/10"
  >
    <view class="px-6 py-5 bg-gradient-to-br from-primary/15 via-[#fff4df] to-white">
      <view class="flex items-start justify-between gap-4">
        <view>
          <text class="block text-xs font-semibold tracking-[0.3em] text-primary/80">
            CURRENT KITCHEN
          </text>
          <text class="mt-2 block text-[28px] font-black leading-tight">
            {{ group.name }}
          </text>
          <text class="mt-2 block text-sm text-text-muted">
            {{ memberCount }} 位成员正在协作
          </text>
        </view>
        <CmTag :tone="isOwner ? 'primary' : 'neutral'" :variant="isOwner ? 'solid' : 'soft'" size="xs">
          {{ roleLabel }}
        </CmTag>
      </view>

      <view class="mt-5 rounded-2xl border border-primary/15 bg-white/80 px-4 py-4">
        <text class="block text-xs font-semibold tracking-[0.24em] text-primary/70">
          INVITE CODE
        </text>
        <view class="mt-2 flex items-center justify-between gap-3">
          <text class="text-[30px] font-black tracking-[0.22em] text-slate-900">
            {{ group.inviteCode }}
          </text>
          <view
            class="shrink-0 rounded-full bg-primary/10 px-3 py-2 text-primary"
            @click="$emit('copy')"
          >
            <text class="material-symbols-outlined text-lg">content_copy</text>
          </view>
        </view>
      </view>

      <view
        v-if="isOwner"
        class="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-white font-bold shadow-[0_10px_20px_-10px_rgba(255,157,10,0.75)]"
        @click="$emit('invite')"
      >
        <text class="material-symbols-outlined text-lg">group_add</text>
        <text>邀请成员</text>
      </view>
      <text v-else class="mt-4 block text-xs text-text-muted">
        当前仅组长可邀请成员或刷新邀请码。
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import CmTag from "@/components/CmTag/CmTag.vue";
import type { GroupInfo } from "@/types/group";

defineProps<{
  group: GroupInfo;
  memberCount: number;
  isOwner: boolean;
  roleLabel: string;
}>();

defineEmits<{
  copy: [];
  invite: [];
}>();
</script>
