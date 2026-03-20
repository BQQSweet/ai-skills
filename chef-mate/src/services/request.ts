/**
 * 统一请求封装
 * 基于 uni.request，支持自动注入 Token、统一错误处理、Token 刷新
 */
import {
  getToken,
  getRefreshToken,
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
  /** 内部标记：是否已经在本次请求上尝试过刷新 */
  _hasRetriedAfterRefresh?: boolean;
}

type RequestConfig = Pick<RequestOptions, "header" | "noAuth" | "showError">;

/** Token 刷新状态锁 */
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let isRedirectingToLogin = false;

function isLoginPage() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  return currentPage?.route === "pages/login/index";
}

async function handleAuthExpired(message = "登录已过期，请重新登录") {
  if (isRedirectingToLogin) {
    return;
  }

  isRedirectingToLogin = true;
  isRefreshing = false;
  refreshPromise = null;

  try {
    const { useUserStore } = await import("@/stores/user");
    await useUserStore().resetSession();
  } catch {
    clearAuth();
  }

  if (!isLoginPage()) {
    uni.reLaunch({ url: "/pages/login/index" });
  }

  uni.$u.toast(message);

  setTimeout(() => {
    isRedirectingToLogin = false;
  }, 800);
}

function shouldAttemptTokenRefresh(options: RequestOptions) {
  return (
    !options.noAuth &&
    options.url !== "/api/auth/refresh" &&
    !options._hasRetriedAfterRefresh
  );
}

async function refreshTokenRequest(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const authService = await import("@/services/auth");
  const { useUserStore } = await import("@/stores/user");
  const result = await authService.refreshToken({ refreshToken });
  useUserStore().applyRefreshedTokens(result);
}

async function retryRequestAfterRefresh<T>(options: RequestOptions) {
  try {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokenRequest().then(() => getToken());
    }

    await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    return request<T>({
      ...options,
      _hasRetriedAfterRefresh: true,
    });
  } catch {
    isRefreshing = false;
    refreshPromise = null;
    await handleAuthExpired();
    throw new Error("登录已过期，请重新登录");
  }
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
        const data = res.data as ApiResponse<T>;

        if (res.statusCode === 401 && shouldAttemptTokenRefresh(options)) {
          try {
            const retryResult = await retryRequestAfterRefresh<T>(options);
            resolve(retryResult);
          } catch {
            reject(new Error("登录已过期，请重新登录"));
          }
          return;
        }

        if (res.statusCode === 401 && !options.noAuth) {
          await handleAuthExpired();
          reject(new Error("登录已过期，请重新登录"));
          return;
        }

        if (data.code === 0) {
          resolve(data.data);
          return;
        }

        // Token 过期，尝试刷新
        if (data.code === 1002 && shouldAttemptTokenRefresh(options)) {
          try {
            const retryResult = await retryRequestAfterRefresh<T>(options);
            resolve(retryResult);
          } catch {
            reject(new Error("登录已过期，请重新登录"));
          }
          return;
        }

        if (data.code === 1002 && !options.noAuth) {
          await handleAuthExpired();
          reject(new Error("登录已过期，请重新登录"));
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
