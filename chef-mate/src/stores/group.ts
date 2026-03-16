import { computed, ref } from "vue";
import { defineStore } from "pinia";
import * as groupApi from "@/services/group";
import { STORAGE_KEYS, getStorage } from "@/utils/storage";
import { useUserStore } from "@/stores/user";
import type { GroupBrief, GroupInfo } from "@/types/group";

export const useGroupStore = defineStore("group", () => {
  /** 用户所属的所有家庭组列表 */
  const groupList = ref<GroupInfo[]>([]);

  /** 当前选中的家庭组 */
  const currentGroup = ref<GroupInfo | null>(null);

  /** 是否已有家庭组 */
  const hasGroup = computed(() => groupList.value.length > 0);

  function getPreferredGroupId() {
    return (
      currentGroup.value?.id ||
      getStorage<string>(STORAGE_KEYS.CURRENT_GROUP_ID) ||
      ""
    );
  }

  function syncCurrentGroup(group: GroupInfo | null) {
    currentGroup.value = group;
    const userStore = useUserStore();
    userStore.setCurrentGroupId(group?.id || "");
  }

  function replaceOrAppendGroup(group: GroupInfo) {
    const index = groupList.value.findIndex((item) => item.id === group.id);

    if (index === -1) {
      groupList.value.push(group);
      return group;
    }

    const mergedGroup = {
      ...groupList.value[index],
      ...group,
      role: group.role || groupList.value[index].role,
    };
    groupList.value[index] = mergedGroup;
    return mergedGroup;
  }

  function pickCurrentGroup(list: GroupInfo[]) {
    if (list.length === 0) return null;

    const preferredId = getPreferredGroupId();
    return list.find((group) => group.id === preferredId) || list[0];
  }

  /**
   * 从登录响应中初始化组信息
   */
  function initFromLogin(groups: GroupBrief[]) {
    groupList.value = groups.map((group) => ({
      id: group.groupId,
      name: group.name,
      inviteCode: group.inviteCode,
      role: group.role,
    }));
    syncCurrentGroup(pickCurrentGroup(groupList.value));
  }

  /**
   * 获取我的家庭组列表（从后端刷新）
   */
  async function fetchMyGroups() {
    const list = await groupApi.getMyGroups();
    groupList.value = list;
    syncCurrentGroup(pickCurrentGroup(list));
    return list;
  }

  /**
   * 获取家庭组详情
   */
  async function fetchGroupDetail(groupId: string) {
    const groupDetail = await groupApi.getGroupDetail(groupId);
    const mergedGroup = replaceOrAppendGroup(groupDetail);

    if (currentGroup.value?.id === groupId) {
      syncCurrentGroup(mergedGroup);
    }

    return mergedGroup;
  }

  /**
   * 获取家庭组成员详情
   */
  async function fetchGroupMembers(groupId: string) {
    const groupDetail = await groupApi.getGroupMembers(groupId);
    const mergedGroup = replaceOrAppendGroup(groupDetail);

    if (currentGroup.value?.id === groupId) {
      syncCurrentGroup(mergedGroup);
    }

    return mergedGroup;
  }

  /**
   * 创建家庭组
   */
  async function createGroup(name: string) {
    const group = await groupApi.createGroup({ name });
    await fetchMyGroups();
    return switchGroup(group.id);
  }

  /**
   * 通过邀请码加入家庭组
   */
  async function joinGroup(inviteCode: string) {
    const group = await groupApi.joinGroup({ inviteCode });
    await fetchMyGroups();
    return switchGroup(group.id);
  }

  /**
   * 切换当前选中的组
   */
  function setCurrentGroup(group: GroupInfo | null) {
    if (!group) {
      syncCurrentGroup(null);
      return;
    }

    const mergedGroup = replaceOrAppendGroup(group);
    syncCurrentGroup(mergedGroup);
  }

  /**
   * 切换并加载当前家庭组
   */
  async function switchGroup(groupId: string) {
    let targetGroup = groupList.value.find((group) => group.id === groupId) || null;

    if (!targetGroup) {
      await fetchMyGroups();
      targetGroup = groupList.value.find((group) => group.id === groupId) || null;
    }

    if (!targetGroup) {
      throw new Error("家庭组不存在");
    }

    syncCurrentGroup(targetGroup);
    return fetchGroupDetail(groupId);
  }

  /**
   * 刷新邀请码
   */
  async function refreshInviteCode(groupId: string) {
    const result = await groupApi.refreshInviteCode(groupId);
    const targetGroup = groupList.value.find((group) => group.id === groupId);

    if (targetGroup) {
      replaceOrAppendGroup({
        ...targetGroup,
        inviteCode: result.inviteCode,
      });
    }

    if (currentGroup.value?.id === groupId) {
      syncCurrentGroup({
        ...currentGroup.value,
        inviteCode: result.inviteCode,
      });
    }

    return result;
  }

  /**
   * 退出家庭组
   */
  async function leaveGroup(groupId: string) {
    await groupApi.leaveGroup(groupId);
    groupList.value = groupList.value.filter((group) => group.id !== groupId);

    if (currentGroup.value?.id === groupId) {
      const nextGroup = pickCurrentGroup(groupList.value);
      syncCurrentGroup(nextGroup);
      if (nextGroup) {
        await fetchGroupDetail(nextGroup.id);
      }
    }
  }

  /**
   * 解散家庭组
   */
  async function disbandGroup(groupId: string) {
    await groupApi.disbandGroup(groupId);
    groupList.value = groupList.value.filter((group) => group.id !== groupId);

    if (currentGroup.value?.id === groupId) {
      const nextGroup = pickCurrentGroup(groupList.value);
      syncCurrentGroup(nextGroup);
      if (nextGroup) {
        await fetchGroupDetail(nextGroup.id);
      }
    }
  }

  /**
   * 清空组状态（登出时调用）
   */
  function clearGroups() {
    groupList.value = [];
    syncCurrentGroup(null);
  }

  return {
    groupList,
    currentGroup,
    hasGroup,
    initFromLogin,
    fetchMyGroups,
    fetchGroupDetail,
    fetchGroupMembers,
    createGroup,
    joinGroup,
    setCurrentGroup,
    switchGroup,
    refreshInviteCode,
    leaveGroup,
    disbandGroup,
    clearGroups,
  };
});
