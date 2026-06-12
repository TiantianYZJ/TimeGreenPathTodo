import { request } from '../api/client';
import type { ApiResponse } from '../../types';
import type { AdminStats, AdminUser, AdminNotice, AdminComment } from '../../types';

// Actual backend response shapes (each endpoint wraps differently)

interface AdminChangelogResponse {
  success: boolean;
  changelog: Array<{ version: string; date: string; content: string[] }>;
}

interface AdminConfigResponse {
  success: boolean;
  data: { adminIds: number[] };
}

interface AdminUsersResponse {
  success: boolean;
  data: { list: AdminUser[]; total: number; page: number; pageSize: number };
}

interface AdminCommentsResponse {
  success: boolean;
  data: { list: AdminComment[]; total: number; page: number; pageSize: number };
}

interface AdminNoticesResponse {
  success: boolean;
  notices: AdminNotice[];
}

interface AdminStatsResponse {
  success: boolean;
  stats: AdminStats;
}

interface AdminTablesResponse {
  success: boolean;
  tables: string[];
}

interface AdminGenericResponse {
  success: boolean;
  data: unknown;
  [key: string]: unknown;
}

export const adminApi = {
  // Stats
  getStats: () =>
    request.get<AdminStatsResponse>('/admin/stats'),

  getRetentionStats: () =>
    request.get<AdminGenericResponse>('/admin/stats/retention'),

  getTagUsageStats: () =>
    request.get<AdminGenericResponse>('/admin/stats/tag-usage'),

  getUserTodoDistribution: () =>
    request.get<AdminGenericResponse>('/admin/stats/user-todo-distribution'),

  // Users — API returns { success, data: { list, total } }
  getUsers: (page?: number, pageSize?: number) =>
    request.get<AdminUsersResponse>('/admin/users', {
      params: { page: page || 1, pageSize: pageSize || 20 },
    }),

  getUserById: (id: number) =>
    request.get<ApiResponse<{ user: AdminUser }>>(`/admin/users/${id}`),

  updateUserLimits: (id: number, limits: {
    todoLimit?: number;
    comboLimit?: number;
    collabLimit?: number;
  }) =>
    request.put<ApiResponse>(`/admin/users/${id}/limits`, limits),

  updateUserNickname: (id: number, nickname: string) =>
    request.put<ApiResponse>(`/admin/users/${id}/nickname`, { nickname }),

  // Notices — API returns { success, notices: [...] }
  // NOTE: notice/index and update/delete use array index, not id
  getNotices: () =>
    request.get<AdminNoticesResponse>('/admin/notices'),

  createNotice: (data: { title: string; content: string }) =>
    request.post<ApiResponse>('/admin/notices', data),

  updateNotice: (index: number, data: { title?: string; content?: string; isActive?: boolean }) =>
    request.put<ApiResponse>(`/admin/notices/${index}`, data),

  deleteNotice: (index: number) =>
    request.delete<ApiResponse>(`/admin/notices/${index}`),

  // Changelog — API returns { success, changelog: [...] }
  // NOTE: update/delete use array index, not version
  getChangelog: () =>
    request.get<AdminChangelogResponse>('/admin/updates'),

  createChangelog: (data: { version: string; date: string; content: string[] }) =>
    request.post<ApiResponse>('/admin/updates', data),

  updateChangelog: (index: number, data: { version?: string; date?: string; content?: string[] }) =>
    request.put<ApiResponse>(`/admin/updates/${index}`, data),

  deleteChangelog: (index: number) =>
    request.delete<ApiResponse>(`/admin/updates/${index}`),

  // Comments — API returns { success, data: { list, total } }
  getComments: (page?: number, pageSize?: number) =>
    request.get<AdminCommentsResponse>('/admin/comments', {
      params: { page: page || 1, pageSize: pageSize || 20 },
    }),

  deleteComment: (id: number) =>
    request.delete<ApiResponse>(`/admin/comments/${id}`),

  // Database — API returns { success, tables: [...] }
  getTables: () =>
    request.get<AdminTablesResponse>('/admin/tables'),

  getTableData: (tableName: string, page?: number, pageSize?: number) =>
    request.get<ApiResponse>(`/admin/tables/${tableName}`, {
      params: { page: page || 1, pageSize: pageSize || 50 },
    }),

  // Config — API returns { success, data: { adminIds: [...] } }
  getConfig: () =>
    request.get<AdminConfigResponse>('/admin/config'),

  updateConfig: (data: { adminIds?: number[] }) =>
    request.put<ApiResponse>('/admin/config', data),
};
