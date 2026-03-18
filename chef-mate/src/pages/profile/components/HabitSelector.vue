<template>
  <view>
    <text class="text-lg font-bold text-slate-900 mb-4 block">饮食习惯</text>
    <view class="flex flex-col gap-3">
      <view
        v-for="habit in options"
        :key="habit.id"
        @click="$emit('toggle', habit.id)"
        :class="[
          'relative flex items-center p-4 rounded-2xl shadow-sm transition-colors',
          values.includes(habit.id)
            ? 'bg-white border-2 border-primary'
            : 'bg-white border border-slate-100',
        ]"
      >
        <view
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center mr-4',
            habit.iconBg,
            habit.iconColor,
          ]"
        >
          <text class="material-symbols-outlined text-2xl">{{ habit.icon }}</text>
        </view>
        <view class="flex-1">
          <text class="font-bold text-slate-900 block">{{ habit.title }}</text>
          <text class="text-xs text-slate-500 block">{{ habit.desc }}</text>
        </view>
        <text
          v-if="values.includes(habit.id)"
          class="material-symbols-outlined text-primary"
          >check_circle</text
        >
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  options: readonly {
    id: string;
    title: string;
    desc: string;
    icon: string;
    iconBg: string;
    iconColor: string;
  }[];
  values: string[];
}>();

defineEmits<{
  toggle: [id: string];
}>();
</script>
