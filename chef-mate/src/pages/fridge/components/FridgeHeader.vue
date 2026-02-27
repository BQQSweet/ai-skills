<template>
  <header
    class="sticky top-0 z-20 w-full bg-white/75 backdrop-blur-md border-b border-white/30"
  >
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
          v-model="localKeyword"
          placeholder="快速查找食材..."
          customClass="w-full"
          inputClass="!bg-white/60 focus:!bg-white !border-none !shadow-sm focus:!ring-2 focus:!ring-primary/50 text-sm pr-10 transition-all !rounded-xl"
        >
          <template #prefix>
            <text class="material-symbols-outlined text-[20px]">search</text>
          </template>
          <template #suffix>
            <view
              class="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
            >
              <button
                class="bg-transparent m-0 p-0 text-slate-400 active:text-primary transition-colors border-none after:hidden flex items-center justify-center"
              >
                <text class="material-symbols-outlined text-[20px]">mic</text>
              </button>
            </view>
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
          class="m-0 flex-shrink-0 px-5 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-[0_4px_6px_-1px_rgba(255,159,10,0.3)] transition-transform active:scale-95 after:hidden border-none leading-none"
        >
          全部
        </button>
        <button
          class="m-0 flex-shrink-0 px-5 py-2 rounded-full bg-white text-slate-600 text-sm font-medium border border-slate-100 shadow-sm whitespace-nowrap active:bg-slate-50 transition-colors after:hidden leading-none"
        >
          肉禽
        </button>
        <button
          class="m-0 flex-shrink-0 px-5 py-2 rounded-full bg-white text-slate-600 text-sm font-medium border border-slate-100 shadow-sm whitespace-nowrap active:bg-slate-50 transition-colors after:hidden leading-none"
        >
          果蔬
        </button>
        <button
          class="m-0 flex-shrink-0 px-5 py-2 rounded-full bg-white text-slate-600 text-sm font-medium border border-slate-100 shadow-sm whitespace-nowrap active:bg-slate-50 transition-colors after:hidden leading-none"
        >
          海鲜
        </button>
        <button
          class="m-0 flex-shrink-0 px-5 py-2 rounded-full bg-white text-slate-600 text-sm font-medium border border-slate-100 shadow-sm whitespace-nowrap active:bg-slate-50 transition-colors after:hidden leading-none"
        >
          调味
        </button>
      </view>
    </scroll-view>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const localKeyword = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
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
