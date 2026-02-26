/** 用户信息 */
export interface UserInfo {
  id: string;
  phone: string;
  nickname: string;
  avatarUrl?: string;
  preferences?: UserPreferences;
  createdAt: string;
}

/** 饮食偏好 */
export interface UserPreferences {
  dietType?: string;
  allergies?: string[];
  taste?: string[];
  spiceLevel?: number;
}

/** 登录请求参数 */
export interface LoginParams {
  type: "code" | "password";
  phone?: string;
  code?: string;
  account?: string;
  password?: string;
}

/** 注册请求参数 */
export interface RegisterParams {
  phone: string;
  password: string;
  nickname: string;
  code: string;
}

/** 登录/注册响应 */
export interface AuthResult {
  token: string;
  refreshToken: string;
  user: UserInfo;
  groups: import("./group").GroupBrief[];
}
