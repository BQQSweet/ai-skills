<template>
  <view class="flex flex-col gap-5">
    <view class="flex flex-col gap-1.5">
      <text class="text-sm font-semibold text-slate-700">食材名称</text>
      <CmInput v-model="form.name" placeholder="请输入食材名称" />
    </view>

    <view class="flex flex-col gap-1.5">
      <text class="text-sm font-semibold text-slate-700">分类</text>
      <view class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat"
          class="m-0 px-4 py-2 rounded-full text-sm font-medium transition-all after:hidden border leading-none"
          :class="
            form.category === cat
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-white text-slate-600 border-slate-100 active:bg-slate-50'
          "
          @click="form.category = cat"
        >
          {{ cat }}
        </button>
      </view>
    </view>

    <view class="flex gap-3">
      <view class="flex-1 flex flex-col gap-1.5">
        <text class="text-sm font-semibold text-slate-700">数量</text>
        <CmInput
          v-model="form.quantity"
          placeholder="数量"
          type="digit"
        />
      </view>
      <view class="w-28 flex flex-col gap-1.5">
        <text class="text-sm font-semibold text-slate-700">单位</text>
        <CmInput v-model="form.unit" placeholder="克/个/袋" />
      </view>
    </view>

    <view class="flex flex-col gap-1.5">
      <text class="text-sm font-semibold text-slate-700">生产日期</text>
      <view
        class="h-14 px-5 bg-white border border-gray-100 rounded-[20rpx] flex items-center text-md"
        :class="form.production_date ? 'text-slate-800' : 'text-gray-400'"
        @click="$emit('pick', 'production_date')"
      >
        {{ form.production_date || "请选择生产日期" }}
      </view>
    </view>

    <view class="flex flex-col gap-1.5">
      <text class="text-sm font-semibold text-slate-700">过期日期</text>
      <view
        class="h-14 px-5 bg-white border border-gray-100 rounded-[20rpx] flex items-center text-md"
        :class="form.expire_date ? 'text-slate-800' : 'text-gray-400'"
        @click="$emit('pick', 'expire_date')"
      >
        {{ form.expire_date || "请选择过期日期" }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import CmInput from "@/components/CmInput/CmInput.vue";

defineProps<{
  categories: string[];
  form: {
    name: string;
    category: string;
    quantity: any;
    unit: string;
    production_date: string;
    expire_date: string;
  };
}>();

defineEmits<{
  pick: [field: "production_date" | "expire_date"];
}>();
</script>
