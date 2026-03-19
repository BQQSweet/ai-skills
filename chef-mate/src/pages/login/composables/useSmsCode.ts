import { debounce } from "lodash";
import { onUnmounted, ref } from "vue";
import * as authService from "@/services/auth";
import type { SmsCodeScene } from "@/types/user";

type ToastType = "success" | "error" | "default";

export interface ToastRefLike {
  value?: {
    show?: (options: { type: ToastType; message: string }) => void;
  };
}

interface UseSmsCodeOptions {
  getPhone: () => string;
  scene: SmsCodeScene;
  toastRef: ToastRefLike;
  successMessage?: string;
}

const PHONE_REGEXP = /^1[3-9]\d{9}$/;

export function showToast(
  toastRef: ToastRefLike,
  type: ToastType,
  message: string,
) {
  toastRef.value?.show?.({ type, message });
}

export function getRequestErrorMessage(
  err: any,
  fallback = "操作失败，请稍后重试",
) {
  if (typeof err?.msg === "string") return err.msg;
  if (typeof err?.message === "string") return err.message;
  return fallback;
}

export function useSmsCode(options: UseSmsCodeOptions) {
  const smsSending = ref(false);
  const codeCooldown = ref(0);
  const codeCooldownTimer = ref<ReturnType<typeof setInterval> | null>(null);

  function startCodeCooldown() {
    codeCooldown.value = 60;

    if (codeCooldownTimer.value) {
      clearInterval(codeCooldownTimer.value);
    }

    codeCooldownTimer.value = setInterval(() => {
      codeCooldown.value -= 1;

      if (codeCooldown.value <= 0 && codeCooldownTimer.value) {
        clearInterval(codeCooldownTimer.value);
        codeCooldownTimer.value = null;
      }
    }, 1000);
  }

  async function sendCodeRequest() {
    if (smsSending.value || codeCooldown.value > 0) return;

    const phone = options.getPhone().trim();
    if (!PHONE_REGEXP.test(phone)) {
      showToast(options.toastRef, "error", "请输入正确的手机号");
      return;
    }

    try {
      smsSending.value = true;
      await authService.sendSmsCode(phone, options.scene);
      showToast(
        options.toastRef,
        "success",
        options.successMessage || "验证码已发送",
      );
      startCodeCooldown();
    } catch (err: any) {
      showToast(
        options.toastRef,
        "error",
        getRequestErrorMessage(err, "验证码发送失败，请稍后重试"),
      );
    } finally {
      smsSending.value = false;
    }
  }

  const debouncedSendCode = debounce(sendCodeRequest, 300, {
    leading: true,
    trailing: false,
  });

  function handleSendCode() {
    void debouncedSendCode();
  }

  onUnmounted(() => {
    debouncedSendCode.cancel();
    if (codeCooldownTimer.value) {
      clearInterval(codeCooldownTimer.value);
      codeCooldownTimer.value = null;
    }
  });

  return {
    smsSending,
    codeCooldown,
    handleSendCode,
  };
}
