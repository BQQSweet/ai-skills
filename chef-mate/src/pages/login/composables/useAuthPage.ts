import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores/user";
import { AUTH_DOCUMENTS, type AuthDocumentKey } from "../constants/auth-documents";
import type { AuthMode } from "@/types/user";
import type { ToastRefLike } from "./useSmsCode";
import { showToast } from "./useSmsCode";

export function useAuthPage(toastRef: ToastRefLike) {
  const userStore = useUserStore();
  const authMode = ref<AuthMode>("login");
  const agreedToTerms = ref(true);
  const activeDocument = ref<AuthDocumentKey | null>(null);

  onShow(() => {
    if (!userStore.isLoggedIn) {
      return;
    }

    if (userStore.currentGroupId) {
      uni.switchTab({ url: "/pages/index/index" });
      return;
    }

    uni.reLaunch({ url: "/pages/guide/index" });
  });

  const currentDocument = computed(() =>
    activeDocument.value ? AUTH_DOCUMENTS[activeDocument.value] : null,
  );
  const documentVisible = computed(() => !!currentDocument.value);

  function setAuthMode(mode: AuthMode) {
    authMode.value = mode;
  }

  function toggleAuthMode() {
    authMode.value = authMode.value === "login" ? "register" : "login";
  }

  function toggleTerms() {
    agreedToTerms.value = !agreedToTerms.value;
  }

  function openAgreement() {
    activeDocument.value = "agreement";
  }

  function openPrivacy() {
    activeDocument.value = "privacy";
  }

  function setDocumentVisible(visible: boolean) {
    if (!visible) {
      activeDocument.value = null;
    }
  }

  function handleWechatLogin() {
    showToast(toastRef, "default", "微信登录开发中");
  }

  function redirectAfterAuth() {
    setTimeout(() => {
      if (userStore.currentGroupId) {
        uni.reLaunch({ url: "/pages/index/index" });
        return;
      }

      uni.reLaunch({ url: "/pages/guide/index" });
    }, 800);
  }

  return {
    authMode,
    agreedToTerms,
    documentVisible,
    currentDocument,
    setDocumentVisible,
    setAuthMode,
    toggleAuthMode,
    toggleTerms,
    openAgreement,
    openPrivacy,
    handleWechatLogin,
    redirectAfterAuth,
  };
}
