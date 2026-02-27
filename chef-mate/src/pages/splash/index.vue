<template>
  <view
    class="w-full min-h-screen bg-white flex flex-col items-center justify-center"
  >
    <view class="flex flex-col items-center">
      <image
        class="w-24 h-24 mb-4 animate-pulse"
        src="/static/logo.png"
        mode="aspectFit"
      ></image>
      <text
        class="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent"
        >ChefMate</text
      >
      <text class="text-sm text-gray-400 mt-2 tracking-widest"
        >开启智慧厨房...</text
      >
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores/user";

onShow(() => {
  // 添加一点小延迟，保证动画能让用户看一眼（体验更好）
  setTimeout(() => {
    const userStore = useUserStore();

    if (userStore.isLoggedIn) {
      if (userStore.currentGroupId) {
        // 已登录且已有厨房 -> 首页
        uni.switchTab({ url: "/pages/index/index" });
      } else {
        // 已登录但没厨房 -> 引导页
        uni.reLaunch({ url: "/pages/guide/index" });
      }
    } else {
      // 未登录 -> 登录页
      uni.reLaunch({ url: "/pages/login/index" });
    }
  }, 1000); // 1秒的启动动画时间
});
</script>

<style scoped>
/* Base font setup */
text {
  font-family: "Plus Jakarta Sans", "PingFang SC", "Noto Sans SC", sans-serif;
}
</style>
