<template>
  <view
    class="mt-4 rounded-[24rpx] border-2 border-dashed border-primary/20 bg-white px-4 py-4 transition-all"
    :class="show ? 'shadow-soft' : ''"
  >
    <view
      class="flex items-center justify-between gap-3 cursor-pointer"
      @click="$emit('toggle')"
    >
      <view class="flex items-center gap-3">
        <view
          class="w-11 h-11 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"
        >
          <text class="material-symbols-outlined text-xl">add</text>
        </view>
        <view>
          <text class="block text-sm font-bold text-slate-900">创建或加入新厨房</text>
          <text class="block text-xs text-text-muted">
            可继续创建家庭组，或通过邀请码加入其他厨房
          </text>
        </view>
      </view>
      <text class="material-symbols-outlined text-text-muted">
        {{ show ? "expand_less" : "expand_more" }}
      </text>
    </view>

    <view v-if="show" class="mt-4 flex flex-col gap-4">
      <view class="rounded-[20rpx] bg-[#fff9ef] px-4 py-4 border border-primary/10">
        <text class="block text-sm font-bold text-slate-900">创建新厨房</text>
        <text class="mt-1 block text-xs text-text-muted">
          创建一个新的家庭协作空间，并自动切换到新厨房
        </text>
        <view class="mt-3">
          <CmInput
            :model-value="newGroupName"
            dark
            placeholder="例如：周末聚会组"
            inputClass="bg-white border border-transparent focus:border-primary"
            @update:model-value="$emit('update:newGroupName', String($event))"
          />
        </view>
        <view
          class="mt-3 h-11 rounded-full bg-primary text-white font-bold flex items-center justify-center"
          :class="creatingGroup ? 'opacity-70' : ''"
          @click="$emit('create')"
        >
          <text>{{ creatingGroup ? "创建中..." : "创建家庭组" }}</text>
        </view>
      </view>

      <view class="rounded-[20rpx] bg-[#f8fafc] px-4 py-4 border border-slate-100">
        <text class="block text-sm font-bold text-slate-900">加入其他厨房</text>
        <text class="mt-1 block text-xs text-text-muted">
          输入家人或朋友分享的 6 位邀请码，加入已有厨房
        </text>
        <view class="mt-3 flex gap-2 justify-between">
          <input
            v-for="(_, index) in 6"
            :key="index"
            :value="inviteCodeArr[index]"
            class="w-10 h-11 text-center text-lg font-black rounded-xl border border-slate-200 bg-white text-slate-900"
            type="text"
            maxlength="1"
            placeholder="•"
            :focus="focusIndex === index"
            @input="$emit('invite-input', index, $event)"
            @focus="$emit('update:focusIndex', index)"
          />
        </view>
        <view
          class="mt-3 h-11 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center"
          :class="joiningGroup ? 'opacity-70' : ''"
          @click="$emit('join')"
        >
          <text>{{ joiningGroup ? "加入中..." : "加入家庭组" }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import CmInput from "@/components/CmInput/CmInput.vue";

defineProps<{
  show: boolean;
  newGroupName: string;
  inviteCodeArr: string[];
  focusIndex: number;
  creatingGroup: boolean;
  joiningGroup: boolean;
}>();

defineEmits<{
  toggle: [];
  create: [];
  join: [];
  "update:newGroupName": [value: string];
  "update:focusIndex": [index: number];
  "invite-input": [index: number, event: any];
}>();
</script>
