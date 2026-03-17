<template>
  <u-popup :show="show" mode="bottom" :round="32" @close="$emit('update:show', false)">
    <view class="rounded-t-[40rpx] bg-white px-6 pb-8 pt-4">
      <view class="mx-auto h-2 w-24 rounded-full bg-[#f5ddc0]"></view>

      <view class="mt-8 flex items-center justify-between">
        <view class="w-10"></view>
        <text class="text-[22px] font-black text-slate-900">分配采购任务</text>
        <view
          class="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 cursor-pointer active:opacity-70"
          @click="$emit('update:show', false)"
        >
          <text class="material-symbols-outlined text-[28px]">close</text>
        </view>
      </view>

      <view
        v-if="item"
        class="mt-6 flex items-center gap-4 rounded-[32rpx] border border-primary/20 bg-[#fffaf2] px-5 py-5"
      >
        <view
          class="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28rpx] bg-gradient-to-br from-[#ffe2bf] via-[#fff2dd] to-white text-primary shadow-[0_12px_28px_-18px_rgba(255,157,10,0.7)]"
        >
          <text class="material-symbols-outlined text-[36px]">{{ categoryIcon }}</text>
        </view>

        <view class="min-w-0 flex-1">
          <text class="block text-sm font-bold text-primary">{{ categoryLabel }}</text>
          <text class="mt-2 block text-[24px] font-black leading-tight text-slate-900">
            {{ item.name }} {{ item.quantity }}{{ item.unit }}
          </text>
          <text class="mt-2 block text-sm text-slate-400">
            {{
              item.sourceRecipeTitle
                ? `来自食谱：${item.sourceRecipeTitle}`
                : `手动添加 · ${categoryLabel}`
            }}
          </text>
        </view>
      </view>

      <view class="mt-10 flex items-center justify-between">
        <text class="text-[20px] font-black text-slate-900">选择家庭成员</text>
        <text class="text-sm font-semibold text-slate-400">单选</text>
      </view>

      <view class="mt-5 flex flex-col gap-3">
        <view
          v-for="member in members"
          :key="member.id"
          class="flex items-center gap-3 rounded-[28rpx] border bg-white px-4 py-4 transition-all cursor-pointer"
          :class="
            selectedAssigneeId === member.id
              ? 'border-primary bg-[#fffaf2] shadow-[0_16px_35px_-24px_rgba(255,157,10,0.75)]'
              : 'border-transparent shadow-soft'
          "
          @click="$emit('select', member.id)"
        >
          <image
            class="h-12 w-12 shrink-0 rounded-full border-2 border-white bg-[#fff1df] shadow-sm"
            :src="member.avatarUrl || defaultAvatar"
            mode="aspectFill"
          />
          <view class="min-w-0 flex-1">
            <text class="block truncate text-[16px] font-black text-slate-900">
              {{ member.nickname }}
            </text>
            <text
              class="mt-0.5 block text-[15px] font-semibold"
              :class="selectedAssigneeId === member.id ? 'text-primary' : 'text-slate-400'"
            >
              {{ roleLabels[member.role] }}
            </text>
          </view>
          <view
            class="flex h-6 w-6 items-center justify-center rounded-full border"
            :class="selectedAssigneeId === member.id ? 'border-primary bg-primary text-white' : 'border-slate-200'"
          >
            <text
              v-if="selectedAssigneeId === member.id"
              class="material-symbols-outlined text-[14px]"
            >
              check
            </text>
          </view>
        </view>
      </view>

      <view
        class="mt-8 flex h-14 items-center justify-center rounded-full bg-primary font-bold text-white shadow-[0_14px_30px_-18px_rgba(255,157,10,0.75)]"
        :class="assigning ? 'opacity-60' : 'active:scale-[0.98]'"
        @click="$emit('confirm')"
      >
        <text>{{ assigning ? "分配中..." : "确认分配" }}</text>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import type { GroupMemberInfo, GroupRole } from "@/types/group";
import type { ShoppingItem } from "@/types/shopping";
import defaultAvatar from "@/static/svgs/default_avatar.svg";

defineProps<{
  show: boolean;
  item: ShoppingItem | null;
  members: GroupMemberInfo[];
  selectedAssigneeId: string;
  assigning: boolean;
  categoryLabel: string;
  categoryIcon: string;
  roleLabels: Record<GroupRole, string>;
}>();

defineEmits<{
  "update:show": [value: boolean];
  select: [memberId: string];
  confirm: [];
}>();
</script>
