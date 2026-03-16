/**
 * 权限检查工具
 * 封装 App 端动态权限申请逻辑
 */

type PermissionScope = 'scope.camera' | 'scope.record' | 'scope.userLocation';

/**
 * 申请权限
 * @param scope 权限范围
 * @param tipMessage 被拒绝时的提示文字
 */
export async function requestPermission(
  scope: PermissionScope,
  tipMessage: string,
): Promise<boolean> {
  // #ifdef APP-PLUS
  try {
    await uni.authorize({ scope });
    return true;
  } catch {
    // 保留 uni.showModal：permission.ts 是纯 TS 工具文件，无法挂载 Vue 组件（up-modal），
    // 且此处为 APP-PLUS 条件编译内的系统权限弹窗，属于规范允许的降级场景。
    uni.showModal({
      title: '权限申请',
      content: tipMessage,
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          uni.openSetting();
        }
      },
    });
    return false;
  }
  // #endif

  // #ifdef H5
  return true;
  // #endif
}

/** 申请相机权限 */
export function requestCameraPermission(): Promise<boolean> {
  return requestPermission('scope.camera', '需要相机权限来拍照识别食材，请在设置中开启');
}

/** 申请录音权限 */
export function requestRecordPermission(): Promise<boolean> {
  return requestPermission('scope.record', '需要录音权限来识别语音指令，请在设置中开启');
}
