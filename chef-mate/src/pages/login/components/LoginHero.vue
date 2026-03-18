<template>
  <view class="flex-1 flex flex-col justify-end items-center pb-10">
    <view
      class="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[26px] flex items-center justify-center shadow-[0_10px_15px_-3px_rgba(var(--primary),0.1)] mb-6 backdrop-blur-sm overflow-hidden"
    >
      <image
        class="w-full h-full object-cover"
        src="/static/logo.png"
        mode="aspectFill"
      ></image>
    </view>
    <text
      class="text-4xl text-quicksand font-bold tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-2"
    >
      ChefMate
    </text>
    <view class="flex items-center justify-center gap-2 mt-1 mb-2">
      <view
        class="text-md flex items-center text-notoserifsc font-medium text-text-muted tracking-wide"
      >
        让做饭
        <view
          class="w-1 h-1 mx-1 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-pulse"
        ></view>
        变简单
      </view>
    </view>
  </view>
</template>
