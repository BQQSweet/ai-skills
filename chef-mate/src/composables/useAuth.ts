/**
 * 认证相关组合式函数
 * 封装登录/登出流程
 */
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import type { LoginParams } from "@/types/user";

export function useAuth() {
  const userStore = useUserStore();
  const loading = ref(false);

  /** 执行登录 */
  async function doLogin(params: LoginParams) {
    loading.value = true;
    try {
      await userStore.login(params);

      // 判断用户是否已有关联分组
      if (userStore.currentGroupId) {
        uni.switchTab({ url: "/pages/index/index" });
      } else {
        // 无关联则跳转引导页
        uni.navigateTo({ url: "/pages/guide/index" });
      }
    } catch (e) {
      console.error("[useAuth] 登录失败", e);
    } finally {
      loading.value = false;
    }
  }

  /** 执行登出 */
  function doLogout() {
    userStore.logout();
  }

  return {
    loading,
    isLoggedIn: userStore.isLoggedIn,
    doLogin,
    doLogout,
  };
}
