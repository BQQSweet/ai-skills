import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useGroupStore } from "@/stores/group";

export function useGroupInvite(uToastRef: { value?: any }) {
  const groupStore = useGroupStore();
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

  return {
    groupStore,
    showRefreshModal,
    isOwner,
    handleCopyInviteCode,
    handleShareToWechat,
    handleShareToMoments,
    handleShareMore,
    handleRefreshCode,
    confirmRefreshCode,
    goBack,
  };
}
