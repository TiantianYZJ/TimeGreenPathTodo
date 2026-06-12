import { request } from '../api/client';
import type { ApiResponse } from '../../types';
import type { UserInfo } from '../../types';

export interface QrCodeData {
  sceneId: string;
  qrcodeUrl: string;
  expiresAt: number;
}

export interface QrCodeStatusData {
  status: 'waiting' | 'scanned' | 'confirmed' | 'expired';
  message: string;
  token?: string;
  user?: UserInfo;
}

export const authApi = {
  generateQrCode: () =>
    request.post<ApiResponse<QrCodeData>>('/auth/qrcode/generate'),

  getQrCodeStatus: (sceneId: string) =>
    request.get<ApiResponse<QrCodeStatusData>>('/auth/qrcode/status', {
      params: { sceneId },
    }),

  getUserInfo: () =>
    request.get<ApiResponse<{ user: UserInfo }>>('/auth/userInfo'),

  updateUserInfo: (data: { nickname?: string; avatarUrl?: string }) =>
    request.post<ApiResponse>('/auth/updateUserInfo', data),

  increaseTodoLimit: (amount?: number) =>
    request.post<ApiResponse<{ todoLimit: number }>>('/auth/increaseTodoLimit', {
      amount: amount || 10,
    }),
};
