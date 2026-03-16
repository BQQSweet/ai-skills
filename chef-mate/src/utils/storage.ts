/**
 * 本地存储封装
 * 对 uni.getStorageSync / setStorageSync 进行类型安全封装
 */

const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
  CURRENT_GROUP_ID: 'currentGroupId',
  DIETARY_PREFS: 'dietaryPrefs',
  SPEECH_LANGUAGE: 'speechLanguage',
} as const;

/** 获取存储值 */
export function getStorage<T = string>(key: string): T | null {
  try {
    const value = uni.getStorageSync(key);
    return value || null;
  } catch {
    return null;
  }
}

/** 设置存储值 */
export function setStorage(key: string, value: any): void {
  try {
    uni.setStorageSync(key, value);
  } catch (e) {
    console.error(`[Storage] 写入失败: ${key}`, e);
  }
}

/** 移除存储值 */
export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(key);
  } catch (e) {
    console.error(`[Storage] 移除失败: ${key}`, e);
  }
}

/** 清空所有存储 */
export function clearStorage(): void {
  try {
    uni.clearStorageSync();
  } catch (e) {
    console.error('[Storage] 清空失败', e);
  }
}

// ========== Token 快捷方法 ==========

export function getToken(): string {
  return getStorage(STORAGE_KEYS.TOKEN) || '';
}

export function setToken(token: string): void {
  setStorage(STORAGE_KEYS.TOKEN, token);
}

export function getRefreshToken(): string {
  return getStorage(STORAGE_KEYS.REFRESH_TOKEN) || '';
}

export function setRefreshToken(token: string): void {
  setStorage(STORAGE_KEYS.REFRESH_TOKEN, token);
}

export function clearAuth(): void {
  removeStorage(STORAGE_KEYS.TOKEN);
  removeStorage(STORAGE_KEYS.REFRESH_TOKEN);
  removeStorage(STORAGE_KEYS.USER_INFO);
  removeStorage(STORAGE_KEYS.CURRENT_GROUP_ID);
}

export { STORAGE_KEYS };
