<template>
  <view class="w-full flex flex-col gap-4">
    <template v-if="loginType === 'code'">
      <CmInput
        v-model="model.phone"
        type="number"
        icon="shouji"
        placeholder="请输入手机号"
        maxlength="11"
      />

      <CmInput
        v-model="model.code"
        type="number"
        icon="yanzhengma"
        placeholder="请输入验证码"
        maxlength="6"
        inputClass="pr-[128px]"
      >
        <template #suffix>
          <button
            class="absolute right-2 top-2 bottom-2 flex items-center justify-center px-4 bg-transparent text-primary text-sm font-semibold border border-primary/30 rounded-full min-w-[100px] transition-all duration-300 active:bg-primary/5 active:border-primary active:text-primary-dark disabled:text-primary/45 disabled:border-primary/15 disabled:bg-transparent after:hidden"
            :disabled="codeCooldown > 0 || smsSending"
            @click="$emit('send-code')"
          >
            {{
              codeCooldown > 0
                ? `${codeCooldown}s`
                : smsSending
                  ? "发送中..."
                  : "获取验证码"
            }}
          </button>
        </template>
      </CmInput>
    </template>

    <template v-else>
      <CmInput
        v-model="model.account"
        icon="person"
        placeholder="请输入手机号"
        maxlength="11"
      />

      <CmInput
        v-model="model.password"
        icon="key"
        password
        password-toggle
        placeholder="请输入密码"
        maxlength="32"
      />
    </template>

    <view class="flex justify-center px-2 -mt-1 mb-1">
      <text
        class="text-sm text-text-muted transition-colors duration-300 active:text-primary hover:text-primary"
        @click="$emit('toggle-login-type')"
      >
        {{ loginType === "code" ? "账号密码登录" : "手机验证码登录" }}
      </text>
    </view>

    <button
      class="mt-1 w-full h-14 bg-primary rounded-full shadow-[0_14px_24px_-14px_rgba(var(--primary),0.6)] border-none p-0 transition-all duration-300 overflow-hidden relative group active:translate-y-[2px] active:scale-[0.985] active:bg-primary-dark active:shadow-[0_8px_18px_-12px_rgba(var(--primary),0.48)] after:hidden"
      :loading="loading"
      @click="$emit('submit')"
    >
      <view
        class="relative z-10 flex items-center justify-center gap-2 h-full text-white text-lg font-bold"
      >
        <text>立即登录</text>
        <text
          class="material-symbols-outlined text-[20px] transition-transform duration-300 group-active:translate-x-1"
        >
          arrow_forward
        </text>
      </view>
    </button>
  </view>
</template>

<script setup lang="ts">
import CmInput from "@/components/CmInput/CmInput.vue";

defineProps<{
  model: {
    phone: string;
    code: string;
    account: string;
    password: string;
  };
  loginType: "code" | "password";
  loading: boolean;
  smsSending: boolean;
  codeCooldown: number;
}>();

defineEmits<{
  "send-code": [];
  "toggle-login-type": [];
  submit: [];
}>();
</script>
