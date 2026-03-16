/**
 * 计算到期天数
 */
export function calculateExpireDays(expireDateStr: string): number {
  const now = new Date();
  const expire = new Date(expireDateStr);
  return Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 获取到期状态
 */
export function getExpiryStatus(expireDateStr: string): {
  statusType: 'success' | 'warning' | 'error';
  statusText: string;
  statusIcon: string;
  customImageStyle?: string;
} {
  const diffDays = calculateExpireDays(expireDateStr);

  if (diffDays < 0) {
    return {
      statusType: "error",
      statusText: "已过期",
      statusIcon: "error",
      customImageStyle: "filter: grayscale(0.3)",
    };
  }
  if (diffDays === 0) {
    return {
      statusType: "warning",
      statusText: "今日到期",
      statusIcon: "warning",
    };
  }
  if (diffDays <= 3) {
    return {
      statusType: "warning",
      statusText: `还有${diffDays}天过期`,
      statusIcon: "warning",
    };
  }
  return {
    statusType: "success",
    statusText: `还有${diffDays}天`,
    statusIcon: "check_circle",
  };
}
