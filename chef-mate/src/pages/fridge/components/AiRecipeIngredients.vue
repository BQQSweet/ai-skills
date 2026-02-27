<template>
  <view class="flex flex-col gap-4 mb-6">
    <view>
      <view class="flex justify-between items-center mb-3">
        <text
          class="text-sm font-bold text-slate-500 uppercase tracking-wider font-display"
        >
          已选食材
        </text>
        <view
          class="text-primary text-sm font-medium flex items-center gap-1 active:opacity-70"
          @click="$emit('add')"
        >
          <text class="material-symbols-outlined text-[18px]">add</text>
          添加
        </view>
      </view>

      <scroll-view
        scroll-x
        class="whitespace-nowrap pb-2"
        :show-scrollbar="false"
      >
        <view class="flex gap-3" v-if="ingredients.length > 0">
          <view
            v-for="(ing, idx) in ingredients"
            :key="idx"
            class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark rounded-full border border-slate-100 dark:border-slate-700 shadow-sm shrink-0"
          >
            <text
              class="font-medium text-slate-700 dark:text-slate-200 text-sm"
            >
              {{ ing }}
            </text>
          </view>
        </view>
        <view v-else class="text-sm text-slate-400 py-2">
          暂未选择食材，正在随机推荐灵感...
        </view>
      </scroll-view>
    </view>

    <button
      class="w-full bg-gradient-to-br from-[#ff9f0a] to-[#ffb340] text-white rounded-2xl py-0 h-14 font-bold text-base shadow-[0_4px_15px_rgba(255,159,10,0.25)] flex items-center justify-center gap-2 transform active:scale-[0.97] transition-all border border-white/20 after:hidden m-0"
      @click="$emit('regenerate')"
    >
      <text class="text-lg">✨</text>
      <text>重新生成其他灵感</text>
    </button>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  ingredients: string[];
}>();

defineEmits<{
  (e: "regenerate"): void;
  (e: "add"): void;
}>();
</script>
