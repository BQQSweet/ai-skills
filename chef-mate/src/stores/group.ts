import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { GroupInfo, GroupBrief } from "@/types/group";
import * as groupApi from "@/services/group";

export const useGroupStore = defineStore("group", () => {
  /** 用户所属的所有家庭组列表 */
  const groupList = ref<GroupInfo[]>([]);

  /** 当前选中的家庭组 */
  const currentGroup = ref<GroupInfo | null>(null);

  /** 是否已有家庭组 */
  const hasGroup = computed(() => groupList.value.length > 0);

  /**
   * 从登录响应中初始化组信息
   */
  function initFromLogin(groups: GroupBrief[]) {
    groupList.value = groups.map((g) => ({
      id: g.groupId,
      name: g.name,
      inviteCode: g.inviteCode,
      role: g.role,
    }));
    // 默认选中第一个组
    if (groupList.value.length > 0 && !currentGroup.value) {
      currentGroup.value = groupList.value[0];
    }
  }

  /**
   * 获取我的家庭组列表（从后端刷新）
   */
  async function fetchMyGroups() {
    const list = await groupApi.getMyGroups();
    groupList.value = list;
    if (list.length > 0 && !currentGroup.value) {
      currentGroup.value = list[0];
    }
    return list;
  }

  /**
   * 创建家庭组
   */
  async function createGroup(name: string) {
    const group = await groupApi.createGroup({ name });
    groupList.value.push(group);
    currentGroup.value = group;
    return group;
  }

  /**
   * 通过邀请码加入家庭组
   */
  async function joinGroup(inviteCode: string) {
    const group = await groupApi.joinGroup({ inviteCode });
    groupList.value.push(group);
    currentGroup.value = group;
    return group;
  }

  /**
   * 切换当前选中的组
   */
  function setCurrentGroup(group: GroupInfo) {
    currentGroup.value = group;
  }

  /**
   * 清空组状态（登出时调用）
   */
  function clearGroups() {
    groupList.value = [];
    currentGroup.value = null;
  }

  return {
    groupList,
    currentGroup,
    hasGroup,
    initFromLogin,
    fetchMyGroups,
    createGroup,
    joinGroup,
    setCurrentGroup,
    clearGroups,
  };
});
