/**
 * 统一请求封装
 * 基于 uni.request，支持自动注入 Token、统一错误处理、Token 刷新
 */
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  clearAuth,
} from "@/utils/storage";
import { BASE_URL } from "@/utils/env";
import type { ApiResponse } from "@/types/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  url: string;
  method?: HttpMethod;
  data?: any;
  header?: Record<string, string>;
  /** 是否不需要 Token（如登录接口） */
  noAuth?: boolean;
  /** 是否自动展示业务错误提示 */
  showError?: boolean;
}

type RequestConfig = Pick<RequestOptions, "header" | "noAuth" | "showError">;

/** Token 刷新状态锁 */
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/** 刷新 Token */
async function refreshTokenRequest(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const res = await new Promise<UniApp.RequestSuccessCallbackResult>(
    (resolve, reject) => {
      uni.request({
        url: `${BASE_URL}/api/auth/refresh`,
        method: "POST",
        data: { refreshToken },
        header: { "Content-Type": "application/json" },
        success: resolve,
        fail: reject,
      });
    },
  );

  const data = res.data as ApiResponse<{ token: string; refreshToken: string }>;
  if (data.code === 0) {
    setToken(data.data.token);
    setRefreshToken(data.data.refreshToken);
    return data.data.token;
  }

  throw new Error("Token refresh failed");
}

/**
 * 统一请求函数
 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = getToken();

    const header: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.header,
    };

    if (!options.noAuth && token) {
      header["Authorization"] = `Bearer ${token}`;
    }

    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || "GET",
      data: options.data,
      header,
      success: async (res) => {
        if (res.statusCode === 401 && !options.noAuth) {
          clearAuth();
          uni.reLaunch({ url: "/pages/login/index" });
          uni.$u.toast("登录已过期，请重新登录");
          reject(new Error("登录已过期，请重新登录"));
          return;
        }

        const data = res.data as ApiResponse<T>;

        if (data.code === 0) {
          resolve(data.data);
          return;
        }

        // Token 过期，尝试刷新
        if (data.code === 1002 && !options.noAuth) {
          try {
            if (!isRefreshing) {
              isRefreshing = true;
              refreshPromise = refreshTokenRequest();
            }

            await refreshPromise;
            isRefreshing = false;
            refreshPromise = null;

            // 用新 Token 重试原请求
            const retryResult = await request<T>(options);
            resolve(retryResult);
          } catch {
            isRefreshing = false;
            refreshPromise = null;
            clearAuth();
            uni.reLaunch({ url: "/pages/login/index" });
            reject(new Error("登录已过期，请重新登录"));
          }
          return;
        }

        // 其他业务错误
        if (options.showError !== false) {
          uni.$u.toast(data.msg || "请求失败");
        }
        reject(data);
      },
      fail: (err) => {
        uni.$u.toast("网络错误，请检查网络连接");
        reject(err);
      },
    });
  });
}

// ========== 快捷方法 ==========

export function get<T = any>(
  url: string,
  data?: any,
  config: RequestConfig = {},
): Promise<T> {
  return request<T>({ url, method: "GET", data, ...config });
}

export function post<T = any>(
  url: string,
  data?: any,
  config: RequestConfig = {},
): Promise<T> {
  return request<T>({ url, method: "POST", data, ...config });
}

export function put<T = any>(
  url: string,
  data?: any,
  config: RequestConfig = {},
): Promise<T> {
  return request<T>({ url, method: "PUT", data, ...config });
}

export function del<T = any>(
  url: string,
  data?: any,
  config: RequestConfig = {},
): Promise<T> {
  return request<T>({ url, method: "DELETE", data, ...config });
}
