/**
 * 认证相关 API
 */
import { post } from './request';
import type {
  LoginParams,
  RegisterParams,
  AuthResult,
  SmsCodeScene,
} from '@/types/user';

/** 手机号+密码登录 */
export function login(params: LoginParams): Promise<AuthResult> {
  return post<AuthResult>("/api/auth/login", params, {
    noAuth: true,
    showError: false,
  });
}

/** 手机号注册 */
export function register(params: RegisterParams): Promise<AuthResult> {
  return post<AuthResult>("/api/auth/register", params, {
    noAuth: true,
    showError: false,
  });
}

/** 发送短信验证码 */
export function sendSmsCode(phone: string, scene: SmsCodeScene): Promise<void> {
  return post("/api/auth/sms-code", { phone, scene }, {
    noAuth: true,
    showError: false,
  });
}

/** 退出登录 */
export function logout(): Promise<void> {
  return post('/api/auth/logout');
}
