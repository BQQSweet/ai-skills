<template>
  <view class="w-full">
    <view class="flex items-center justify-between px-5 pt-14 pb-4">
      <view class="flex items-center gap-3">
        <view class="bg-primary/10 p-2 rounded-full text-primary">
          <text class="material-symbols-outlined text-2xl">kitchen</text>
        </view>
        <view>
          <text
            class="block text-xl font-bold text-slate-900 tracking-tight font-display"
            >ChefMate 智能协作冰箱</text
          >
          <text class="block text-xs text-slate-500 font-medium mt-0.5"
            >早上好，Master Chef</text
          >
        </view>
      </view>
      <button
        class="relative group overflow-hidden rounded-full w-10 h-10 border-2 border-white shadow-sm p-0 m-0 after:hidden"
      >
        <image
          alt="User Profile Avatar"
          class="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbHT1Ezj7taeEwk3fx2F1ABeWPBK17YD0fhIfvRj0ZgwE_KmHMD8ZYbHBxkjKiTnCcWSxoTesyKsbRdzFKVtodcy4Wn66KejJv9fGsTZQtValHhR8mBYi-QIoLcm1ru-yro7SjmGkDShzqf9ysdi1IJcNvyFGrg_cz-HODl5wgl_Cn66PyriVRgrYc-hnenl7_KQNL8UV4yYeO4j2Pg2mIgwcYzKC60d90P4KPyWyngT3HNlRPF0noiJshzPc9ZomN98JkP9iy6Mpx"
        />
        <view
          class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
        ></view>
      </button>
    </view>

    <view class="px-5 pb-4">
      <view class="relative group">
        <CmInput
          :dark="true"
          v-model="localKeyword"
          placeholder="快速查找食材..."
          customClass="w-full"
          inputClass=" !border-none !shadow-sm focus:!ring-2 focus:!ring-primary/50 text-sm pr-10 transition-all "
        >
          <template #prefix>
            <text class="material-symbols-outlined text-[20px]">search</text>
          </template>
        </CmInput>
      </view>
    </view>

    <!-- Categories -->
    <scroll-view
      scroll-x
      class="whitespace-nowrap px-5 pb-4"
      :show-scrollbar="false"
    >
      <view class="flex gap-3">
        <button
          v-for="category in categories"
          :key="category"
          class="m-0 flex-shrink-0 whitespace-nowrap rounded-full border text-sm font-medium leading-none transition-all after:hidden"
          :class="
            activeCategory === category
              ? 'border-primary bg-primary px-5 py-2 text-white shadow-[0_4px_6px_-1px_rgba(255,159,10,0.3)]'
              : 'border-slate-100 bg-white px-5 py-2 text-slate-600 shadow-sm active:bg-slate-50'
          "
          @click="handleCategorySelect(category)"
        >
          {{ category }}
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
  categories: readonly string[];
  activeCategory: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:activeCategory": [value: string];
}>();

const localKeyword = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const handleCategorySelect = (category: string) => {
  if (category === props.activeCategory) return;
  emit("update:activeCategory", category);
};
</script>

<style scoped>
.font-display {
  font-family: "Plus Jakarta Sans", "Noto Sans SC", sans-serif;
}
::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}
</style>
