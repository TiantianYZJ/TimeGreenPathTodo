import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useUIStore } from './stores';
import { getThemeConfig } from './styles/theme';
import AppLayout from './components/layout/AppLayout';
import AuthGuard from './components/auth/AuthGuard';
import {
  Login,
  NotFound,
  TodoList,
  TodoDetail,
  TodoForm,
  TodoSearch,
  CalendarView,
  DayTodos,
  StatsOverview,
  ComboList,
  ComboEdit,
  ComboDetail,
  CollabJoin,
  TagManage,
  DataManage,
  Trash,
  UserCenter,
  Notice,
  Changelog,
  AdminDashboard,
  AdminUsers,
  AdminNotices,
  AdminChangelog,
  AdminComments,
  AdminDatabase,
  AdminConfig,
} from './config/routes';

export default function App() {
  const themeMode = useUIStore((s) => s.themeMode);
  const themeConfig = getThemeConfig(themeMode === 'dark');

  return (
    <ConfigProvider theme={themeConfig} locale={zhCN}>
      <BrowserRouter>
        <Routes>
          {/* Auth pages (no layout) */}
          <Route path="/login" element={<Login />} />

          {/* Main pages (with layout + auth) */}
          <Route
            path="/*"
            element={
              <AuthGuard>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<TodoList />} />
                    <Route path="/todo/new" element={<TodoForm />} />
                    <Route path="/todo/:id" element={<TodoDetail />} />
                    <Route path="/todo/:id/edit" element={<TodoForm />} />
                    <Route path="/search" element={<TodoSearch />} />
                    <Route path="/calendar" element={<CalendarView />} />
                    <Route path="/calendar/:date" element={<DayTodos />} />
                    <Route path="/stats" element={<StatsOverview />} />
                    <Route path="/combos" element={<ComboList />} />
                    <Route path="/combos/new" element={<ComboEdit />} />
                    <Route path="/combos/:id" element={<ComboDetail />} />
                    <Route path="/combos/:id/edit" element={<ComboEdit />} />
                    <Route path="/collab/join" element={<CollabJoin />} />
                    <Route path="/tags" element={<TagManage />} />
                    <Route path="/data" element={<DataManage />} />
                    <Route path="/trash" element={<Trash />} />
                    <Route path="/user" element={<UserCenter />} />
                    <Route path="/notice" element={<Notice />} />
                    <Route path="/changelog" element={<Changelog />} />

                    {/* Admin routes */}
                    <Route
                      path="/admin"
                      element={
                        <AuthGuard requireAdmin>
                          <AdminDashboard />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <AuthGuard requireAdmin>
                          <AdminUsers />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/admin/notices"
                      element={
                        <AuthGuard requireAdmin>
                          <AdminNotices />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/admin/changelog"
                      element={
                        <AuthGuard requireAdmin>
                          <AdminChangelog />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/admin/comments"
                      element={
                        <AuthGuard requireAdmin>
                          <AdminComments />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/admin/database"
                      element={
                        <AuthGuard requireAdmin>
                          <AdminDatabase />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/admin/config"
                      element={
                        <AuthGuard requireAdmin>
                          <AdminConfig />
                        </AuthGuard>
                      }
                    />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
