/**
 * 认证相关 API
 * 提供登录、用户信息、二维码登录等功能
 */

import { request } from '@/services/api/axios';
import type {
  LoginCredentials,
  UserInfo,
} from '@/types/user';
import type {
  LoginResponse,
  QrCodeGenerateResponse,
  QrCodeStatusResponse,
} from '@/services/api/types';

/** 认证 API 模块 */
export const authApi = {
  /**
   * 账号密码登录
   * @param credentials 登录凭证（账号和密码）
   * @returns 登录响应，包含 token 和用户信息
   */
  login: (credentials: LoginCredentials): Promise<LoginResponse> => {
    return request.post<LoginResponse>('/auth/login', credentials);
  },

  /**
   * 获取当前登录用户信息
   * @returns 用户信息对象
   */
  getUserInfo: (): Promise<UserInfo> => {
    return request.get<UserInfo>('/auth/userInfo');
  },

  /**
   * 更新用户信息
   * @param info 需要更新的用户信息字段
   * @returns 更新后的用户信息
   */
  updateUserInfo: (info: Partial<UserInfo>): Promise<UserInfo> => {
    return request.post<UserInfo>('/auth/updateUserInfo', info);
  },

  /**
   * 增加待办事项上限
   * @returns 更新后的用户配置
   */
  increaseTodoLimit: (): Promise<{ todo_limit: number }> => {
    return request.post('/auth/increaseTodoLimit');
  },

  // ==================== 二维码登录 ====================

  /**
   * 生成二维码用于扫码登录
   * @returns 二维码图片 URL、场景 ID 和过期时间
   */
  generateQrCode: (): Promise<QrCodeGenerateResponse> => {
    return request.post<QrCodeGenerateResponse>('/auth/qrcode/generate');
  },

  /**
   * 轮询二维码扫描状态
   * @param sceneId 场景 ID（由 generateQrCode 返回）
   * @returns 当前状态：waiting | scanned | confirmed | expired
   */
  getQrCodeStatus: (sceneId: string): Promise<QrCodeStatusResponse> => {
    return request.get<QrCodeStatusResponse>(`/auth/qrcode/status?sceneId=${sceneId}`);
  },
};
