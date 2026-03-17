<template>
  <view class="mt-6 rounded-[24rpx] bg-[#fff7f3] border border-[#ffd9c8] px-4 py-4">
    <text class="block text-sm font-bold text-[#b45309]">危险操作</text>
    <text class="mt-1 block text-xs text-[#c27a40]">
      {{ isOwner ? "解散后当前家庭组会失效，且无法恢复。" : "退出后你将无法再访问当前家庭组的数据。" }}
    </text>
    <view
      class="mt-4 h-12 rounded-full flex items-center justify-center font-bold text-white"
      :class="isOwner ? 'bg-[#ef4444]' : 'bg-slate-500'"
      @click="handleAction"
    >
      <text>{{ isOwner ? "解散家庭组" : "退出家庭组" }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOwner: boolean;
}>();

const emit = defineEmits(["leave", "disband"]);

function handleAction() {
  emit(props.isOwner ? "disband" : "leave");
}
</script>
