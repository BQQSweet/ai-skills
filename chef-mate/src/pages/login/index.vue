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
      <LoginHero />
      <LoginForm
        :model="form"
        :login-type="loginType"
        :loading="loading"
        :sms-sending="smsSending"
        :code-cooldown="codeCooldown"
        @send-code="handleSendCode"
        @toggle-login-type="toggleLoginType"
        @submit="onSubmit"
      />
      <LoginFooter
        :agreed-to-terms="agreedToTerms"
        @wechat-login="handleWechatLogin"
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

    <CmConfirmDialog
      v-model:show="autoRegisterDialog.dialogState.show"
      :title="autoRegisterDialog.dialogState.title"
      :description="autoRegisterDialog.dialogState.description"
      :confirm-text="autoRegisterDialog.dialogState.confirmText"
      :cancel-text="autoRegisterDialog.dialogState.cancelText"
      :icon-name="autoRegisterDialog.dialogState.iconName"
      :tone="autoRegisterDialog.dialogState.tone"
      :close-on-click-overlay="autoRegisterDialog.dialogState.closeOnClickOverlay"
      :disabled="autoRegisterDialog.dialogState.disabled"
      :variant="autoRegisterDialog.dialogState.variant"
      :actions="autoRegisterDialog.dialogState.actions"
      :action-description="autoRegisterDialog.dialogState.actionDescription"
      @confirm="autoRegisterDialog.handleConfirm"
      @select="autoRegisterDialog.handleSelect"
      @cancel="autoRegisterDialog.handleCancel"
      @close="autoRegisterDialog.handleClose"
    />

    <CmToast ref="uToastRef"></CmToast>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CmConfirmDialog from "@/components/CmConfirmDialog/CmConfirmDialog.vue";
import CmToast from "@/components/CmToast/CmToast.vue";
import LoginFooter from "./components/LoginFooter.vue";
import LoginForm from "./components/LoginForm.vue";
import LoginHero from "./components/LoginHero.vue";
import { useLoginFlow } from "./composables/useLoginFlow";

const uToastRef = ref<any>(null);

const {
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
} = useLoginFlow(uToastRef);
</script>

<style lang="css" scoped>
.font-sans {
  font-family: "Plus Jakarta Sans", "PingFang SC", "Noto Sans SC", sans-serif;
}
</style>
