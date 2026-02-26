import { defineStore } from "pinia";
import {
  login as userLogin,
  logout as userLogout,
  LoginData,
} from "@/api/user";
import { setToken, clearToken } from "@/utils/auth";
import { removeRouteListener } from "@/utils/route-listener";
import { UserState } from "./types";
import useAppStore from "../app";

const USER_INFO_KEY = "admin-user-info";

function getStoredUserInfo(): Partial<UserState> {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredUserInfo(info: Partial<UserState>) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
}

function clearStoredUserInfo() {
  localStorage.removeItem(USER_INFO_KEY);
}

const storedInfo = getStoredUserInfo();

const useUserStore = defineStore("user", {
  state: (): UserState => ({
    name: storedInfo.name,
    avatar: storedInfo.avatar,
    phone: storedInfo.phone,
    role: (storedInfo.role as UserState["role"]) || "",
  }),

  getters: {
    userInfo(state: UserState): UserState {
      return { ...state };
    },
  },

  actions: {
    switchRoles() {
      return new Promise((resolve) => {
        this.role = this.role === "user" ? "admin" : "user";
        resolve(this.role);
      });
    },
    setInfo(partial: Partial<UserState>) {
      this.$patch(partial);
      setStoredUserInfo({ ...this.$state, ...partial });
    },
    resetInfo() {
      this.$reset();
      clearStoredUserInfo();
    },
    // 路由守卫调用：刷新页面时如果 store 有存储信息则直接还原
    async info() {
      const stored = getStoredUserInfo();
      if (stored.role) {
        this.setInfo(stored);
      }
    },
    // 登录 — 调用 ChefMate 后端 /api/auth/login
    async login(loginForm: LoginData) {
      try {
        const res = await userLogin(loginForm);
        const { token, user } = res.data;
        setToken(token);
        const info: Partial<UserState> = {
          name: user.nickname,
          avatar: user.avatarUrl,
          phone: user.phone,
          role: (user.role as UserState["role"]) || "user",
        };
        this.setInfo(info);
        // 校验是否为管理员
        if (user.role !== "admin") {
          clearToken();
          this.resetInfo();
          throw new Error("该账号没有管理员权限");
        }
      } catch (err) {
        clearToken();
        throw err;
      }
    },
    logoutCallBack() {
      const appStore = useAppStore();
      this.resetInfo();
      clearToken();
      removeRouteListener();
      appStore.clearServerMenu();
    },
    async logout() {
      try {
        await userLogout();
      } finally {
        this.logoutCallBack();
      }
    },
  },
});

export default useUserStore;
