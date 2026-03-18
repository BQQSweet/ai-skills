<template>
  <view class="px-6 pt-8 pb-4">
    <text
      class="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4 block"
    >
      我的厨房
    </text>
    <view class="grid grid-cols-2 gap-4">
      <view
        v-for="card in cards"
        :key="card.key"
        class="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800"
        :class="{ 'cursor-pointer': card.key === 'family' }"
        @click="card.key === 'family' && $emit('open-group')"
      >
        <view
          class="w-12 h-12 rounded-full flex items-center justify-center"
          :class="card.iconClass"
        >
          <text class="material-symbols-outlined">{{ card.icon }}</text>
        </view>
        <view>
          <text
            class="text-slate-900 dark:text-slate-100 font-bold text-sm block"
          >
            {{ card.title }}
          </text>
          <text class="text-slate-400 text-[10px] block">
            {{ card.key === 'family' ? familyMemberText : card.helper }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  cards: readonly {
    key: string;
    title: string;
    helper: string;
    icon: string;
    iconClass: string;
  }[];
  familyMemberText: string;
}>();

defineEmits<{
  "open-group": [];
}>();
</script>
