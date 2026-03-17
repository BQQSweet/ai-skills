<template>
  <view class="mt-6">
    <view class="flex items-center justify-between mb-3">
      <text class="text-base font-bold">切换家庭组</text>
      <text class="text-xs text-text-muted">已加入 {{ groups.length }} 个家庭组</text>
    </view>
    <view class="flex flex-col gap-3">
      <view
        v-for="group in groups"
        :key="group.id"
        class="rounded-[24rpx] bg-white px-4 py-4 border transition-all"
        :class="
          group.id === currentGroupId
            ? 'border-primary shadow-[0_14px_35px_-25px_rgba(245,158,11,0.75)]'
            : 'border-transparent'
        "
        @click="$emit('switch', group.id)"
      >
        <view class="flex items-center gap-3">
          <view
            class="w-11 h-11 rounded-2xl flex items-center justify-center"
            :class="group.id === currentGroupId ? 'bg-primary text-white' : 'bg-[#fff4df] text-primary'"
          >
            <text class="material-symbols-outlined text-xl">kitchen</text>
          </view>
          <view class="flex-1 min-w-0">
            <text class="block text-sm font-bold truncate">{{ group.name }}</text>
            <text class="block text-xs text-text-muted">
              {{ group.memberCount || group.members?.length || 0 }} 位成员 · {{ roleLabels[group.role] }}
            </text>
          </view>
          <view
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
            :class="group.id === currentGroupId ? 'border-primary' : 'border-slate-300'"
          >
            <view
              v-if="group.id === currentGroupId"
              class="w-2.5 h-2.5 rounded-full bg-primary"
            ></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { GroupInfo, GroupRole } from "@/types/group";

defineProps<{
  groups: GroupInfo[];
  currentGroupId: string;
  roleLabels: Record<GroupRole, string>;
}>();

defineEmits<{
  switch: [groupId: string];
}>();
</script>
