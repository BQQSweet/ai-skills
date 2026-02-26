import axios from "axios";
import type { RouteRecordNormalized } from "vue-router";
import { UserState } from "@/store/modules/user/types";

export interface LoginData {
  account: string;
  password: string;
}

export interface LoginRes {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    nickname: string;
    avatarUrl?: string;
    role?: string;
  };
  groups: any[];
}

export function login(data: LoginData) {
  return axios.post<LoginRes>("/api/auth/login", {
    type: "password",
    account: data.account,
    password: data.password,
  });
}

export function logout() {
  // ChefMate 目前没有专门的 logout 接口，前端清 token 即可
  return Promise.resolve();
}

export function getUserInfo() {
  // 登录时已经返回用户信息，这里不再请求
  // 如果后续有独立的用户信息接口可以替换
  return Promise.resolve({
    data: {} as UserState,
  });
}

export function getMenuList() {
  return axios.post<RouteRecordNormalized[]>("/api/user/menu");
}
