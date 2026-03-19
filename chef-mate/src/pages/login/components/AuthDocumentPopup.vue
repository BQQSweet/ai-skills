<template>
  <u-popup
    :show="show"
    mode="bottom"
    :round="28"
    @close="$emit('update:show', false)"
  >
    <view v-if="document" class="px-6 pb-8 pt-6">
      <view class="mb-4 flex items-start justify-between gap-4">
        <view>
          <text class="block text-[22px] font-black text-slate-900">
            {{ document.title }}
          </text>
          <text class="mt-2 block text-sm leading-6 text-slate-500">
            {{ document.summary }}
          </text>
          <text class="mt-1 block text-xs text-slate-400">
            最近更新：{{ document.updatedAt }}
          </text>
        </view>
        <view
          class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
          @click="$emit('update:show', false)"
        >
          <text class="material-symbols-outlined text-[20px]">close</text>
        </view>
      </view>

      <scroll-view scroll-y class="max-h-[60vh] pr-1">
        <view class="flex flex-col gap-5">
          <view
            v-for="section in document.sections"
            :key="section.title"
            class="rounded-[28rpx] bg-slate-50 px-4 py-4"
          >
            <text class="block text-base font-bold text-slate-900">
              {{ section.title }}
            </text>
            <text
              v-for="paragraph in section.paragraphs"
              :key="paragraph"
              class="mt-2 block text-sm leading-7 text-slate-600"
            >
              {{ paragraph }}
            </text>
          </view>
        </view>
      </scroll-view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import type { AuthDocumentContent } from "../constants/auth-documents";

defineProps<{
  show: boolean;
  document: AuthDocumentContent | null;
}>();

defineEmits<{
  "update:show": [value: boolean];
}>();
</script>
