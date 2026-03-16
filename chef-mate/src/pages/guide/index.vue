<template>
  <view
    class="relative w-full flex flex-col min-h-screen pb-6 overflow-hidden bg-background-light dark:bg-background-dark font-sans"
  >
    <!-- Header -->
    <view class="pt-12 pb-4 px-6 flex flex-col items-start">
      <view class="flex items-center gap-2 mb-4">
        <image
          class="w-12 h-12 object-cover"
          src="/static/logo.png"
          mode="aspectFill"
        ></image>
        <text
          class="text-quicksand font-bold text-2xl text-primary tracking-wide"
          >ChefMate</text
        >
      </view>
      <text
        class="text-text-main text-quicksand dark:text-white tracking-tight text-3xl font-bold leading-tight text-left"
      >
        欢迎来到 ChefMate！
      </text>
      <text
        class="text-text-muted dark:text-[#ccbca3] text-base font-normal leading-normal pt-2"
      >
        开启你的智慧厨房生涯
      </text>
    </view>

    <!-- Main Content -->
    <scroll-view
      scroll-y
      class="flex-1 px-4 flex flex-col gap-5 overflow-y-auto no-scrollbar"
    >
      <!-- Create Kitchen Card -->
      <view
        class="group bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/30 overflow-hidden transition-all duration-300 hover:shadow-md mb-5"
      >
        <!-- Header Image Area -->
        <view class="w-full h-32">
          <image
            class="w-full h-32 opacity-75"
            src="/static/images/https---www-recraft-ai-styles-c9620e40-3b4d-4afa-a.png"
            mode="aspectFill"
          ></image>
        </view>

        <!-- Form Area -->
        <view class="p-5 pt-2">
          <text
            class="block text-text-main dark:text-white text-lg font-bold leading-tight mb-2"
            >创建家庭厨房</text
          >
          <text
            class="block text-text-muted dark:text-text-muted text-sm font-normal leading-relaxed mb-4"
          >
            创建一个新的协作空间，邀请家人或室友加入，共同管理食谱和食材。
          </text>

          <view class="mb-4">
            <text
              class="text-xs font-semibold text-text-main dark:text-gray-300 mb-1.5 block ml-1"
              >厨房名称</text
            >
            <CmInput
              v-model="kitchenName"
              dark
              placeholder="例如：幸福里小家"
              inputClass="bg-background-light dark:bg-background-dark border border-transparent focus:border-primary focus:bg-white dark:focus:bg-[#231b0f]"
            />
          </view>

          <button
            class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-orange-500 active:bg-orange-600 active:scale-[0.98] text-white font-bold py-1 h-12 rounded-xl transition-all shadow-sm shadow-orange-200 dark:shadow-none border-none after:hidden"
            @click="handleCreateKitchen"
            :loading="isCreating"
          >
            <text>立即创建</text>
            <text class="material-symbols-outlined text-sm font-bold"
              >arrow_forward</text
            >
          </button>
        </view>
      </view>

      <!-- Join Kitchen Card -->
      <view
        class="group bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/30 overflow-hidden transition-all duration-300 hover:shadow-md mb-8"
      >
        <!-- Header Image Area -->
        <view class="w-full h-32 overflow-hidden">
          <image
            class="w-full opacity-75 -translate-y-20"
            src="/static/images/https---www-recraft-ai-styles-c9620e40-3b4d-4afa-b.png"
            mode="aspectFill"
          ></image>
        </view>

        <!-- Form Area -->
        <view class="p-5 pt-4">
          <text
            class="block text-text-main dark:text-white text-lg font-bold leading-tight mb-2"
            >加入他人厨房</text
          >
          <text
            class="block text-text-muted dark:text-text-muted text-sm font-normal leading-relaxed mb-5"
          >
            输入好友分享的 6 位邀请码，即可快速加入已有的家庭厨房。
          </text>

          <view class="flex gap-2 justify-between mb-6 mt-2">
            <input
              v-for="(_, index) in 6"
              :key="index"
              v-model="inviteCodeArr[index]"
              class="w-11 h-12 text-center text-xl font-display font-bold rounded-xl border border-orange-100 dark:border-gray-700 bg-background-light/50 dark:bg-background-dark focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all caret-primary shadow-inner"
              type="text"
              maxlength="1"
              placeholder="•"
              :focus="focusIndex === index"
              @input="handleCodeInput(index, $event)"
              @focus="focusIndex = index"
            />
          </view>

          <button
            class="w-full text-center text-sm font-semibold text-primary py-2 bg-transparent border-none after:hidden active:opacity-70 disabled:opacity-50"
            :disabled="inviteCode.length !== 6 || isJoining"
            @click="handleJoinKitchen"
          >
            {{ isJoining ? "验证中..." : "验证邀请码" }}
          </button>
        </view>
      </view>

      <!-- Footer Wait Link -->
      <view class="pb-10 text-center flex justify-center">
        <view
          class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors font-medium dark:text-gray-500 dark:hover:text-primary active:opacity-70"
          @click="handleSkip"
        >
          <text>先随便看看，以后再设置</text>
          <text class="material-symbols-outlined text-sm">arrow_right_alt</text>
        </view>
      </view>
    </scroll-view>

    <!-- Background solid color layer for large screens -->
    <view
      class="hidden lg:block fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-[#f2f0eb] dark:bg-[#1a150e]"
    ></view>

    <!-- Toast Component -->
    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import CmInput from "@/components/CmInput/CmInput.vue";
import { useGroupStore } from "@/stores/group";
import { useUserStore } from "@/stores/user";

const groupStore = useGroupStore();
const userStore = useUserStore();

// State
const kitchenName = ref("");
const inviteCodeArr = ref(["", "", "", "", "", ""]);
const focusIndex = ref(-1);
const inviteCode = computed(() => inviteCodeArr.value.join(""));
const isCreating = ref(false);
const isJoining = ref(false);

const uToastRef = ref<any>(null);

// Methods
const handleCodeInput = (index: number, e: any) => {
  const val = String(e.detail.value || "")
    .replace(/[^0-9a-z]/gi, "")
    .toUpperCase()
    .slice(-1);
  inviteCodeArr.value[index] = val;
  if (val) {
    if (index < 5) focusIndex.value = index + 1;
  } else {
    // If value is cleared, move focus left
    if (index > 0) focusIndex.value = index - 1;
  }
};

const handleCreateKitchen = async () => {
  if (isCreating.value) return;

  if (!kitchenName.value.trim()) {
    uToastRef.value?.show({
      type: "error",
      message: "请输入厨房名称",
    });
    return;
  }

  isCreating.value = true;
  try {
    const group = await groupStore.createGroup(kitchenName.value.trim());
    userStore.setCurrentGroupId(group.id);

    uToastRef.value?.show({
      type: "success",
      message: "创建成功",
    });

    setTimeout(() => {
      uni.switchTab({ url: "/pages/index/index" });
    }, 1000);
  } catch (error: any) {
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || "创建失败，请稍后重试",
    });
  } finally {
    isCreating.value = false;
  }
};

const handleJoinKitchen = async () => {
  if (isJoining.value) return;
  if (inviteCode.value.length !== 6) return;

  isJoining.value = true;
  try {
    const group = await groupStore.joinGroup(inviteCode.value);
    userStore.setCurrentGroupId(group.id);

    uToastRef.value?.show({
      type: "success",
      message: "加入成功",
    });

    setTimeout(() => {
      uni.switchTab({ url: "/pages/index/index" });
    }, 1000);
  } catch (error: any) {
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || "邀请码无效或已失效",
    });
  } finally {
    isJoining.value = false;
  }
};

const handleSkip = () => {
  uni.switchTab({ url: "/pages/index/index" });
};
</script>

<style scoped>
.font-sans {
  font-family: "Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", sans-serif;
}

.font-display {
  font-family: "Plus Jakarta Sans", "Noto Sans SC", sans-serif;
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
