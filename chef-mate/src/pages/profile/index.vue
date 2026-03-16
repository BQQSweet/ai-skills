<template>
  <view
    class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-24"
  >
    <view
      class="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10"
    >
      <view class="w-12"></view>
      <text
        class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center"
      >
        个人中心
      </text>
      <view class="flex w-12 items-center justify-end">
        <button
          class="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-primary/10 text-primary border-none p-0 m-0 after:border-none"
        >
          <text class="material-symbols-outlined">settings</text>
        </button>
      </view>
    </view>

    <!-- Profile Info Box -->
    <view class="flex p-6">
      <view class="flex w-full flex-col gap-6">
        <view class="flex items-center gap-5">
          <image
            class="aspect-square rounded-full h-24 w-24 border-4 border-white dark:border-slate-800 shadow-sm"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIp_B2OdmY9ynelrRKQub58P1Nq6I3xsnjIgyOg31u2ErDi0Z0geMwzoKKVxEoCqNaeIuJddRBOi_48Y8MeF1TOqOwOWjML2e7R7BFboRWB_hfNoFMV6rmNrahgy5c_XraLDu3-ehkDhrNMUVq7xAN0s7Iaj9kRV6bp5UL9254QZQPulnkuaG6vTwA3MiZU5Gl3YX78zzd_MJRYV3hiXE5hlMQM9YUnfvz8Z539uiXChckB5RR1N09sd7m4YaDxSNK10xtaQAxDIS2"
            mode="aspectFill"
          ></image>
          <view class="flex flex-col justify-center">
            <view class="flex items-center gap-2">
              <text
                class="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight"
              >
                大厨 王大力
              </text>
              <text
                class="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold"
              >
                V5
              </text>
            </view>
            <view
              class="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-1"
            >
              <text class="material-symbols-outlined text-sm">home</text>
              <text>幸福里小家</text>
            </view>
            <text class="text-primary text-sm font-semibold mt-1">
              厨房等级：资深大厨
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- Stats -->
    <view class="flex gap-3 px-6 py-2">
      <view
        class="flex flex-1 flex-col gap-1 rounded-2xl bg-white dark:bg-slate-800/50 p-4 items-center text-center shadow-sm border border-slate-100 dark:border-slate-700"
      >
        <text class="text-slate-900 dark:text-slate-100 text-2xl font-bold">
          128
        </text>
        <text class="text-slate-500 dark:text-slate-400 text-xs font-medium">
          下厨次数
        </text>
      </view>
      <view
        class="flex flex-1 flex-col gap-1 rounded-2xl bg-white dark:bg-slate-800/50 p-4 items-center text-center shadow-sm border border-slate-100 dark:border-slate-700"
      >
        <text class="text-slate-900 dark:text-slate-100 text-2xl font-bold">
          42
        </text>
        <text class="text-slate-500 dark:text-slate-400 text-xs font-medium">
          收藏菜谱
        </text>
      </view>
      <view
        class="flex flex-1 flex-col gap-1 rounded-2xl bg-white dark:bg-slate-800/50 p-4 items-center text-center shadow-sm border border-slate-100 dark:border-slate-700"
      >
        <text class="text-slate-900 dark:text-slate-100 text-2xl font-bold">
          12
        </text>
        <text class="text-slate-500 dark:text-slate-400 text-xs font-medium">
          勋章
        </text>
      </view>
    </view>

    <!-- My Kitchen -->
    <view class="px-6 pt-8 pb-4">
      <text
        class="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4 block"
      >
        我的厨房
      </text>
      <view class="grid grid-cols-2 gap-4">
        <view
          class="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800"
        >
          <view
            class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-primary"
          >
            <text class="material-symbols-outlined">workspace_premium</text>
          </view>
          <view>
            <text
              class="text-slate-900 dark:text-slate-100 font-bold text-sm block"
              >我的勋章墙</text
            >
            <text class="text-slate-400 text-[10px] block">已获12枚勋章</text>
          </view>
        </view>
        <view
          class="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800"
        >
          <view
            class="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600"
          >
            <text class="material-symbols-outlined">auto_stories</text>
          </view>
          <view>
            <text
              class="text-slate-900 dark:text-slate-100 font-bold text-sm block"
              >食光日记</text
            >
            <text class="text-slate-400 text-[10px] block">记录美味时刻</text>
          </view>
        </view>
        <view
          @click="navToGroupManage"
          class="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800 cursor-pointer"
        >
          <view
            class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"
          >
            <text class="material-symbols-outlined">group</text>
          </view>
          <view>
            <text
              class="text-slate-900 dark:text-slate-100 font-bold text-sm block"
              >家庭成员</text
            >
            <text class="text-slate-400 text-[10px] block">3位成员在线</text>
          </view>
        </view>
        <view
          class="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800"
        >
          <view
            class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600"
          >
            <text class="material-symbols-outlined">kitchen</text>
          </view>
          <view>
            <text
              class="text-slate-900 dark:text-slate-100 font-bold text-sm block"
              >厨房设备</text
            >
            <text class="text-slate-400 text-[10px] block">已连接4台设备</text>
          </view>
        </view>
      </view>
    </view>

    <!-- More Services -->
    <view class="px-6 pt-4">
      <text
        class="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4 block"
      >
        更多服务
      </text>
      <view class="flex flex-col gap-2">
        <!-- Link to Dietary Preferences -->
        <view
          @click="navToDietaryPreferences"
          class="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800"
        >
          <view class="flex items-center gap-3">
            <text class="material-symbols-outlined text-slate-400">tune</text>
            <text class="text-slate-700 dark:text-slate-200 font-medium"
              >饮食偏好</text
            >
          </view>
          <text class="material-symbols-outlined text-slate-300 text-sm"
            >chevron_right</text
          >
        </view>

        <!-- Link to Language Settings -->
        <view
          @click="navToLanguageSettings"
          class="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800"
        >
          <view class="flex items-center gap-3">
            <text class="material-symbols-outlined text-slate-400"
              >graphic_eq</text
            >
            <text class="text-slate-700 dark:text-slate-200 font-medium"
              >语音语言设置</text
            >
          </view>
          <text class="material-symbols-outlined text-slate-300 text-sm"
            >chevron_right</text
          >
        </view>

        <view
          class="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800"
        >
          <view class="flex items-center gap-3">
            <text class="material-symbols-outlined text-slate-400"
              >help_center</text
            >
            <text class="text-slate-700 dark:text-slate-200 font-medium"
              >帮助与反馈</text
            >
          </view>
          <text class="material-symbols-outlined text-slate-300 text-sm"
            >chevron_right</text
          >
        </view>

        <view
          class="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800"
        >
          <view class="flex items-center gap-3">
            <text class="material-symbols-outlined text-slate-400">info</text>
            <text class="text-slate-700 dark:text-slate-200 font-medium"
              >关于 ChefMate</text
            >
          </view>
          <text class="material-symbols-outlined text-slate-300 text-sm"
            >chevron_right</text
          >
        </view>
      </view>
    </view>

    <view class="px-6 pt-8 pb-4">
      <view
        class="flex items-center justify-center rounded-2xl border border-red-100 bg-red-50/80 py-4 text-red-500 active:opacity-70"
        :class="loggingOut ? 'opacity-70' : ''"
        @click="openLogoutConfirm"
      >
        <text class="material-symbols-outlined text-lg">logout</text>
        <text class="ml-2 text-sm font-bold">
          {{ loggingOut ? "退出中..." : "退出登录" }}
        </text>
      </view>
    </view>

    <up-modal
      :show="showLogoutModal"
      title="退出登录"
      content="退出后需要重新登录才能继续使用 ChefMate，确定退出吗？"
      showCancelButton
      confirmText="退出"
      confirmColor="#ef4444"
      @confirm="handleLogout"
      @cancel="showLogoutModal = false"
      @close="showLogoutModal = false"
    ></up-modal>

    <CmTabBar :current="4" />
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import * as authService from "@/services/auth";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const showLogoutModal = ref(false);
const loggingOut = ref(false);

const navToLanguageSettings = () => {
  uni.navigateTo({
    url: "/pages/profile/speech-language",
  });
};

const navToDietaryPreferences = () => {
  uni.navigateTo({
    url: "/pages/profile/dietary-preferences",
  });
};

const navToGroupManage = () => {
  uni.navigateTo({
    url: "/pages/group/index",
  });
};

const openLogoutConfirm = () => {
  if (loggingOut.value) return;
  showLogoutModal.value = true;
};

const handleLogout = async () => {
  if (loggingOut.value) return;

  loggingOut.value = true;
  showLogoutModal.value = false;

  try {
    await authService.logout();
  } catch (error) {
    console.error("[profile] 服务端退出失败，继续执行本地退出", error);
  } finally {
    await userStore.logout();
    loggingOut.value = false;
  }
};
</script>
