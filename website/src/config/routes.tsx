import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

function lazyLoad(factory: () => Promise<{ default: React.ComponentType }>) {
  const Component = lazy(factory);
  return function LazyWrapper() {
    return (
      <Suspense fallback={<Spin size="large" style={{ display: 'block', margin: '100px auto' }} />}>
        <Component />
      </Suspense>
    );
  };
}

// Auth pages (no layout)
export const Login = lazyLoad(() => import('../pages/auth/Login'));
export const NotFound = lazyLoad(() => import('../pages/NotFound'));

// Main pages (with layout)
export const TodoList = lazyLoad(() => import('../pages/todo/TodoList'));
export const TodoDetail = lazyLoad(() => import('../pages/todo/TodoDetail'));
export const TodoForm = lazyLoad(() => import('../pages/todo/TodoForm'));
export const TodoSearch = lazyLoad(() => import('../pages/todo/TodoSearch'));

export const CalendarView = lazyLoad(() => import('../pages/calendar/CalendarView'));
export const DayTodos = lazyLoad(() => import('../pages/calendar/DayTodos'));

export const StatsOverview = lazyLoad(() => import('../pages/stats/StatsOverview'));

export const ComboList = lazyLoad(() => import('../pages/combo/ComboList'));
export const ComboEdit = lazyLoad(() => import('../pages/combo/ComboEdit'));
export const ComboDetail = lazyLoad(() => import('../pages/combo/ComboDetail'));

export const CollabJoin = lazyLoad(() => import('../pages/collab/CollabJoin'));

export const TagManage = lazyLoad(() => import('../pages/tag/TagManage'));

export const DataManage = lazyLoad(() => import('../pages/data/DataManage'));
export const Trash = lazyLoad(() => import('../pages/data/Trash'));

export const UserCenter = lazyLoad(() => import('../pages/user/UserCenter'));

export const Notice = lazyLoad(() => import('../pages/system/Notice'));
export const Changelog = lazyLoad(() => import('../pages/system/Changelog'));

// Admin pages
export const AdminDashboard = lazyLoad(() => import('../pages/admin/AdminDashboard'));
export const AdminUsers = lazyLoad(() => import('../pages/admin/AdminUsers'));
export const AdminNotices = lazyLoad(() => import('../pages/admin/AdminNotices'));
export const AdminChangelog = lazyLoad(() => import('../pages/admin/AdminChangelog'));
export const AdminComments = lazyLoad(() => import('../pages/admin/AdminComments'));
export const AdminDatabase = lazyLoad(() => import('../pages/admin/AdminDatabase'));
export const AdminConfig = lazyLoad(() => import('../pages/admin/AdminConfig'));
