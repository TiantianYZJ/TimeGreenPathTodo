/**
 * AuthGuard - 路由认证守卫组件
 *
 * 功能：
 * - 检查用户是否已登录（通过 authStore.isAuthenticated()）
 * - 未登录时自动重定向到 /login，并携带当前路径作为 redirect 参数
 * - 已登录时正常渲染子组件（即受保护的路由内容）
 *
 * 使用位置：
 * 在主应用路由的 layout route 中使用，包裹所有需要认证才能访问的页面。
 *
 * @example
 * ```tsx
 * <Route path="/" element={
 *   <AuthGuard>
 *     <AppLayout>
 *       <Outlet />
 *     </AppLayout>
 *   </AuthGuard>
 * }>
 *   {routes.map(route => <Route key={route.path} {...route} />)}
 * </Route>
 * ```
 */

import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  /** 受保护的子组件/路由内容 */
  children: ReactNode;
}

/**
 * 认证守卫组件
 *
 * 拦截未认证用户的访问请求，重定向到登录页面，
 * 并在 URL 中保留原始目标路径以便登录后回跳。
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const location = useLocation();

  // 未认证时重定向到登录页，携带当前路径作为 redirect 参数
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
        state={{ from: location }}
      />
    );
  }

  // 已认证，正常渲染子组件
  return <>{children}</>;
};

export default AuthGuard;
