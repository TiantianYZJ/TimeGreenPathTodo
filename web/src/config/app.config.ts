/**
 * 应用配置
 */

/** 应用名称 */
export const APP_NAME = import.meta.env.VITE_APP_TITLE || '时光绿径待办';

/** API 基础地址 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/** API 请求超时时间（毫秒） */
export const API_TIMEOUT = 15000;

/** Token 过期时间（毫秒），默认7天 */
export const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

/** Refresh Token 过期时间（毫秒），默认30天 */
export const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000;

/** 是否为开发环境 */
export const IS_DEV = import.meta.env.DEV;

/** 是否为生产环境 */
export const IS_PROD = import.meta.env.PROD;

/** 应用版本号 */
export const APP_VERSION = '1.0.0';

/** 同步相关配置 */
export const SYNC_CONFIG = {
  /** 同步间隔（毫秒） */
  INTERVAL: 30000,
  /** 最大重试次数 */
  MAX_RETRIES: 3,
  /** 重试延迟基数（毫秒） */
  RETRY_DELAY: 1000,
} as const;
