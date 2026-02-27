<template>
  <u-popup
    :show="show"
    mode="bottom"
    @close="$emit('update:show', false)"
    :customStyle="{ height: '85vh', backgroundColor: '#FAFAFA' }"
  >
    <view class="flex flex-col h-full relative z-50">
      <header
        class="pt-6 px-5 pb-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10 rounded-t-2xl"
      >
        <view
          class="text-slate-800 active:opacity-70"
          @click="$emit('update:show', false)"
        >
          <text class="material-symbols-outlined leading-none mt-1">close</text>
        </view>
        <text class="text-xl font-bold text-slate-900 leading-none"
          >AI 智能识别标签</text
        >
      </header>

      <view class="bg-white border-b border-slate-100 px-5 py-4 shrink-0">
        <scroll-view
          scroll-x
          class="whitespace-nowrap w-full"
          :show-scrollbar="false"
        >
          <view class="flex items-center gap-2">
            <view
              class="inline-flex bg-primary/10 text-primary px-3 py-1.5 rounded-full items-center gap-1 border border-primary/20 animate-pulse"
            >
              <text class="text-sm font-bold">澳洲和牛</text>
              <text class="material-symbols-outlined text-[16px]">close</text>
            </view>
            <view
              class="inline-flex bg-primary/10 text-primary px-3 py-1.5 rounded-full items-center gap-1 border border-primary/20"
            >
              <text class="text-sm font-bold">西蓝花</text>
              <text class="material-symbols-outlined text-[16px]">close</text>
            </view>
            <view
              class="inline-flex bg-slate-100 text-slate-400 px-4 py-1.5 rounded-full border border-dashed border-slate-300"
            >
              <text class="text-sm">识别中...</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view
        class="flex-1 relative flex flex-col items-center justify-center px-5 overflow-hidden"
      >
        <view class="text-center mb-12">
          <view
            class="inline-flex p-4 bg-primary/10 rounded-full mb-4 animate-bounce shrink-0 justify-center items-center"
          >
            <text
              class="material-symbols-outlined text-primary text-[36px]"
              :style="{ fontVariationSettings: '\'FILL\' 1' }"
              >camera_enhance</text
            >
          </view>
          <text class="block text-lg font-bold text-slate-800"
            >AI 正在为你发现...</text
          >
          <text class="block text-sm text-slate-400 mt-2"
            >点击识别出的标签快速添加</text
          >
        </view>

        <view class="relative w-full h-[300px]">
          <button
            class="absolute top-[10%] left-[10%] bg-white shadow-[0_0_12px_rgba(255,159,10,0.3)] border border-solid border-primary/30 px-5 py-3 rounded-2xl flex items-center gap-2 m-0 after:hidden animate-[bounce_3s_ease-in-out_infinite]"
          >
            <text class="text-2xl leading-none">🫚</text>
            <text class="font-bold text-slate-800 mt-[2px]">生姜</text>
            <view
              class="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white ml-1"
            >
              <text class="material-symbols-outlined text-[14px]">add</text>
            </view>
          </button>
          <button
            class="absolute top-[35%] right-[5%] bg-white shadow-[0_0_12px_rgba(255,159,10,0.3)] border border-solid border-primary/30 px-5 py-3 rounded-2xl flex items-center gap-2 m-0 after:hidden animate-[bounce_4s_ease-in-out_infinite]"
          >
            <text class="text-2xl leading-none">🧄</text>
            <text class="font-bold text-slate-800 mt-[2px]">大蒜</text>
            <view
              class="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white ml-1"
            >
              <text class="material-symbols-outlined text-[14px]">add</text>
            </view>
          </button>
          <button
            class="absolute bottom-[20%] left-[25%] bg-white shadow-[0_0_12px_rgba(255,159,10,0.3)] border border-solid border-primary/30 px-5 py-3 rounded-2xl flex items-center gap-2 m-0 after:hidden animate-[bounce_3.5s_ease-in-out_infinite]"
          >
            <text class="text-2xl leading-none">🍶</text>
            <text class="font-bold text-slate-800 mt-[2px]">料酒</text>
            <view
              class="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white ml-1"
            >
              <text class="material-symbols-outlined text-[14px]">add</text>
            </view>
          </button>
        </view>
      </view>

      <view class="p-6 bg-white border-t border-slate-100 pb-safe shrink-0">
        <view class="relative">
          <view
            class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 z-10"
          >
            <text class="material-symbols-outlined">edit</text>
          </view>
          <input
            class="block w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/50 text-base box-border"
            placeholder="手动输入食材名称"
            type="text"
          />
        </view>
        <button
          class="w-full mt-4 m-0 border-none after:hidden bg-primary text-white h-[56px] flex justify-center items-center rounded-2xl font-bold text-[17px] shadow-[0_10px_15px_-3px_rgba(255,159,10,0.3)] active:scale-[0.98] transition-transform"
          @click="$emit('update:show', false)"
        >
          确认添加
        </button>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
}>();

defineEmits(["update:show"]);
</script>
