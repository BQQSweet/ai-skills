import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import * as authService from "@/services/auth";
import { useGroupStore } from "@/stores/group";
import { useUserStore } from "@/stores/user";
import { resolveAvatarUrl } from "@/utils/avatar";

export function useProfilePage() {
  const userStore = useUserStore();
  const groupStore = useGroupStore();
  const showLogoutModal = ref(false);
  const loggingOut = ref(false);

  const profileName = computed(
    () => userStore.userInfo?.nickname || "ChefMate 用户",
  );
  const avatarUrl = computed(
    () => resolveAvatarUrl(userStore.userInfo?.avatarUrl),
  );
  const currentKitchenName = computed(
    () => groupStore.currentGroup?.name || "未加入家庭组",
  );
  const familyMemberText = computed(() => {
    if (!groupStore.currentGroup) return "未加入家庭组";
    const count =
      groupStore.currentGroup.memberCount ||
      groupStore.currentGroup.members?.length ||
      0;
    return `${count}位成员`;
  });
  const kitchenRank = computed(() => {
    if (!groupStore.currentGroup) return "NEW";
    return groupStore.currentGroup.role === "owner" ? "OWNER" : "MEMBER";
  });
  const kitchenLevelText = computed(() =>
    groupStore.currentGroup ? "厨房等级：数据建设中" : "还没有绑定家庭厨房",
  );
  const phoneText = computed(() => userStore.userInfo?.phone || "未绑定手机号");

  async function refreshGroupState() {
    if (!groupStore.currentGroup && userStore.isLoggedIn) {
      const groups = await groupStore.fetchMyGroups();
      const currentGroupId = groups[0]?.id || "";
      if (groups.length > 0 && currentGroupId) {
        await groupStore.fetchGroupDetail(currentGroupId);
      }
      return;
    }

    const currentGroupId = groupStore.currentGroup?.id;
    if (currentGroupId) {
      await groupStore.fetchGroupDetail(currentGroupId);
    }
  }

  onShow(() => {
    void refreshGroupState();
  });

  function navToLanguageSettings() {
    uni.navigateTo({
      url: "/pages/profile/speech-language",
    });
  }

  function navToDietaryPreferences() {
    uni.navigateTo({
      url: "/pages/profile/dietary-preferences",
    });
  }

  function navToGroupManage() {
    uni.navigateTo({
      url: "/pages/group/index",
    });
  }

  function openLogoutConfirm() {
    if (loggingOut.value) return;
    showLogoutModal.value = true;
  }

  async function handleLogout() {
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
  }

  return {
    showLogoutModal,
    loggingOut,
    profileName,
    avatarUrl,
    currentKitchenName,
    familyMemberText,
    kitchenRank,
    kitchenLevelText,
    phoneText,
    navToLanguageSettings,
    navToDietaryPreferences,
    navToGroupManage,
    openLogoutConfirm,
    handleLogout,
  };
}
