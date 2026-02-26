<template>
  <view
    class="relative flex flex-col min-h-screen w-full bg-background-light dark:bg-[#231b0f] text-text-main dark:text-white font-sans transition-colors duration-200 overflow-hidden"
  >
    <!-- Header -->
    <HomeHeader
      :nickname="nickname"
      :avatar-url="avatarUrl"
      :unread-count="1"
    />

    <!-- Scrollable Content -->
    <scroll-view
      scroll-y
      class="flex-1 overflow-y-auto no-scrollbar space-y-8"
      :show-scrollbar="false"
    >
      <CookingPlanCard />
      <ExpiryAlerts />
      <FamilyFeed />
      <!-- Safe Area Spacing + Tab bar height -->
      <view class="h-10"></view>
    </scroll-view>

    <!-- Bottom Navigation Component -->
    <CmTabBar :current="0" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import HomeHeader from "./components/HomeHeader.vue";
import CookingPlanCard from "./components/CookingPlanCard.vue";
import ExpiryAlerts from "./components/ExpiryAlerts.vue";
import FamilyFeed from "./components/FamilyFeed.vue";
import CmTabBar from "@/components/CmTabBar/CmTabBar.vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

// TODO: 从 userStore 获取
const nickname = computed(() => userStore.userInfo?.nickname);
const avatarUrl = computed(() => userStore.userInfo?.avatarUrl);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

.font-sans {
  font-family: "Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", sans-serif;
}

.material-symbols-outlined {
  font-family: "Material Symbols Outlined";
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}

/* 隐藏滚动条 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
