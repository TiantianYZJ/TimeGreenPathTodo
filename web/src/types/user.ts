/**
 * 用户相关类型定义
 */

export interface UserInfo {
  id: number;
  nickname: string;
  avatar?: string;
  role?: string;
  permissions?: string[];
  /** 待办事项上限 */
  todo_limit?: number;
  /** 组合上限 */
  combo_limit?: number;
  /** 共享组合上限 */
  collab_limit?: number;
}

export interface AuthState {
  token: string | null;
  refreshToken?: string | null;
  user: UserInfo | null;
  loginMethod: 'password' | 'qrcode' | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  account: string;
  password: string;
}

export interface RegisterData {
  account: string;
  password: string;
  nickname: string;
}
