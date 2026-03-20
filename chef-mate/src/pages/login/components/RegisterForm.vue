<template>
  <view class="w-full flex flex-col gap-4">
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
      placeholder="请输入短信验证码"
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

    <CmInput
      v-model="model.password"
      icon="key"
      password
      password-toggle
      placeholder="请设置 6-32 位密码"
      maxlength="32"
    />

    <text class="px-2 -mt-1 text-xs leading-5 text-text-muted">
      注册完成后将自动登录 ChefMate，并继续进入家庭组引导流程。
    </text>

    <button
      class="mt-1 w-full h-14 bg-primary rounded-full shadow-[0_14px_24px_-14px_rgba(var(--primary),0.6)] border-none p-0 transition-all duration-300 overflow-hidden relative group active:translate-y-[2px] active:scale-[0.985] active:bg-primary-dark active:shadow-[0_8px_18px_-12px_rgba(var(--primary),0.48)] after:hidden"
      :loading="loading"
      @click="$emit('submit')"
    >
      <view
        class="relative z-10 flex items-center justify-center gap-2 h-full text-white text-lg font-bold"
      >
        <text>注册并进入</text>
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
    password: string;
  };
  loading: boolean;
  smsSending: boolean;
  codeCooldown: number;
}>();

defineEmits<{
  "send-code": [];
  submit: [];
}>();
</script>
