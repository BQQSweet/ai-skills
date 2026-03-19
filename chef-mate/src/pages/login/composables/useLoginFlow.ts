import { debounce } from "lodash";
import { onUnmounted, reactive, ref, type Ref } from "vue";
import { useUserStore } from "@/stores/user";
import { getRequestErrorMessage, showToast, type ToastRefLike, useSmsCode } from "./useSmsCode";

interface UseLoginFlowOptions {
  toastRef: ToastRefLike;
  agreedToTerms: Ref<boolean>;
  redirectAfterAuth: () => void;
}

const PHONE_REGEXP = /^1[3-9]\d{9}$/;
const CODE_REGEXP = /^\d{6}$/;

export function useLoginFlow(options: UseLoginFlowOptions) {
  const userStore = useUserStore();
  const loading = ref(false);
  const loginType = ref<"code" | "password">("code");

  const form = reactive({
    phone: "",
    code: "",
    account: "",
    password: "",
  });

  const { smsSending, codeCooldown, handleSendCode } = useSmsCode({
    getPhone: () => form.phone,
    scene: "login",
    toastRef: options.toastRef,
  });

  function toggleLoginType() {
    if (loginType.value === "code" && !form.account && form.phone) {
      form.account = form.phone.trim();
    }

    if (
      loginType.value === "password" &&
      !form.phone &&
      PHONE_REGEXP.test(form.account.trim())
    ) {
      form.phone = form.account.trim();
    }

    loginType.value = loginType.value === "code" ? "password" : "code";
  }

  async function handleSubmit() {
    if (loading.value) return;

    if (!options.agreedToTerms.value) {
      showToast(options.toastRef, "error", "请先阅读并同意用户协议和隐私保护指引");
      return;
    }

    const payload: import("@/types/user").LoginParams = { type: loginType.value };
    const phone = form.phone.trim();
    const code = form.code.trim();
    const account = form.account.trim();
    const password = form.password.trim();

    if (loginType.value === "code") {
      if (!PHONE_REGEXP.test(phone)) {
        showToast(options.toastRef, "error", "请输入正确的手机号");
        return;
      }

      if (!CODE_REGEXP.test(code)) {
        showToast(options.toastRef, "error", "请输入 6 位短信验证码");
        return;
      }

      payload.phone = phone;
      payload.code = code;
    } else {
      if (!PHONE_REGEXP.test(account)) {
        showToast(options.toastRef, "error", "请输入正确的手机号");
        return;
      }

      if (password.length < 6 || password.length > 32) {
        showToast(options.toastRef, "error", "请输入 6-32 位密码");
        return;
      }

      payload.account = account;
      payload.password = password;
    }

    loading.value = true;
    try {
      await userStore.login(payload);
      showToast(options.toastRef, "success", "登录成功");
      options.redirectAfterAuth();
    } catch (err: any) {
      showToast(options.toastRef, "error", getRequestErrorMessage(err, "登录失败，请稍后重试"));
    } finally {
      loading.value = false;
    }
  }

  const debouncedHandleSubmit = debounce(handleSubmit, 300, {
    leading: true,
    trailing: false,
  });

  function onSubmit() {
    void debouncedHandleSubmit();
  }

  onUnmounted(() => {
    debouncedHandleSubmit.cancel();
  });

  return {
    loading,
    smsSending,
    codeCooldown,
    loginType,
    form,
    handleSendCode,
    toggleLoginType,
    onSubmit,
  };
}
