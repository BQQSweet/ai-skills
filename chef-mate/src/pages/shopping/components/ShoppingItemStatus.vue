<template>
  <view>
    <view
      v-if="statusBanner"
      class="absolute right-0 top-0 rounded-bl-[24rpx] bg-primary/10 px-3 py-1"
    >
      <view class="flex items-center gap-1 text-[10px] font-bold uppercase text-primary">
        <text class="material-symbols-outlined text-[12px]">shopping_cart</text>
        {{ statusBanner }}
      </view>
    </view>

    <view class="mt-3 flex flex-wrap items-center gap-2 justify-between">
      <view class="flex flex-wrap items-center gap-2">
        <CmTag tone="warning">
          <text>{{ sourceText }}</text>
        </CmTag>
        <CmTag v-if="hasInFridge" tone="warning" size="xs">冰箱已有</CmTag>
      </view>

      <text v-if="statusMeta" class="text-[11px] text-slate-400">
        {{ statusMeta }}
      </text>
    </view>

    <text
      v-if="fridgeMatchedName"
      class="mt-2 block text-[11px] text-amber-600"
    >
      冰箱库存中已有 {{ fridgeMatchedName }}
    </text>
  </view>
</template>

<script setup lang="ts">
import CmTag from "@/components/CmTag/CmTag.vue";

defineProps<{
  statusBanner: string;
  sourceText: string;
  statusMeta: string;
  hasInFridge: boolean;
  fridgeMatchedName?: string;
}>();
</script>
