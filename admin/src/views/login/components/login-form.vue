<template>
  <div class="login-form-wrapper">
    <div class="login-form-title">ChefMate 后台管理</div>
    <div class="login-form-sub-title">管理员登录</div>
    <div class="login-form-error-msg">{{ errorMessage }}</div>
    <a-form
      ref="loginForm"
      :model="userInfo"
      class="login-form"
      layout="vertical"
      @submit="handleSubmit"
    >
      <a-form-item
        field="account"
        :rules="[{ required: true, message: '请输入手机号' }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input v-model="userInfo.account" placeholder="请输入手机号">
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        field="password"
        :rules="[{ required: true, message: '请输入密码' }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input-password
          v-model="userInfo.password"
          placeholder="请输入密码"
          allow-clear
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-space :size="16" direction="vertical">
        <div class="login-form-password-actions">
          <a-checkbox
            checked="rememberPassword"
            :model-value="loginConfig.rememberPassword"
            @change="setRememberPassword as any"
          >
            记住密码
          </a-checkbox>
        </div>
        <a-button type="primary" html-type="submit" long :loading="loading">
          登录
        </a-button>
      </a-space>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import { ValidatedError } from "@arco-design/web-vue/es/form/interface";
import { useStorage } from "@vueuse/core";
import { useUserStore } from "@/store";
import useLoading from "@/hooks/loading";
import type { LoginData } from "@/api/user";

const router = useRouter();
const errorMessage = ref("");
const { loading, setLoading } = useLoading();
const userStore = useUserStore();

const loginConfig = useStorage("login-config", {
  rememberPassword: true,
  account: "",
  password: "",
});
const userInfo = reactive({
  account: loginConfig.value.account,
  password: loginConfig.value.password,
});

const handleSubmit = async ({
  errors,
  values,
}: {
  errors: Record<string, ValidatedError> | undefined;
  values: Record<string, any>;
}) => {
  if (loading.value) return;
  if (!errors) {
    setLoading(true);
    try {
      await userStore.login(values as LoginData);
      const { redirect, ...othersQuery } = router.currentRoute.value.query;
      router.push({
        name: (redirect as string) || "RecipeList",
        query: {
          ...othersQuery,
        },
      });
      Message.success("登录成功");
      const { rememberPassword } = loginConfig.value;
      const { account, password } = values;
      loginConfig.value.account = rememberPassword ? account : "";
      loginConfig.value.password = rememberPassword ? password : "";
    } catch (err) {
      errorMessage.value = (err as Error).message;
    } finally {
      setLoading(false);
    }
  }
};
const setRememberPassword = (value: boolean) => {
  loginConfig.value.rememberPassword = value;
};
</script>

<style lang="less" scoped>
.login-form {
  &-wrapper {
    width: 320px;
  }

  &-title {
    color: var(--color-text-1);
    font-weight: 500;
    font-size: 24px;
    line-height: 32px;
  }

  &-sub-title {
    color: var(--color-text-3);
    font-size: 16px;
    line-height: 24px;
  }

  &-error-msg {
    height: 32px;
    color: rgb(var(--red-6));
    line-height: 32px;
  }

  &-password-actions {
    display: flex;
    justify-content: space-between;
  }

  &-register-btn {
    color: var(--color-text-3) !important;
  }
}
</style>
