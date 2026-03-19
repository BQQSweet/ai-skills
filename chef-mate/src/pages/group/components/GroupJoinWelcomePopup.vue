<template>
  <CmBottomSheet
    :show="show"
    :close-on-click-overlay="true"
    :drag-to-close="true"
    :show-drag-handle="true"
    :safe-area-inset-bottom="true"
    panel-class="group-join-welcome-sheet"
    @update:show="handleShowChange"
  >
    <view class="relative overflow-hidden px-6 pb-8 pt-2 text-center">
      <view
        class="pointer-events-none absolute inset-x-10 top-10 h-36 rounded-full bg-primary/10 blur-3xl"
      ></view>

      <view
        class="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 active:scale-[0.98]"
        @click="emit('update:show', false)"
      >
        <text class="material-symbols-outlined text-[24px]">close</text>
      </view>

      <view class="relative flex justify-center py-6">
        <view class="relative flex h-44 w-44 items-center justify-center">
          <view class="absolute left-6 top-4 h-3 w-3 rounded-full bg-primary/25"></view>
          <view class="absolute right-5 top-12 h-4 w-4 rounded-full bg-primary/45"></view>
          <view class="absolute bottom-6 left-1/2 h-2.5 w-2.5 rounded-full bg-primary/30"></view>
          <view class="absolute right-8 top-24 h-3 w-3 rotate-12 bg-primary/15"></view>

          <view class="flex items-center -space-x-4">
            <view
              class="flex h-24 w-24 items-center justify-center rounded-[28rpx] bg-primary text-white shadow-[0_18px_36px_-20px_rgba(255,157,10,0.75)] rotate-[-10deg]"
            >
              <text class="material-symbols-outlined text-[52px]">restaurant</text>
            </view>
            <view
              class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/15 bg-white text-primary shadow-[0_20px_42px_-24px_rgba(29,22,12,0.38)] rotate-[8deg]"
            >
              <text class="material-symbols-outlined text-[52px]">celebration</text>
            </view>
          </view>
        </view>
      </view>

      <view class="relative">
        <text class="block text-[34rpx] font-black tracking-[0.02em] text-slate-900">
          欢迎加入！
        </text>
        <text class="mt-3 block text-[30rpx] leading-[44rpx] text-slate-500">
          你已成功加入
          <text class="font-semibold text-primary">“{{ groupName }}”</text>
          协作厨房。
        </text>
      </view>

      <view class="relative mt-10 flex flex-col items-center">
        <view class="mb-4 flex items-center justify-center -space-x-4">
          <view
            v-for="member in displayedMembers"
            :key="member.id"
            class="relative h-14 w-14 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-sm"
          >
            <image
              class="h-full w-full object-cover"
              :src="resolveAvatarUrl(member.avatarUrl)"
              mode="aspectFill"
            />
          </view>
          <view
            v-if="overflowCount > 0"
            class="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-primary/15 text-sm font-black text-primary shadow-sm"
          >
            +{{ overflowCount }}
          </view>
        </view>

        <text class="text-[24rpx] font-medium leading-7 text-slate-400">
          {{ welcomeMessage }}
        </text>
      </view>

      <view class="relative pt-8">
        <view
          class="flex h-14 items-center justify-center rounded-[28rpx] bg-primary text-base font-black text-white shadow-[0_16px_34px_-20px_rgba(255,157,10,0.75)] active:scale-[0.98]"
          @click="emit('enter')"
        >
          <text>开启厨房之旅</text>
        </view>
        <text class="mt-4 block text-[22rpx] tracking-[0.22em] text-slate-300">
          CHEFMATE · FAMILY KITCHEN
        </text>
      </view>
    </view>
  </CmBottomSheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CmBottomSheet from "@/components/CmBottomSheet/CmBottomSheet.vue";
import type { GroupMemberInfo } from "@/types/group";
import { resolveAvatarUrl } from "@/utils/avatar";

const props = defineProps<{
  show: boolean;
  groupName: string;
  members: GroupMemberInfo[];
  currentUserId: string;
}>();

const emit = defineEmits<{
  "update:show": [value: boolean];
  enter: [];
}>();

const otherMembers = computed(() =>
  props.members.filter((member) => member.id !== props.currentUserId),
);
const displayedMembers = computed(() => otherMembers.value.slice(0, 2));
const overflowCount = computed(() => Math.max(0, otherMembers.value.length - 2));

const welcomeMessage = computed(() => {
  if (otherMembers.value.length === 0) {
    return "你的家庭厨房已经准备好了，开始一起协作吧";
  }

  const displayedNames = displayedMembers.value.map((member) => member.nickname);
  return `${displayedNames.join("、")}正在等你一起下厨`;
});

function handleShowChange(value: boolean) {
  emit("update:show", value);
}
</script>

<style scoped>
:deep(.group-join-welcome-sheet) {
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  background: linear-gradient(180deg, #fffefb 0%, #ffffff 100%);
  box-shadow: 0 -16px 48px -28px rgba(29, 22, 12, 0.38);
}
</style>
