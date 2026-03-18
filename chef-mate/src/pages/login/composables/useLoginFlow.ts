import { debounce } from "lodash";
import { onShow } from "@dcloudio/uni-app";
import { onUnmounted, reactive, ref } from "vue";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import * as authService from "@/services/auth";
import { useUserStore } from "@/stores/user";

export function useLoginFlow(uToastRef: { value?: any }) {
  const userStore = useUserStore();
  const autoRegisterDialog = useConfirmDialog();

  onShow(() => {
    if (userStore.isLoggedIn) {
      if (userStore.currentGroupId) {
        uni.switchTab({ url: "/pages/index/index" });
      } else {
        uni.reLaunch({ url: "/pages/guide/index" });
      }
    }
  });

  const loading = ref(false);
  const smsSending = ref(false);
  const codeCooldown = ref(0);
  const codeCooldownTimer = ref<ReturnType<typeof setInterval> | null>(null);
  const agreedToTerms = ref(true);
  const loginType = ref<"code" | "password">("code");

  const form = reactive({
    phone: "17760385717",
    code: "123456",
    account: "",
    password: "",
  });

  function toggleLoginType() {
    if (loginType.value === "code" && !form.account && form.phone) {
      form.account = form.phone.trim();
    }

    if (
      loginType.value === "password" &&
      !form.phone &&
      /^1[3-9]\d{9}$/.test(form.account.trim())
    ) {
      form.phone = form.account.trim();
    }

    loginType.value = loginType.value === "code" ? "password" : "code";
  }

  function startCodeCooldown() {
    codeCooldown.value = 60;

    if (codeCooldownTimer.value) {
      clearInterval(codeCooldownTimer.value);
    }

    codeCooldownTimer.value = setInterval(() => {
      codeCooldown.value--;
      if (codeCooldown.value <= 0 && codeCooldownTimer.value) {
        clearInterval(codeCooldownTimer.value);
        codeCooldownTimer.value = null;
      }
    }, 1000);
  }

  async function sendCodeRequest() {
    if (smsSending.value || codeCooldown.value > 0) return;

    if (!form.phone || form.phone.length !== 11) {
      uToastRef.value?.show({
        type: "error",
        message: "请输入正确的手机号",
      });
      return;
    }

    try {
      smsSending.value = true;
      await authService.sendSmsCode(form.phone);
      uToastRef.value?.show({
        type: "success",
        message: "验证码已发送",
      });
      startCodeCooldown();
    } finally {
      smsSending.value = false;
    }
  }

  const debouncedSendCode = debounce(sendCodeRequest, 300, {
    leading: true,
    trailing: false,
  });

  function handleSendCode() {
    debouncedSendCode();
  }

  function toggleTerms() {
    agreedToTerms.value = !agreedToTerms.value;
  }

  function openAgreement() {
    uToastRef.value?.show({
      type: "default",
      message: "用户协议",
    });
  }

  function openPrivacy() {
    uToastRef.value?.show({
      type: "default",
      message: "隐私保护指引",
    });
  }

  function handleWechatLogin() {
    uToastRef.value?.show({
      type: "default",
      message: "微信登录开发中",
    });
  }

  function getErrorMessage(err: any) {
    if (typeof err?.msg === "string") return err.msg;
    if (typeof err?.message === "string") return err.message;
    return "登录失败，请稍后重试";
  }

  function redirectAfterLogin() {
    setTimeout(() => {
      if (userStore.currentGroupId) {
        uni.reLaunch({ url: "/pages/index/index" });
      } else {
        uni.reLaunch({ url: "/pages/guide/index" });
      }
    }, 1000);
  }

  async function promptAutoRegister(account: string, password: string) {
    const confirm = await autoRegisterDialog.openConfirm({
      title: "账号未注册",
      description: `手机号 ${account} 尚未注册，是否自动创建账号并登录？`,
      confirmText: "自动注册",
      cancelText: "取消",
      iconName: "person_add",
    });

    if (!confirm) return;

    loading.value = true;
    try {
      await userStore.register({
        phone: account,
        password,
      });
      uToastRef.value?.show({
        type: "success",
        message: "注册并登录成功",
      });
      redirectAfterLogin();
    } catch (err: any) {
      uToastRef.value?.show({
        type: "error",
        message: getErrorMessage(err),
      });
    } finally {
      loading.value = false;
    }
  }

  async function handleSubmit() {
    if (loading.value) return;

    if (!agreedToTerms.value) {
      uToastRef.value?.show({
        type: "error",
        message: "请先阅读并同意用户协议和隐私保护指引",
      });
      return;
    }

    const payload: import("@/types/user").LoginParams = { type: loginType.value };
    const phone = form.phone.trim();
    const code = form.code.trim();
    const account = form.account.trim();
    const password = form.password.trim();

    if (loginType.value === "code") {
      if (!phone || !code) {
        uToastRef.value?.show({
          type: "error",
          message: "请填写完整信息",
        });
        return;
      }
      payload.phone = phone;
      payload.code = code;
    } else {
      if (!account || !password) {
        uToastRef.value?.show({
          type: "error",
          message: "请填写完整信息",
        });
        return;
      }
      payload.account = account;
      payload.password = password;
    }

    loading.value = true;
    try {
      await userStore.login(payload);
      uToastRef.value?.show({
        type: "success",
        message: "登录成功",
      });
      redirectAfterLogin();
    } catch (err: any) {
      const message = getErrorMessage(err);

      if (loginType.value === "password" && message === "该账号未注册") {
        await promptAutoRegister(account, password);
        return;
      }

      uToastRef.value?.show({
        type: "error",
        message,
      });
    } finally {
      loading.value = false;
    }
  }

  const debouncedHandleSubmit = debounce(handleSubmit, 300, {
    leading: true,
    trailing: false,
  });

  function onSubmit() {
    debouncedHandleSubmit();
  }

  onUnmounted(() => {
    debouncedSendCode.cancel();
    debouncedHandleSubmit.cancel();
    if (codeCooldownTimer.value) {
      clearInterval(codeCooldownTimer.value);
      codeCooldownTimer.value = null;
    }
  });

  return {
    autoRegisterDialog,
    loading,
    smsSending,
    codeCooldown,
    agreedToTerms,
    loginType,
    form,
    handleSendCode,
    toggleLoginType,
    toggleTerms,
    openAgreement,
    openPrivacy,
    handleWechatLogin,
    onSubmit,
  };
}
