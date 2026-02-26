/**
 * 格式化工具函数
 */
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/** 格式化日期 */
export function formatDate(date: string | Date, template = 'YYYY-MM-DD'): string {
  return dayjs(date).format(template);
}

/** 格式化日期时间 */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

/** 相对时间（如："3天前"） */
export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

/** 计算距今天数（正数=过期天数，负数=剩余天数） */
export function daysFromNow(date: string | Date): number {
  return dayjs().startOf('day').diff(dayjs(date).startOf('day'), 'day');
}

/** 格式化食材过期状态 */
export function getExpireStatus(expireDate: string | Date): 'fresh' | 'expiring' | 'expired' {
  const days = daysFromNow(expireDate);
  if (days > 0) return 'expired';
  if (days >= -3) return 'expiring';
  return 'fresh';
}
