import { computed, ref, type Ref } from "vue";
import { useGroupStore } from "@/stores/group";
import { groupRoleLabels } from "../constants/group";
import { useInviteCodeInput } from "./useInviteCodeInput";

interface ToastValue {
  show?: (options: { type: string; message: string }) => void;
}

export function useGroupManage(options: { toastRef: Ref<ToastValue | null> }) {
  const groupStore = useGroupStore();
  const inviteInput = useInviteCodeInput();

  const loading = ref(false);
  const switchingGroupId = ref("");
  const showLeaveModal = ref(false);
  const showDisbandModal = ref(false);
  const showAddGroupPanel = ref(false);
  const creatingGroup = ref(false);
  const joiningGroup = ref(false);
  const newGroupName = ref("");

  const currentGroup = computed(() => groupStore.currentGroup);
  const memberList = computed(() => currentGroup.value?.members || []);
  const isOwner = computed(() => currentGroup.value?.role === "owner");
  const currentRoleLabel = computed(() => {
    if (!currentGroup.value) return "成员";
    return groupRoleLabels[currentGroup.value.role];
  });

  function showToast(type: string, message: string) {
    options.toastRef.value?.show?.({ type, message });
  }

  function toggleAddGroupPanel() {
    showAddGroupPanel.value = !showAddGroupPanel.value;
  }

  function resetAddGroupForm() {
    newGroupName.value = "";
    inviteInput.resetInviteCodeInput();
  }

  function openAddGroupPanel() {
    showAddGroupPanel.value = true;
  }

  async function loadGroupState() {
    loading.value = true;
    try {
      await groupStore.fetchMyGroups();
      if (groupStore.currentGroup?.id) {
        await groupStore.fetchGroupDetail(groupStore.currentGroup.id);
      }
    } catch (error: any) {
      showToast("error", error?.msg || "加载家庭组失败");
    } finally {
      loading.value = false;
    }
  }

  function goBack() {
    uni.navigateBack({
      fail: () => {
        uni.switchTab({ url: "/pages/profile/index" });
      },
    });
  }

  function goGuide() {
    uni.reLaunch({ url: "/pages/guide/index" });
  }

  function goInvite() {
    if (!currentGroup.value || !isOwner.value) {
      showToast("error", "只有组长可以邀请成员");
      return;
    }

    uni.navigateTo({ url: "/pages/group/invite" });
  }

  function handleCopyInviteCode() {
    if (!currentGroup.value) return;

    uni.setClipboardData({
      data: currentGroup.value.inviteCode,
      showToast: false,
      success: () => showToast("success", "邀请码已复制"),
      fail: () => showToast("error", "复制失败，请重试"),
    });
  }

  async function handleSwitchGroup(groupId: string) {
    if (groupId === currentGroup.value?.id || switchingGroupId.value) return;

    switchingGroupId.value = groupId;
    try {
      await groupStore.switchGroup(groupId);
      showToast("success", "已切换家庭组");
    } catch (error: any) {
      showToast("error", error?.msg || "切换失败，请重试");
    } finally {
      switchingGroupId.value = "";
    }
  }

  async function handleCreateGroup() {
    if (creatingGroup.value) return;
    if (!newGroupName.value.trim()) {
      showToast("error", "请输入厨房名称");
      return;
    }

    creatingGroup.value = true;
    try {
      await groupStore.createGroup(newGroupName.value.trim());
      resetAddGroupForm();
      showAddGroupPanel.value = false;
      showToast("success", "创建成功，已切换到新厨房");
    } catch (error: any) {
      showToast("error", error?.msg || "创建失败，请稍后重试");
    } finally {
      creatingGroup.value = false;
    }
  }

  async function handleJoinGroup() {
    if (joiningGroup.value) return;
    if (inviteInput.inviteCode.value.length !== 6) {
      showToast("error", "请输入 6 位邀请码");
      return;
    }

    joiningGroup.value = true;
    try {
      await groupStore.joinGroup(inviteInput.inviteCode.value);
      resetAddGroupForm();
      showAddGroupPanel.value = false;
      showToast("success", "加入成功，已切换到新厨房");
    } catch (error: any) {
      showToast("error", error?.msg || "邀请码无效或已失效");
    } finally {
      joiningGroup.value = false;
    }
  }

  async function confirmLeaveGroup() {
    if (!currentGroup.value) return;

    try {
      await groupStore.leaveGroup(currentGroup.value.id);
      showLeaveModal.value = false;
      showToast("success", "已退出家庭组");
      if (!groupStore.currentGroup) {
        setTimeout(() => {
          uni.reLaunch({ url: "/pages/guide/index" });
        }, 700);
      }
    } catch (error: any) {
      showToast("error", error?.msg || "退出失败，请重试");
    }
  }

  async function confirmDisbandGroup() {
    if (!currentGroup.value) return;

    try {
      await groupStore.disbandGroup(currentGroup.value.id);
      showDisbandModal.value = false;
      showToast("success", "家庭组已解散");
      if (!groupStore.currentGroup) {
        setTimeout(() => {
          uni.reLaunch({ url: "/pages/guide/index" });
        }, 700);
      }
    } catch (error: any) {
      showToast("error", error?.msg || "解散失败，请重试");
    }
  }

  return {
    groupStore,
    loading,
    showLeaveModal,
    showDisbandModal,
    showAddGroupPanel,
    creatingGroup,
    joiningGroup,
    newGroupName,
    currentGroup,
    memberList,
    isOwner,
    currentRoleLabel,
    inviteCodeArr: inviteInput.inviteCodeArr,
    focusIndex: inviteInput.focusIndex,
    toggleAddGroupPanel,
    openAddGroupPanel,
    goBack,
    goGuide,
    goInvite,
    loadGroupState,
    handleCopyInviteCode,
    handleSwitchGroup,
    handleCreateGroup,
    handleJoinGroup,
    confirmLeaveGroup,
    confirmDisbandGroup,
    handleInviteCodeInput: inviteInput.handleInviteCodeInput,
  };
}
