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
import { normalizeAvatarValue } from "@/utils/avatar";
import * as authService from "@/services/auth";
import type {
  UserInfo,
  DietaryPreferences,
  AuthResult,
  RefreshTokenResult,
  RegisterParams,
} from "@/types/user";

function normalizeUserInfo(user: UserInfo | null | undefined): UserInfo | null {
  if (!user) {
    return null;
  }

  const avatarUrl = normalizeAvatarValue(user.avatarUrl);

  return {
    ...user,
    avatarUrl,
  };
}

function getStoredUserInfo(): UserInfo | null {
  const rawUserInfo = getStorage<string>(STORAGE_KEYS.USER_INFO);
  if (!rawUserInfo) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(rawUserInfo) as UserInfo;
    const normalizedUser = normalizeUserInfo(parsedUser);

    if (
      normalizedUser &&
      normalizedUser.avatarUrl !== parsedUser.avatarUrl
    ) {
      setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(normalizedUser));
    }

    return normalizedUser;
  } catch {
    return null;
  }
}

export const useUserStore = defineStore("user", () => {
  // ========== State ==========
  const token = ref<string>(getToken());
  const userInfo = ref<UserInfo | null>(getStoredUserInfo());
  const currentGroupId = ref<string>(
    getStorage(STORAGE_KEYS.CURRENT_GROUP_ID) || "",
  );

  // ========== Getters ==========
  const isLoggedIn = computed(() => !!token.value);
  const userId = computed(() => userInfo.value?.id || "");
  const nickname = computed(() => userInfo.value?.nickname || "");

  // ========== Actions ==========

  function applyAuthResult(res: AuthResult) {
    const normalizedUser = normalizeUserInfo(res.user);

    token.value = res.token;
    userInfo.value = normalizedUser;
    setToken(res.token);
    setRefreshToken(res.refreshToken);
    setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(normalizedUser));
  }

  function applyRefreshedTokens(res: RefreshTokenResult) {
    token.value = res.token;
    setToken(res.token);
    setRefreshToken(res.refreshToken);
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
    applyRefreshedTokens,
    login,
    register,
    logout,
    resetSession,
    setCurrentGroupId,
    setDietaryPreferences,
  };
});
