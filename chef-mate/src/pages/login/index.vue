<template>
  <view
    class="relative w-full flex flex-col justify-between min-h-screen pb-6 overflow-hidden bg-background-light dark:bg-background-dark font-sans"
  >
    <!-- Background Decorations -->
    <view
      class="absolute inset-0 z-0 pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 20 Q40 5 50 20 T70 20\' stroke=\'%23ff9d0a\' stroke-width=\'2\' fill=\'none\' opacity=\'0.05\'/%3E%3Ccircle cx=\'80\' cy=\'60\' r=\'5\' fill=\'%23ff9d0a\' opacity=\'0.05\'/%3E%3Crect x=\'10\' y=\'60\' width=\'10\' height=\'25\' rx=\'2\' fill=\'%23ff9d0a\' opacity=\'0.05\'/%3E%3C/svg%3E')]"
    ></view>
    <view
      class="absolute bg-primary/5 rounded-full blur-[80px] z-0 -top-[10%] -left-[10%] w-[600px] h-[600px]"
    ></view>
    <view
      class="absolute bg-primary/5 rounded-full blur-[80px] z-0 -bottom-[10%] -right-[10%] w-[700px] h-[700px]"
    ></view>

    <view
      class="w-full max-w-[480px] flex-1 flex flex-col p-6 z-10 relative box-border"
    >
      <!-- Top Branding Section -->
      <view class="flex-1 flex flex-col justify-end items-center pb-10">
        <view
          class="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[26px] flex items-center justify-center shadow-[0_10px_15px_-3px_rgba(var(--primary),0.1)] mb-6 backdrop-blur-sm overflow-hidden"
        >
          <image
            class="w-full h-full object-cover"
            src="/static/logo.png"
            mode="aspectFill"
          ></image>
        </view>
        <text
          class="text-4xl text-quicksand font-bold tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-2"
          >ChefMate</text
        >
        <view class="flex items-center justify-center gap-2 mt-1 mb-2">
          <view
            class="text-md flex items-center text-notoserifsc font-medium text-text-muted tracking-wide"
            >让做饭
            <view
              class="w-1 h-1 mx-1 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-pulse"
            ></view
            >变简单</view
          >
        </view>
      </view>

      <!-- Form Section -->
      <view class="w-full flex flex-col gap-5">
        <template v-if="loginType === 'code'">
          <!-- Phone Input -->
          <CmInput
            v-model="form.phone"
            type="number"
            icon="shouji"
            placeholder="请输入手机号"
            maxlength="11"
          />

          <!-- Verification Code Input -->
          <CmInput
            v-model="form.code"
            type="number"
            icon="yanzhengma"
            placeholder="请输入验证码"
            maxlength="6"
            inputClass="pr-[128px]"
          >
            <template #suffix>
              <button
                class="absolute right-2 top-2 bottom-2 flex items-center justify-center px-4 bg-primary/10 text-primary text-sm font-bold border-none rounded-xl min-w-[100px] transition-colors active:bg-primary/20 disabled:opacity-50 disabled:bg-primary/5 after:hidden"
                :disabled="codeCooldown > 0"
                @click="handleSendCode"
              >
                {{ codeCooldown > 0 ? `${codeCooldown}s` : "获取验证码" }}
              </button>
            </template>
          </CmInput>
        </template>

        <template v-else>
          <!-- Account Input -->
          <CmInput
            v-model="form.account"
            icon="person"
            placeholder="请输入用户名或手机号"
          />

          <!-- Password Input -->
          <CmInput
            v-model="form.password"
            icon="key"
            password
            placeholder="请输入密码"
          />
        </template>

        <view class="flex justify-center px-2 -mt-2 mb-2">
          <text
            class="text-sm text-text-muted transition-colors duration-300 active:text-primary hover:text-primary"
            @click="toggleLoginType"
          >
            {{ loginType === "code" ? "账号密码登录" : "手机验证码登录" }}
          </text>
        </view>

        <!-- Main Action Button -->
        <button
          class="mt-2 w-full h-14 bg-primary rounded-full shadow-[0_10px_15px_-3px_rgba(var(--primary),0.4)] border-none p-0 transition-all duration-300 overflow-hidden relative group active:scale-98 active:bg-primary-dark after:hidden"
          :loading="loading"
          @click="handleSubmit"
        >
          <view
            class="relative z-10 flex items-center justify-center gap-2 h-full text-white text-lg font-bold"
          >
            <text>立即登录</text>
            <text
              class="material-symbols-outlined text-[20px] transition-transform duration-300 group-active:translate-x-1"
              >arrow_forward</text
            >
          </view>
        </button>
      </view>

      <!-- Footer Section -->
      <view
        class="flex-1 flex flex-col justify-end items-center pt-8 pb-4 gap-8"
      >
        <!-- Third Party Login -->
        <view class="w-full flex flex-col items-center gap-4">
          <view
            class="relative w-full flex items-center justify-center opacity-40"
          >
            <view class="flex-1 h-px bg-gray-300"></view>
            <text class="px-4 text-xs text-text-muted bg-background-light"
              >其他登录方式</text
            >
            <view class="flex-1 h-px bg-gray-300"></view>
          </view>
          <view
            class="w-12 h-12 rounded-full bg-wechat/10 border border-wechat/20 flex items-center justify-center transition-colors cursor-pointer active:bg-wechat/20 active:scale-95"
            @click="handleWechatLogin"
          >
            <CmIcon name="weixin" is-svg size="48rpx"></CmIcon>
          </view>
        </view>

        <!-- Terms and Policy -->
        <view
          class="flex items-start gap-2 max-w-[320px] text-center cursor-pointer"
          @click="toggleTerms"
        >
          <view class="pt-0.5">
            <view
              class="w-4 h-4 border border-gray-300 rounded flex items-center justify-center transition-all duration-200"
              :class="agreedToTerms ? 'bg-primary border-primary' : ''"
            >
              <text
                v-if="agreedToTerms"
                class="text-white text-[12px] leading-none font-bold material-symbols-outlined"
                >check</text
              >
            </view>
          </view>
          <view class="text-xs text-text-muted leading-relaxed text-left">
            我在阅读并同意
            <text
              class="text-primary px-0.5 inline-block active:underline"
              @click.stop="openAgreement"
              >用户协议</text
            >
            和
            <text
              class="text-primary px-0.5 inline-block active:underline"
              @click.stop="openPrivacy"
              >隐私保护指引</text
            >
          </view>
        </view>
      </view>
    </view>

    <view
      class="absolute -bottom-10 -left-5 text-primary/5 pointer-events-none rotate-45"
    >
      <text class="material-symbols-outlined text-[180px]">eco</text>
    </view>
    <!-- 引入自定义的 CmToast 组件 -->
    <CmToast ref="uToastRef"></CmToast>
  </view>
</template>

<script setup lang="ts">
import CmIcon from "@/components/CmIcon/CmIcon.vue";
import CmToast from "@/components/CmToast/CmToast.vue";
import { ref, reactive, onUnmounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import CmInput from "@/components/CmInput/CmInput.vue";
import { useUserStore } from "@/stores/user";
import * as authService from "@/services/auth";

const userStore = useUserStore();
const uToastRef = ref<any>(null);

onShow(() => {
  // 登录态拦截：如果已登录，禁止停留在登录页，直接跳转
  if (userStore.isLoggedIn) {
    if (userStore.currentGroupId) {
      uni.switchTab({ url: "/pages/index/index" });
    } else {
      uni.reLaunch({ url: "/pages/guide/index" });
    }
  }
});

const loading = ref(false);
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
  loginType.value = loginType.value === "code" ? "password" : "code";
}

async function handleSendCode() {
  if (!form.phone || form.phone.length !== 11) {
    uToastRef.value?.show({
      type: "error",
      message: "请输入正确的手机号",
    });
    return;
  }

  try {
    loading.value = true;
    await authService.sendSmsCode(form.phone);
    loading.value = false;
    uToastRef.value?.show({
      type: "success",
      message: "验证码已发送",
    });

    codeCooldown.value = 60;
    codeCooldownTimer.value = setInterval(() => {
      codeCooldown.value--;
      if (codeCooldown.value <= 0 && codeCooldownTimer.value) {
        clearInterval(codeCooldownTimer.value);
        codeCooldownTimer.value = null;
      }
    }, 1000);
  } catch (err: any) {
    loading.value = false;
    // 错误在 request 拦截器中已经进行了 showToast，无需重复
  }
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

async function handleSubmit() {
  if (!agreedToTerms.value) {
    uToastRef.value?.show({
      type: "error",
      message: "请先阅读并同意用户协议和隐私保护指引",
    });
    return;
  }

  const payload: import("@/types/user").LoginParams = { type: loginType.value };

  if (loginType.value === "code") {
    if (!form.phone || !form.code) {
      uToastRef.value?.show({
        type: "error",
        message: "请填写完整信息",
      });
      return;
    }
    payload.phone = form.phone;
    payload.code = form.code;
  } else {
    if (!form.account || !form.password) {
      uToastRef.value?.show({
        type: "error",
        message: "请填写完整信息",
      });
      return;
    }
    payload.account = form.account;
    payload.password = form.password;
  }

  loading.value = true;
  try {
    await userStore.login(payload);
    uToastRef.value?.show({
      type: "success",
      message: "登录成功",
    });
    setTimeout(() => {
      if (userStore.currentGroupId) {
        uni.reLaunch({ url: "/pages/index/index" });
      } else {
        uni.reLaunch({ url: "/pages/guide/index" });
      }
    }, 1000);
  } catch (err: any) {
    // 失败由请求层拦截吐司
  } finally {
    loading.value = false;
  }
}

onUnmounted(() => {
  if (codeCooldownTimer.value) {
    clearInterval(codeCooldownTimer.value);
    codeCooldownTimer.value = null;
  }
});
</script>

<style lang="css" scoped>
/* Base font setup */
.font-sans {
  font-family: "Plus Jakarta Sans", "PingFang SC", "Noto Sans SC", sans-serif;
}
</style>
