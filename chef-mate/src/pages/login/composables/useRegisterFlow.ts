import { debounce } from "lodash";
import { onUnmounted, reactive, ref, type Ref } from "vue";
import { useUserStore } from "@/stores/user";
import { getRequestErrorMessage, showToast, type ToastRefLike, useSmsCode } from "./useSmsCode";

interface UseRegisterFlowOptions {
  toastRef: ToastRefLike;
  agreedToTerms: Ref<boolean>;
  redirectAfterAuth: () => void;
}

const PHONE_REGEXP = /^1[3-9]\d{9}$/;
const CODE_REGEXP = /^\d{6}$/;

export function useRegisterFlow(options: UseRegisterFlowOptions) {
  const userStore = useUserStore();
  const loading = ref(false);

  const form = reactive({
    phone: "",
    code: "",
    password: "",
  });

  const { smsSending, codeCooldown, handleSendCode } = useSmsCode({
    getPhone: () => form.phone,
    scene: "register",
    toastRef: options.toastRef,
  });

  async function handleSubmit() {
    if (loading.value) return;

    if (!options.agreedToTerms.value) {
      showToast(options.toastRef, "error", "请先阅读并同意用户协议和隐私保护指引");
      return;
    }

    const phone = form.phone.trim();
    const code = form.code.trim();
    const password = form.password.trim();

    if (!PHONE_REGEXP.test(phone)) {
      showToast(options.toastRef, "error", "请输入正确的手机号");
      return;
    }

    if (!CODE_REGEXP.test(code)) {
      showToast(options.toastRef, "error", "请输入 6 位短信验证码");
      return;
    }

    if (password.length < 6 || password.length > 32) {
      showToast(options.toastRef, "error", "请输入 6-32 位密码");
      return;
    }

    loading.value = true;
    try {
      await userStore.register({
        phone,
        code,
        password,
      });
      showToast(options.toastRef, "success", "注册成功");
      options.redirectAfterAuth();
    } catch (err: any) {
      showToast(options.toastRef, "error", getRequestErrorMessage(err, "注册失败，请稍后重试"));
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
    form,
    handleSendCode,
    onSubmit,
  };
}
