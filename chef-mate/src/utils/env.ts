/**
 * 环境配置
 */

/** API 基础 URL */
export const BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/** 当前是否开发环境 */
export const isDev: boolean = import.meta.env.DEV;

/** 当前是否生产环境 */
export const isProd: boolean = import.meta.env.PROD;
