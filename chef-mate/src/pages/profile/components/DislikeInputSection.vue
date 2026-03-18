<template>
  <view>
    <text class="text-lg font-bold text-slate-900 mb-4 block">不想吃</text>
    <view class="relative flex mb-4 items-center gap-1">
      <CmInput
        class="flex-1"
        :model-value="draft"
        placeholder="输入并回车添加不想吃的食材"
        type="text"
        @update:model-value="$emit('update:draft', String($event))"
      >
        <template #suffix>
          <view
            class="border-white bg-primary shadow-md shadow-primary-light border-3 rounded-full h-10 w-12 flex items-center justify-center ml-2"
          >
            <text
              @click="$emit('add')"
              class="material-symbols-outlined text-2xl text-white active:text-slate-600"
              >check</text
            >
          </view>
        </template>
      </CmInput>
    </view>
    <view class="flex flex-wrap gap-2">
      <view
        v-for="(item, index) in values"
        :key="item"
        class="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-full text-slate-700 text-sm font-medium"
      >
        {{ item }}
        <text
          @click="$emit('remove', index)"
          class="material-symbols-outlined text-base text-slate-400 active:text-slate-600"
          >close</text
        >
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import CmInput from "@/components/CmInput/CmInput.vue";

defineProps<{
  draft: string;
  values: string[];
}>();

defineEmits<{
  "update:draft": [value: string];
  add: [];
  remove: [index: number];
}>();
</script>
