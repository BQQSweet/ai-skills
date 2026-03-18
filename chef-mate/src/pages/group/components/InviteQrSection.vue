<template>
  <view class="px-6 py-6 flex flex-col items-center">
    <view class="bg-white p-3 rounded-lg shadow-soft mb-3">
      <view
        class="w-32 h-32 bg-slate-100 dark:bg-gray-800 rounded-md flex items-center justify-center relative overflow-hidden"
      >
        <view
          class="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20"
        ></view>
        <text
          class="material-symbols-outlined text-primary/40 text-5xl relative z-10"
        >
          qr_code_2
        </text>
        <view class="absolute inset-0 grid grid-cols-4 grid-rows-4 p-2 gap-1">
          <view
            v-for="index in 16"
            :key="index"
            class="rounded-sm"
            :class="index % 3 === 0 ? 'bg-primary/20' : 'bg-slate-900/10 dark:bg-white/10'"
          ></view>
        </view>
      </view>
    </view>
    <text class="text-sm font-medium text-text-sub dark:text-text-muted">
      扫码直接加入
    </text>
  </view>
</template>
