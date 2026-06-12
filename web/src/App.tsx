/**
 * App - 应用根组件
 *
 * 职责：
 * 1. 提供 Ant Design ConfigProvider（主题配置 + 中文语言包）
 * 2. 配置 React Router BrowserRouter
 * 3. 定义路由结构：登录路由 / 主应用路由（认证守卫 + 布局） / 404 兜底
 * 4. 使用 Suspense 包裹懒加载路由，提供 LoadingSkeleton 作为 fallback
 */

import React, { Suspense } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { lazy } from 'react';

import zhCN from 'antd/locale/zh_CN';
import theme from '@/styles/theme';

import AuthGuard from '@/components/AuthGuard';
import AppLayout from '@/components/layout/AppLayout/AppLayout';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import { routes } from '@/config/routes';

// ==================== 懒加载页面 ====================

/** 登录页（非主应用路由，独立加载） */
const Login = lazy(() => import('@/pages/auth/Login/Login'));

/** 404 页面 */
const NotFound = lazy(() => import('@/pages/NotFound/NotFound'));

/**
 * 应用根组件
 *
 * 路由结构：
 * - /login*       -> 登录相关页面（无需认证）
 * - /*            -> 主应用页面（需要认证 + AppLayout 布局）
 * - *             -> 404 兜底
 */
function App() {
  return (
    <ConfigProvider theme={theme} locale={zhCN}>
      <AntdApp>
        <BrowserRouter>
          <Suspense fallback={<LoadingSkeleton type="detail" />}>
            <Routes>
              {/* ---------- 登录路由分支（无需认证） ---------- */}
              <Route path="/login" element={<Login />} />

              {/* ---------- 主应用路由分支（需要认证 + 布局包裹） ---------- */}
              <Route
                path="/"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Outlet />
                    </AppLayout>
                  </AuthGuard>
                }
              >
                {/* 展开所有主应用子路由 */}
                {routes.map((route) => (
                  <Route key={route.path || 'index'} path={route.path} element={route.element} index={route.index} />
                ))}
              </Route>

              {/* ---------- 404 兜底 ---------- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
