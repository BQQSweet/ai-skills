<template>
  <view class="px-6 py-4 flex justify-center gap-8">
    <view
      v-for="item in items"
      :key="item.key"
      @click="handleClick(item.key)"
      class="flex flex-col items-center gap-2 cursor-pointer"
    >
      <view
        class="w-12 h-12 rounded-full flex items-center justify-center"
        :class="item.iconClass"
      >
        <text class="material-symbols-outlined">{{ item.icon }}</text>
      </view>
      <text class="text-xs text-text-muted">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const items = [
  {
    key: "wechat",
    label: "微信好友",
    icon: "chat",
    iconClass: "bg-green-500/10 text-green-600",
  },
  {
    key: "moments",
    label: "朋友圈",
    icon: "camera",
    iconClass: "bg-primary/10 text-primary",
  },
  {
    key: "more",
    label: "更多",
    icon: "more_horiz",
    iconClass:
      "bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-slate-300",
  },
] as const;

const emit = defineEmits<{
  wechat: [];
  moments: [];
  more: [];
}>();

function handleClick(key: (typeof items)[number]["key"]) {
  if (key === "wechat") {
    emit("wechat");
    return;
  }

  if (key === "moments") {
    emit("moments");
    return;
  }

  emit("more");
}
</script>
