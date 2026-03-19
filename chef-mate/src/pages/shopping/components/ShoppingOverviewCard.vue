<template>
  <view
    class="mt-2 overflow-hidden rounded-[28rpx] border border-primary/10 bg-white shadow-[0_18px_45px_-24px_rgba(245,158,11,0.55)]"
  >
    <view
      class="bg-gradient-to-br from-[#fffaf2] via-[#fdf2e3] to-[#fee1bb] px-5 pb-5 pt-5"
    >
      <view class="flex items-start justify-between gap-4">
        <view class="min-w-0 flex-1">
          <view class="mt-2 flex items-center gap-2">
            <text class="min-w-0 flex-1 truncate text-[28px] font-black leading-tight text-slate-900">
              {{ title }}
            </text>
            <view
              v-if="showListSwitcherTrigger"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm active:scale-95"
              @click="$emit('open-list-switcher')"
            >
              <text class="material-symbols-outlined text-[20px]">keyboard_arrow_down</text>
            </view>
          </view>
          <text class="mt-2 block text-sm text-text-muted">
            {{ subtitle }}
          </text>
        </view>
        <CmTag :tone="isRecipeList ? 'primary' : 'neutral'" :variant="isRecipeList ? 'solid' : 'soft'" size="xs">
          {{ sourceLabel }}
        </CmTag>
      </view>

      <view class="mt-6 flex items-end justify-between gap-4">
        <view>
          <view class="mt-2 flex items-end gap-2">
            <text class="text-[34px] font-black leading-none text-slate-900">
              {{ progress }}%
            </text>
            <text class="pb-1 text-xs font-semibold text-primary">
              {{ progressStatus }}
            </text>
          </view>
        </view>

        <view v-if="activeMembers.length > 0" class="flex items-center -space-x-3">
          <image
            v-for="member in activeMembers.slice(0, 3)"
            :key="member.id"
            class="h-10 w-10 rounded-full border-2 border-white object-cover"
            :src="resolveAvatarUrl(member.avatarUrl)"
            mode="aspectFill"
          />
          <view
            v-if="activeMembers.length > 3"
            class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-bold text-slate-500"
          >
            +{{ activeMembers.length - 3 }}
          </view>
        </view>

        <view
          v-else-if="groupMemberCount > 0"
          class="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-slate-500"
        >
          {{ groupMemberCount }} 人待命
        </view>

        <view
          v-else
          class="rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
          @click="$emit('invite-members')"
        >
          邀请家人
        </view>
      </view>

      <view class="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/80">
        <view
          class="h-full rounded-full bg-primary transition-all duration-1000"
          :style="{ width: progress + '%' }"
        ></view>
      </view>

      <view class="mt-5 flex justify-between">
        <CmTag variant="soft" tone="primary" size="sm">
          <view class="flex items-center gap-1">
            <text>进行中</text>
            <text>{{ claimedCount }}</text>
          </view>
        </CmTag>
        <CmTag variant="soft" tone="neutral" size="sm">
          <view class="flex items-center gap-1">
            <text>待处理</text>
            <text>{{ pendingCount }}</text>
          </view>
        </CmTag>
        <CmTag variant="soft" tone="success" size="sm">
          <view class="flex items-center gap-1">
            <text>已买到</text>
            <text>{{ purchasedCount }}</text>
          </view>
        </CmTag>
        <CmTag variant="soft" tone="warning" size="sm">
          <view class="flex items-center gap-1">
            <text>冰箱已有</text>
            <text>{{ inFridgeCount }}</text>
          </view>
        </CmTag>
      </view>

      <text v-if="activeMembers.length > 0" class="mt-4 block text-xs text-text-muted">
        {{ activeMemberNames }} 正在外出采购
      </text>
      <text v-else-if="groupMemberCount > 0" class="mt-4 block text-xs text-text-muted">
        你们家一共有 {{ groupMemberCount }} 位成员可参与这次协作采购
      </text>
      <text v-else class="mt-4 block text-xs text-text-muted">
        还没有家庭成员加入，先邀请家人再一起分工会更高效
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import CmTag from "@/components/CmTag/CmTag.vue";
import type { ShoppingActiveMember } from "../constants/shopping";
import { resolveAvatarUrl } from "@/utils/avatar";

defineProps<{
  title: string;
  subtitle: string;
  sourceLabel: string;
  isRecipeList: boolean;
  showListSwitcherTrigger?: boolean;
  progress: number;
  progressStatus: string;
  activeMembers: ShoppingActiveMember[];
  groupMemberCount: number;
  activeMemberNames: string;
  claimedCount: number;
  pendingCount: number;
  purchasedCount: number;
  inFridgeCount: number;
}>();

defineEmits<{
  "invite-members": [];
  "open-list-switcher": [];
}>();
</script>
