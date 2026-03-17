/**
 * 用户状态 Store
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getToken,
  setToken,
  setRefreshToken,
  clearAuth,
  setStorage,
  STORAGE_KEYS,
  getStorage,
} from "@/utils/storage";
import * as authService from "@/services/auth";
import type {
  UserInfo,
  DietaryPreferences,
  AuthResult,
  RegisterParams,
} from "@/types/user";

export const useUserStore = defineStore("user", () => {
  // ========== State ==========
  const token = ref<string>(getToken());
  const userInfo = ref<UserInfo | null>(
    JSON.parse(getStorage(STORAGE_KEYS.USER_INFO) || "{}"),
  );
  const currentGroupId = ref<string>(
    getStorage(STORAGE_KEYS.CURRENT_GROUP_ID) || "",
  );

  // ========== Getters ==========
  const isLoggedIn = computed(() => !!token.value);
  const userId = computed(() => userInfo.value?.id || "");
  const nickname = computed(() => userInfo.value?.nickname || "");

  // ========== Actions ==========

  function applyAuthResult(res: AuthResult) {
    token.value = res.token;
    userInfo.value = res.user;
    setToken(res.token);
    setRefreshToken(res.refreshToken);
    setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(res.user));
  }

  async function syncGroupsFromAuthResult(res: AuthResult) {
    const { useGroupStore } = await import("@/stores/group");
    const groupStore = useGroupStore();

    if (res.groups && res.groups.length > 0) {
      groupStore.initFromLogin(res.groups);
      setCurrentGroupId(groupStore.currentGroup?.id || res.groups[0].groupId);
      return;
    }

    groupStore.clearGroups();
  }

  /** 登录 */
  async function login(params: import("@/types/user").LoginParams) {
    const res = await authService.login(params);
    applyAuthResult(res);
    await syncGroupsFromAuthResult(res);
  }

  /** 注册并登录 */
  async function register(params: RegisterParams) {
    const res = await authService.register(params);
    applyAuthResult(res);
    await syncGroupsFromAuthResult(res);
  }

  // ========== Preferences ==========
  const defaultPrefs = {
    allergies: ["花生", "坚果"],
    habits: ["vegetarian"],
    dislikes: ["香菜", "折耳根", "苦瓜"],
    taste: {
      spicy: 66,
      sweet: 50,
      salty: 50,
    },
  };

  const dietaryPreferences = ref(
    JSON.parse(getStorage(STORAGE_KEYS.DIETARY_PREFS) || JSON.stringify(defaultPrefs)),
  );

  function setDietaryPreferences(prefs: DietaryPreferences) {
    dietaryPreferences.value = prefs;
    setStorage(STORAGE_KEYS.DIETARY_PREFS, JSON.stringify(prefs));
  }

  /** 清空本地会话状态，不负责页面跳转 */
  async function resetSession() {
    token.value = "";
    userInfo.value = null;
    currentGroupId.value = "";

    const { useGroupStore } = await import("@/stores/group");
    useGroupStore().clearGroups();
    clearAuth();
  }

  /** 退出登录 */
  async function logout() {
    await resetSession();
    uni.reLaunch({ url: "/pages/login/index" });
  }

  /** 设置当前家庭组 */
  function setCurrentGroupId(groupId: string) {
    currentGroupId.value = groupId;
    setStorage(STORAGE_KEYS.CURRENT_GROUP_ID, groupId);
  }

  return {
    token,
    userInfo,
    currentGroupId,
    isLoggedIn,
    userId,
    nickname,
    dietaryPreferences,
    login,
    register,
    logout,
    resetSession,
    setCurrentGroupId,
    setDietaryPreferences,
  };
});
