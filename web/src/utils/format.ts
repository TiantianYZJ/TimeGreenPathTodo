/**
 * 格式化工具函数
 *
 * 提供常用的数据格式化功能：
 * - 日期时间格式化
 * - 相对时间显示
 * - 文件大小格式化
 * - 文本截断处理
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置 dayjs 插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 格式化日期
 *
 * 使用 dayjs 库格式化日期对象或字符串
 *
 * @param date - 日期（Date 对象、时间戳、日期字符串等）
 * @param format - 格式字符串，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 *
 * @example
 * ```ts
 * formatDate(new Date(), 'YYYY-MM-DD') // => '2024-01-15'
 * formatDate('2024-01-15T10:30:00', 'MM/DD/YYYY') // => '01/15/2024'
 * formatDate(1705312800000) // => '2024-01-15'
 * ```
 */
export function formatDate(
  date: Date | string | number,
  format: string = 'YYYY-MM-DD'
): string {
  if (!date) return '';
  return dayjs(date).format(format);
}

/**
 * 格式化日期和时间
 *
 * 返回完整的日期+时间字符串
 *
 * @param date - 日期
 * @returns 格式化后的日期时间字符串（如 '2024-01-15 14:30'）
 */
export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
}

/**
 * 格式化为相对时间
 *
 * 显示相对于当前时间的友好描述，如"3分钟前"、"昨天"、"2天前"
 *
 * @param date - 日期
 * @returns 相对时间描述字符串
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date()) // => '几秒前'
 * formatRelativeTime(dayjs().subtract(1, 'hour')) // => '1小时前'
 * formatRelativeTime(dayjs().subtract(1, 'day')) // => '昨天'
 * formatRelativeTime(dayjs().subtract(3, 'day')) // => '3天前'
 * ```
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date) return '';
  return dayjs(date).fromNow();
}

/**
 * 格式化文件大小
 *
 * 将字节数转换为人类可读的文件大小表示
 *
 * @param bytes - 文件大小（字节）
 * @param decimals - 小数位数，默认 2
 * @returns 格式化后的文件大小字符串
 *
 * @example
 * ```ts
 * formatFileSize(0) // => '0 Bytes'
 * formatFileSize(1024) // => '1 KB'
 * formatFileSize(1048576) // => '1 MB'
 * formatFileSize(1073741824) // => '1 GB'
 * formatFileSize(1536) // => '1.5 KB'
 * ```
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // 计算值并保留指定小数位数
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

  return `${value} ${sizes[i]}`;
}

/**
 * 截断文本
 *
 * 当文本超过指定长度时，截断并添加省略号
 *
 * @param text - 原始文本
 * @param maxLength - 最大长度（字符数）
 * @returns 截断后的文本
 *
 * @example
 * ```ts
 * truncateText('Hello World', 5) // => 'Hello...'
 * truncateText('Hi', 10) // => 'Hi'
 * truncateText('这是一个很长的文本', 7) // => '这是一个很...'
 * ```
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}
