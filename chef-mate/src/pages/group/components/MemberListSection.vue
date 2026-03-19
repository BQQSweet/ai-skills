<template>
  <view class="mt-6">
    <view class="flex items-center justify-between mb-3">
      <text class="text-base font-bold">家庭成员</text>
      <text class="text-xs text-text-muted">共 {{ members.length }} 人</text>
    </view>
    <view class="rounded-[24rpx] bg-white px-4 py-3 shadow-soft">
      <view
        v-for="member in members"
        :key="member.id"
        class="flex items-center gap-3 py-3"
        :class="{ 'border-b border-slate-100': member.id !== members[members.length - 1]?.id }"
      >
        <image
          class="w-12 h-12 rounded-full bg-slate-100 border border-white shadow-sm"
          :src="resolveAvatarUrl(member.avatarUrl)"
          mode="aspectFill"
        />
        <view class="flex-1 min-w-0">
          <text class="block text-sm font-bold truncate">{{ member.nickname }}</text>
          <text class="block text-xs text-text-muted">
            {{ member.phone || "ChefMate 家庭成员" }}
          </text>
        </view>
        <CmTag
          :tone="roleTones[member.role]"
          :variant="member.role === 'owner' ? 'solid' : 'soft'"
          size="xs"
        >
          {{ roleLabels[member.role] }}
        </CmTag>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import CmTag from "@/components/CmTag/CmTag.vue";
import type { GroupMemberInfo, GroupRole } from "@/types/group";
import { resolveAvatarUrl } from "@/utils/avatar";

defineProps<{
  members: GroupMemberInfo[];
  roleLabels: Record<GroupRole, string>;
  roleTones: Record<GroupRole, "primary" | "info" | "neutral">;
}>();
</script>
