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
import type { UserInfo, DietaryPreferences } from "@/types/user";

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

  /** 登录 */
  async function login(params: import("@/types/user").LoginParams) {
    const res = await authService.login(params);
    token.value = res.token;
    userInfo.value = res.user;
    setToken(res.token);
    setRefreshToken(res.refreshToken);
    setStorage(STORAGE_KEYS.USER_INFO, JSON.stringify(res.user));

    // 初始化家庭组信息
    if (res.groups && res.groups.length > 0) {
      const { useGroupStore } = await import("@/stores/group");
      const groupStore = useGroupStore();
      groupStore.initFromLogin(res.groups);
      setCurrentGroupId(res.groups[0].groupId);
    }
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

  /** 退出登录 */
  function logout() {
    token.value = "";
    userInfo.value = null;
    currentGroupId.value = "";
    clearAuth();
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
    logout,
    setCurrentGroupId,
    setDietaryPreferences,
  };
});
