<template>
  <view class="mt-auto px-6 py-8 bg-white/50 dark:bg-gray-900/50 rounded-t-xl">
    <view class="flex items-center justify-between mb-4">
      <text class="text-sm font-bold text-text-main dark:text-white">
        当前厨房成员
      </text>
      <view
        v-if="isOwner"
        @click="$emit('refresh-code')"
        class="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
      >
        <text class="material-symbols-outlined text-text-muted text-sm">
          refresh
        </text>
        <text class="text-xs text-text-muted">刷新邀请码</text>
      </view>
    </view>

    <view class="flex items-center gap-4 overflow-x-auto pb-2">
      <view
        v-for="member in members"
        :key="member.id"
        class="flex flex-col items-center gap-1 shrink-0"
      >
        <view
          class="w-12 h-12 rounded-full overflow-hidden"
          :class="
            member.role === 'owner'
              ? 'border-2 border-primary ring-2 ring-white dark:ring-gray-900'
              : 'border-2 border-transparent'
          "
        >
          <image
            class="w-full h-full object-cover"
            :src="resolveAvatarUrl(member.avatarUrl)"
            mode="aspectFill"
          />
        </view>
        <text class="text-[10px] font-medium text-text-sub">
          {{ member.nickname }}
        </text>
      </view>

      <view class="flex flex-col items-center gap-1 shrink-0">
        <view
          class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-dashed border-primary/40 text-primary"
        >
          <text class="material-symbols-outlined text-xl">add</text>
        </view>
        <text class="text-[10px] font-medium text-primary">待加入</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { GroupMemberInfo } from "@/types/group";
import { resolveAvatarUrl } from "@/utils/avatar";

defineProps<{
  members: GroupMemberInfo[];
  isOwner: boolean;
}>();

defineEmits<{
  "refresh-code": [];
}>();
</script>
