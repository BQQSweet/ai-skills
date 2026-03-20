<template>
  <view
    class="relative w-full flex flex-col justify-between min-h-screen pb-6 overflow-hidden bg-background-light dark:bg-background-dark font-sans"
  >
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
      <LoginHero :auth-mode="authMode" />
      <AuthModeTabs :model-value="authMode" @update:model-value="setAuthMode" />
      <LoginForm
        v-if="authMode === 'login'"
        :model="loginForm"
        :login-type="loginType"
        :loading="loginLoading"
        :sms-sending="loginSmsSending"
        :code-cooldown="loginCodeCooldown"
        @send-code="handleLoginCodeSend"
        @toggle-login-type="toggleLoginType"
        @submit="submitLogin"
      />
      <RegisterForm
        v-else
        :model="registerForm"
        :loading="registerLoading"
        :sms-sending="registerSmsSending"
        :code-cooldown="registerCodeCooldown"
        @send-code="handleRegisterCodeSend"
        @submit="submitRegister"
      />
      <LoginFooter
        :auth-mode="authMode"
        :agreed-to-terms="agreedToTerms"
        @wechat-login="handleWechatLogin"
        @switch-auth-mode="toggleAuthMode"
        @toggle-terms="toggleTerms"
        @agreement="openAgreement"
        @privacy="openPrivacy"
      />
    </view>

    <view
      class="absolute -bottom-10 -left-5 text-primary/5 pointer-events-none rotate-45"
    >
      <text class="material-symbols-outlined text-[180px]">eco</text>
    </view>

    <CmTopNoticeBar ref="uToastRef"></CmTopNoticeBar>
    <AuthDocumentPopup
      :show="documentVisible"
      :document="currentDocument"
      @update:show="setDocumentVisible"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CmTopNoticeBar from "@/components/CmTopNoticeBar/CmTopNoticeBar.vue";
import AuthDocumentPopup from "./components/AuthDocumentPopup.vue";
import AuthModeTabs from "./components/AuthModeTabs.vue";
import LoginFooter from "./components/LoginFooter.vue";
import LoginForm from "./components/LoginForm.vue";
import LoginHero from "./components/LoginHero.vue";
import RegisterForm from "./components/RegisterForm.vue";
import { useAuthPage } from "./composables/useAuthPage";
import { useLoginFlow } from "./composables/useLoginFlow";
import { useRegisterFlow } from "./composables/useRegisterFlow";

const uToastRef = ref<any>(null);

const {
  authMode,
  agreedToTerms,
  toggleTerms,
  documentVisible,
  currentDocument,
  setDocumentVisible,
  setAuthMode,
  toggleAuthMode,
  openAgreement,
  openPrivacy,
  handleWechatLogin,
  redirectAfterAuth,
} = useAuthPage(uToastRef);

const {
  loading: loginLoading,
  smsSending: loginSmsSending,
  codeCooldown: loginCodeCooldown,
  loginType,
  form: loginForm,
  handleSendCode: handleLoginCodeSend,
  toggleLoginType,
  onSubmit: submitLogin,
} = useLoginFlow({
  toastRef: uToastRef,
  agreedToTerms,
  redirectAfterAuth,
});

const {
  loading: registerLoading,
  smsSending: registerSmsSending,
  codeCooldown: registerCodeCooldown,
  form: registerForm,
  handleSendCode: handleRegisterCodeSend,
  onSubmit: submitRegister,
} = useRegisterFlow({
  toastRef: uToastRef,
  agreedToTerms,
  redirectAfterAuth,
});
</script>

<style lang="css" scoped>
.font-sans {
  font-family: "Plus Jakarta Sans", "PingFang SC", "Noto Sans SC", sans-serif;
}
</style>
