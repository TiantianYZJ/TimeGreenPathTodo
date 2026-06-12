/**
 * 认证状态 Hook
 *
 * 封装 authStore 的常用操作，提供简洁的认证状态访问接口
 * 包括用户信息、登录/登出、权限检查等功能
 */

import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { UserInfo, LoginCredentials } from '@/types/user';
import type { LoginResponse, QrCodeStatusResponse } from '@/services/api/types';

/**
 * 认证 Hook 返回值接口
 */
interface UseAuthReturn {
  /** 当前登录用户信息，未登录时为 null */
  user: UserInfo | null;
  /** 当前访问令牌 */
  token: string | null;
  /** 是否已认证（同时有 token 和 user） */
  isAuthenticated: boolean;
  /** 是否正在执行登录/登出等异步操作 */
  isLoading: boolean;
  /**
   * 账号密码登录
   * @param credentials 登录凭证（账号和密码）
   * @returns 登录响应数据
   */
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  /**
   * 登出操作
   * 清空所有认证状态
   */
  logout: () => void;
  /**
   * 二维码扫码登录确认后调用
   * @param qrCodeResult 二维码状态查询结果（confirmed 状态）
   */
  loginByQrcode: (qrCodeResult: QrCodeStatusResponse) => void;
  /**
   * 检查当前用户是否拥有指定角色
   * @param role 要检查的角色名称
   * @returns 是否拥有该角色
   */
  hasRole: (role: string) => boolean;
}

/**
 * 认证管理 Hook
 *
 * 提供对用户认证状态的完整访问和控制能力：
 * - 获取当前用户信息和登录状态
 * - 执行登录、登出操作
 * - 检查用户角色权限
 *
 * 此 Hook 是组件中处理认证相关逻辑的主要入口，
 * 封装了底层 Store 的复杂性，提供更友好的 API。
 *
 * @returns 认证控制对象
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { user, isAuthenticated, logout, hasRole } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <PleaseLogin />;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>欢迎，{user?.nickname}</h1>
 *       {hasRole('admin') && <AdminPanel />}
 *       <button onClick={logout}>退出登录</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  // 从 Store 中获取状态和方法
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const storeLogin = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);
  const handleQrCodeLogin = useAuthStore((state) => state.handleQrCodeLogin);
  const storeHasRole = useAuthStore((state) => state.hasRole);

  /**
   * 登录方法
   * 直接调用 Store 的 login 方法
   */
  const login = useCallback(
    (credentials: LoginCredentials): Promise<LoginResponse> => {
      return storeLogin(credentials);
    },
    [storeLogin]
  );

  /**
   * 登出方法
   * 直接调用 Store 的 logout 方法
   */
  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  /**
   * 二维码登录方法
   * 处理扫码登录的确认结果
   */
  const loginByQrcode = useCallback(
    (qrCodeResult: QrCodeStatusResponse): void => {
      handleQrCodeLogin(qrCodeResult);
    },
    [handleQrCodeLogin]
  );

  /**
   * 角色检查方法
   * 检查当前用户是否拥有指定角色
   */
  const hasRole = useCallback(
    (role: string): boolean => {
      return storeHasRole(role);
    },
    [storeHasRole]
  );

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    loginByQrcode,
    hasRole,
  };
}
