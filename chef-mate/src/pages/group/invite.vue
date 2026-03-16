<template>
  <view
    class="relative flex min-h-screen w-full flex-col bg-[#FAFAFA] dark:bg-background-dark font-display"
  >
    <!-- Header -->
    <view
      class="sticky top-0 z-30 bg-[#FAFAFA]/80 dark:bg-background-dark/80 backdrop-blur-lg px-6 pt-12 pb-4 flex items-center"
    >
      <view
        @click="goBack"
        class="w-10 h-10 rounded-full hover:bg-primary/10 flex items-center justify-center cursor-pointer transition-colors"
      >
        <text class="material-symbols-outlined text-text-main dark:text-white"
          >arrow_back_ios_new</text
        >
      </view>
      <text class="flex-1 text-center text-lg font-bold text-text-main dark:text-white pr-10"
        >邀请家庭成员</text
      >
    </view>

    <!-- Main Content -->
    <scroll-view scroll-y class="flex-1">
      <!-- Illustration Section -->
      <view class="px-6 py-4">
        <view
          class="aspect-[4/3] w-full rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative"
        >
          <view class="relative z-10 flex flex-col items-center text-center p-6">
            <text class="material-symbols-outlined text-primary text-6xl mb-2"
              >cooking</text
            >
            <text class="text-primary font-medium">让厨房更有温度</text>
            <text class="text-xs text-text-muted mt-1"
              >邀请家人共同管理今日食谱</text
            >
          </view>
        </view>
      </view>

      <!-- Invitation Code Card -->
      <view class="px-6 py-2">
        <view
          class="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-soft border border-primary/10"
        >
          <view class="flex flex-col items-center">
            <text
              class="text-xs font-semibold text-primary uppercase tracking-widest mb-4"
              >您的厨房邀请码</text
            >
            <view
              class="bg-[#FAFAFA] dark:bg-gray-900 w-full py-6 rounded-lg mb-6 border-2 border-dashed border-primary/20 flex items-center justify-center"
            >
              <text
                class="text-4xl font-black tracking-[0.2em] text-text-main dark:text-white"
              >
                {{ groupStore.currentGroup?.inviteCode || "------" }}
              </text>
            </view>
            <view
              @click="handleCopyInviteCode"
              class="w-full bg-primary hover:bg-orange-500 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20 cursor-pointer"
            >
              <text class="material-symbols-outlined">content_copy</text>
              <text>复制邀请码</text>
            </view>
            <text class="text-[10px] text-text-muted mt-4"
              >该邀请码长期有效，可随时刷新</text
            >
          </view>
        </view>
      </view>

      <!-- QR Code Section -->
      <view class="px-6 py-6 flex flex-col items-center">
        <view class="bg-white p-3 rounded-lg shadow-soft mb-3">
          <view
            class="w-32 h-32 bg-slate-100 dark:bg-gray-800 rounded-md flex items-center justify-center relative overflow-hidden"
          >
            <!-- Placeholder for QR code -->
            <view
              class="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20"
            ></view>
            <text
              class="material-symbols-outlined text-primary/40 text-5xl relative z-10"
              >qr_code_2</text
            >
            <!-- Decorative QR pattern -->
            <view
              class="absolute inset-0 grid grid-cols-4 grid-rows-4 p-2 gap-1"
            >
              <view class="bg-slate-900/10 dark:bg-white/10 rounded-sm"></view>
              <view class="bg-primary/20 rounded-sm"></view>
              <view class="bg-slate-900/10 dark:bg-white/10 rounded-sm"></view>
              <view class="bg-slate-900/10 dark:bg-white/10 rounded-sm"></view>
              <view class="bg-slate-900/10 dark:bg-white/10 rounded-sm"></view>
              <view class="bg-slate-900/10 dark:bg-white/10 rounded-sm"></view>
              <view class="bg-primary/20 rounded-sm"></view>
              <view class="bg-slate-900/10 dark:bg-white/10 rounded-sm"></view>
              <view class="bg-primary/20 rounded-sm"></view>
              <view class="bg-slate-900/10 dark:bg-white/10 rounded-sm"></view>
              <view class="bg-slate-900/10 dark:bg-white/10 rounded-sm"></view>
              <view class="bg-primary/20 rounded-sm"></view>
              <view class="bg-slate-900/10 dark:bg-white/10 rounded-sm"></view>
              <view class="bg-primary/20 rounded-sm"></view>
              <view class="bg-slate-900/10 dark:bg-white/10 rounded-sm"></view>
              <view class="bg-slate-900/10 dark:bg-white/10 rounded-sm"></view>
            </view>
          </view>
        </view>
        <text class="text-sm font-medium text-text-sub dark:text-text-muted"
          >扫码直接加入</text
        >
      </view>

      <!-- Share Actions -->
      <view class="px-6 py-4 flex justify-center gap-8">
        <view
          @click="handleShareToWechat"
          class="flex flex-col items-center gap-2 cursor-pointer"
        >
          <view
            class="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600"
          >
            <text class="material-symbols-outlined">chat</text>
          </view>
          <text class="text-xs text-text-muted">微信好友</text>
        </view>
        <view
          @click="handleShareToMoments"
          class="flex flex-col items-center gap-2 cursor-pointer"
        >
          <view
            class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"
          >
            <text class="material-symbols-outlined">camera</text>
          </view>
          <text class="text-xs text-text-muted">朋友圈</text>
        </view>
        <view
          @click="handleShareMore"
          class="flex flex-col items-center gap-2 cursor-pointer"
        >
          <view
            class="w-12 h-12 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center text-slate-600 dark:text-slate-300"
          >
            <text class="material-symbols-outlined">more_horiz</text>
          </view>
          <text class="text-xs text-text-muted">更多</text>
        </view>
      </view>

      <!-- Current Members -->
      <view class="mt-auto px-6 py-8 bg-white/50 dark:bg-gray-900/50 rounded-t-xl">
        <view class="flex items-center justify-between mb-4">
          <text class="text-sm font-bold text-text-main dark:text-white"
            >当前厨房成员</text
          >
          <view
            v-if="isOwner"
            @click="handleRefreshCode"
            class="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <text class="material-symbols-outlined text-text-muted text-sm"
              >refresh</text
            >
            <text class="text-xs text-text-muted">刷新邀请码</text>
          </view>
        </view>

        <view class="flex items-center gap-4 overflow-x-auto pb-2">
          <!-- Existing Members -->
          <view
            v-for="member in groupStore.currentGroup?.members"
            :key="member.id"
            class="flex flex-col items-center gap-1 shrink-0"
          >
            <view
              class="w-12 h-12 rounded-full overflow-hidden"
              :class="
                member.role === 'owner'
                  ? 'border-2 border-primary ring-2 ring-white dark:ring-gray-900'
                  : 'border-2 border-transparent'
              "
            >
              <image
                class="w-full h-full object-cover"
                :src="member.avatarUrl || 'https://via.placeholder.com/48'"
                mode="aspectFill"
              />
            </view>
            <text class="text-[10px] font-medium text-text-sub">{{
              member.nickname
            }}</text>
          </view>

          <!-- Add Member Placeholder -->
          <view class="flex flex-col items-center gap-1 shrink-0">
            <view
              class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-dashed border-primary/40 text-primary"
            >
              <text class="material-symbols-outlined text-xl">add</text>
            </view>
            <text class="text-[10px] font-medium text-primary">待加入</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Refresh Confirmation Modal -->
    <up-modal
      :show="showRefreshModal"
      title="刷新邀请码"
      content="刷新后旧的邀请码将失效，确定要刷新吗？"
      showCancelButton
      @confirm="confirmRefreshCode"
      @cancel="showRefreshModal = false"
      @close="showRefreshModal = false"
    ></up-modal>

    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useGroupStore } from "@/stores/group";

const groupStore = useGroupStore();
const uToastRef = ref();
const showRefreshModal = ref(false);
const isOwner = computed(() => groupStore.currentGroup?.role === "owner");

onShow(async () => {
  if (!groupStore.currentGroup) {
    await groupStore.fetchMyGroups();
  }

  if (!groupStore.currentGroup) {
    uni.reLaunch({ url: "/pages/guide/index" });
    return;
  }

  await groupStore.fetchGroupDetail(groupStore.currentGroup.id);

  if (!isOwner.value) {
    uToastRef.value?.show({
      type: "error",
      message: "只有组长可以邀请成员",
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 800);
  }
});

function handleCopyInviteCode() {
  if (!groupStore.currentGroup) return;

  uni.setClipboardData({
    data: groupStore.currentGroup.inviteCode,
    showToast: false,
    success: () => {
      uToastRef.value?.show({
        type: "success",
        message: "邀请码已复制到剪贴板",
      });
    },
    fail: () => {
      uToastRef.value?.show({
        type: "error",
        message: "复制失败，请重试",
      });
    },
  });
}

function handleShareToWechat() {
  if (!groupStore.currentGroup) return;

  const shareText = `邀请你加入我的家庭组「${groupStore.currentGroup.name}」\n邀请码：${groupStore.currentGroup.inviteCode}\n\n在 ChefMate 登录后输入邀请码即可加入！`;

  // 尝试分享到微信
  uni.share({
    provider: "weixin",
    scene: "WXSceneSession",
    type: 0,
    summary: shareText,
    success: () => {
      uToastRef.value?.show({
        type: "success",
        message: "分享成功",
      });
    },
    fail: () => {
      // 降级为复制
      uni.setClipboardData({
        data: shareText,
        showToast: false,
        success: () => {
          uToastRef.value?.show({
            type: "success",
            message: "邀请信息已复制，快去分享给家人吧",
          });
        },
      });
    },
  });
}

function handleShareToMoments() {
  if (!groupStore.currentGroup) return;

  const shareText = `邀请你加入我的家庭组「${groupStore.currentGroup.name}」\n邀请码：${groupStore.currentGroup.inviteCode}`;

  // 尝试分享到朋友圈
  uni.share({
    provider: "weixin",
    scene: "WXSceneTimeline",
    type: 0,
    summary: shareText,
    success: () => {
      uToastRef.value?.show({
        type: "success",
        message: "分享成功",
      });
    },
    fail: () => {
      uToastRef.value?.show({
        type: "info",
        message: "请在微信中打开以分享到朋友圈",
      });
    },
  });
}

function handleShareMore() {
  if (!groupStore.currentGroup) return;

  const shareText = `邀请你加入我的家庭组「${groupStore.currentGroup.name}」\n邀请码：${groupStore.currentGroup.inviteCode}\n\n在 ChefMate 登录后输入邀请码即可加入！`;

  // 直接复制到剪贴板
  uni.setClipboardData({
    data: shareText,
    showToast: false,
    success: () => {
      uToastRef.value?.show({
        type: "success",
        message: "邀请信息已复制，可分享到其他平台",
      });
    },
  });
}

function handleRefreshCode() {
  showRefreshModal.value = true;
}

async function confirmRefreshCode() {
  if (!groupStore.currentGroup) return;

  try {
    await groupStore.refreshInviteCode(groupStore.currentGroup.id);

    showRefreshModal.value = false;
    uToastRef.value?.show({
      type: "success",
      message: "邀请码已刷新",
    });
  } catch (error) {
    uToastRef.value?.show({
      type: "error",
      message: "刷新失败，请重试",
    });
  }
}

function goBack() {
  uni.navigateBack();
}
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 4px 20px -2px rgba(29, 22, 12, 0.05);
}
</style>
