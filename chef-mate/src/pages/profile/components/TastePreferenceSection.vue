<template>
  <view>
    <text class="text-lg font-bold text-slate-900 mb-6 block">口味偏好</text>
    <view
      class="flex flex-col gap-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
    >
      <view class="flex flex-col gap-3">
        <view class="flex justify-between items-center">
          <text class="text-sm font-bold text-slate-700">辣度</text>
          <text class="text-xs text-primary font-bold">{{
            getSpicyLabel(values.spicy)
          }}</text>
        </view>
        <slider
          :value="values.spicy"
          @change="$emit('change:spicy', $event)"
          min="0"
          max="100"
          step="33"
          activeColor="#ff9f0a"
          backgroundColor="#f1f5f9"
          block-size="24"
          block-color="#ff9f0a"
        />
        <view class="flex justify-between text-[10px] text-slate-400">
          <text>不吃辣</text>
          <text>微辣</text>
          <text>中辣</text>
          <text>特辣</text>
        </view>
      </view>

      <view class="flex flex-col gap-3">
        <view class="flex justify-between items-center">
          <text class="text-sm font-bold text-slate-700">甜度</text>
          <text class="text-xs text-primary font-bold">{{
            getSweetLabel(values.sweet)
          }}</text>
        </view>
        <slider
          :value="values.sweet"
          @change="$emit('change:sweet', $event)"
          min="0"
          max="100"
          step="50"
          activeColor="#ff9f0a"
          backgroundColor="#f1f5f9"
          block-size="24"
          block-color="#ff9f0a"
        />
        <view class="flex justify-between text-[10px] text-slate-400">
          <text>无糖</text>
          <text>微甜</text>
          <text>多糖</text>
        </view>
      </view>

      <view class="flex flex-col gap-3">
        <view class="flex justify-between items-center">
          <text class="text-sm font-bold text-slate-700">咸度</text>
          <text class="text-xs text-primary font-bold">{{
            getSaltyLabel(values.salty)
          }}</text>
        </view>
        <slider
          :value="values.salty"
          @change="$emit('change:salty', $event)"
          min="0"
          max="100"
          step="50"
          activeColor="#ff9f0a"
          backgroundColor="#f1f5f9"
          block-size="24"
          block-color="#ff9f0a"
        />
        <view class="flex justify-between text-[10px] text-slate-400">
          <text>清淡</text>
          <text>适中</text>
          <text>重口</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  values: {
    spicy: number;
    sweet: number;
    salty: number;
  };
  getSpicyLabel: (value: number) => string;
  getSweetLabel: (value: number) => string;
  getSaltyLabel: (value: number) => string;
}>();

defineEmits<{
  "change:spicy": [event: any];
  "change:sweet": [event: any];
  "change:salty": [event: any];
}>();
</script>
