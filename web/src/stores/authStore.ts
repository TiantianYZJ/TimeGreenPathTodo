/**
 * 认证状态管理 Store
 *
 * 使用 zustand + persist 中间件实现认证状态的持久化存储
 * 管理用户登录状态、Token 和用户信息
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/services';
import type {
  UserInfo,
  LoginCredentials,
} from '@/types/user';
import type { LoginResponse, QrCodeStatusResponse } from '@/services/api/types';

/** 登录方式类型 */
type LoginMethod = 'password' | 'qrcode' | null;

// ==================== 类型定义 ====================

/** AuthStore 状态接口 */
interface AuthState {
  /** 访问令牌 */
  token: string | null;
  /** 刷新令牌 */
  refreshToken: string | null;
  /** 当前登录用户信息 */
  user: UserInfo | null;
  /** 登录方式：密码登录 / 二维码扫码登录 */
  loginMethod: LoginMethod | null;
  /** 是否正在加载中（用于登录/登出等异步操作） */
  isLoading: boolean;
}

/** AuthStore Actions 接口 */
interface AuthActions {
  /**
   * 账号密码登录
   * @param credentials 登录凭证（账号和密码）
   * @returns 登录响应数据
   * @throws 登录失败时抛出错误
   */
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;

  /**
   * 二维码扫码登录确认后调用
   * 处理二维码轮询返回的确认状态，设置 token 和用户信息
   * @param qrCodeResult 二维码状态查询结果（confirmed 状态）
   */
  handleQrCodeLogin: (qrCodeResult: QrCodeStatusResponse) => void;

  /**
   * 登出操作
   * 清空所有认证状态（token、用户信息、登录方式）
   */
  logout: () => void;

  /**
   * 更新当前用户信息
   * 调用 API 更新服务端数据后同步更新本地状态
   * @param info 需要更新的用户信息字段
   * @returns 更新后的完整用户信息
   * @throws 更新失败时抛出错误
   */
  updateUserInfo: (info: Partial<UserInfo>) => Promise<UserInfo>;

  /**
   * 设置 Token（用于外部设置场景，如扫码登录回调）
   * @param token 访问令牌字符串
   * @param refreshToken 可选的刷新令牌
   */
  setToken: (token: string, refreshToken?: string) => void;

  /**
   * 设置用户信息（用于外部设置场景）
   * @param user 用户信息对象
   */
  setUser: (user: UserInfo) => void;

  /**
   * 设置加载状态
   * @param loading 是否正在加载
   */
  setIsLoading: (loading: boolean) => void;

  // ==================== Getters（作为方法实现） ====================

  /**
   * 检查是否已通过身份验证
   * 需要同时存在 token 和 user 信息才视为已认证
   * @returns 是否已认证
   */
  isAuthenticated: () => boolean;

  /**
   * 检查当前用户是否拥有指定角色
   * @param role 要检查的角色名称
   * @returns 是否拥有该角色
   */
  hasRole: (role: string) => boolean;
}

/** AuthStore 完整类型（状态 + 操作） */
type AuthStore = AuthState & AuthActions;

// ==================== 默认状态 ====================

/** 初始状态值 */
const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  loginMethod: null,
  isLoading: false,
};

// ==================== Store 创建 ====================

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ---------- 初始状态 ----------
      ...initialState,

      // ---------- Actions ----------

      /**
       * 账号密码登录
       * 调用 authApi.login 后将 token 和 user 存入状态
       */
      login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(credentials);
          set({
            token: response.token,
            refreshToken: response.refreshToken ?? null,
            user: response.user,
            loginMethod: 'password',
            isLoading: false,
          });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * 处理二维码扫码登录确认结果
       * 当轮询到 confirmed 状态时调用此方法完成登录
       */
      handleQrCodeLogin: (qrCodeResult: QrCodeStatusResponse): void => {
        if (qrCodeResult.status === 'confirmed' && qrCodeResult.token && qrCodeResult.user) {
          set({
            token: qrCodeResult.token,
            user: qrCodeResult.user,
            loginMethod: 'qrcode',
          });
        }
      },

      /**
       * 登出操作
       * 清空所有认证相关状态
       */
      logout: (): void => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          loginMethod: null,
          isLoading: false,
        });
      },

      /**
       * 更新用户信息
       * 先调用 API 更新服务端数据，成功后再更新本地状态中的 user 对象
       */
      updateUserInfo: async (info: Partial<UserInfo>): Promise<UserInfo> => {
        set({ isLoading: true });
        try {
          const updatedUser = await authApi.updateUserInfo(info);
          set({
            user: updatedUser,
            isLoading: false,
          });
          return updatedUser;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * 外部设置 Token
       * 用于扫码登录等非标准流程中手动设置 token 的场景
       */
      setToken: (token: string, refreshToken?: string): void => {
        set({
          token,
          refreshToken: refreshToken ?? get().refreshToken,
        });
      },

      /**
       * 外部设置用户信息
       */
      setUser: (user: UserInfo): void => {
        set({ user });
      },

      /**
       * 设置加载状态
       */
      setIsLoading: (loading: boolean): void => {
        set({ isLoading: loading });
      },

      // ---------- Getters ----------

      /**
       * 判断是否已认证
       * 同时检查 token 和 user 是否存在
       */
      isAuthenticated: (): boolean => {
        const { token, user } = get();
        return !!token && !!user;
      },

      /**
       * 检查用户角色
       * 支持逗号分隔的多角色匹配
       */
      hasRole: (role: string): boolean => {
        const { user } = get();
        if (!user || !user.role) return false;
        // 支持多角色（如 "admin,member"）
        const userRoles = user.role.split(',').map((r) => r.trim());
        return userRoles.includes(role);
      },
    }),
    {
      // Persist 配置
      name: 'auth-storage',
      // 仅持久化关键字段，不持久化 isLoading 等运行时状态
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        loginMethod: state.loginMethod,
      }),
    }
  )
);

// ==================== 选择器 Hooks（可选的性能优化） ====================

/**
 * 获取当前认证 Token
 * 用于在请求拦截器等场景中获取最新 token
 */
export const useAuthToken = (): string | null =>
  useAuthStore((state) => state.token);

/**
 * 获取当前登录用户信息
 */
export const useCurrentUser = (): UserInfo | null =>
  useAuthStore((state) => state.user);

/**
 * 获取是否已认证的状态
 */
export const useIsAuthenticated = (): boolean =>
  useAuthStore((state) => state.isAuthenticated());

/**
 * 获取登录加载状态
 */
export const useAuthLoading = (): boolean =>
  useAuthStore((state) => state.isLoading);
