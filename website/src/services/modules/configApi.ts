import { request } from '../api/client';
import type { ApiResponse } from '../../types';

export interface PublicStats {
  userCount: number;
  todoCount: number;
  completedTodoCount: number;
  completionRate: number;
  comboCount: number;
  sharedComboCount: number;
  sharedTodoCount: number;
  memberCount: number;
  commentCount: number;
  todayNewUsers: number;
  todayNewTodos: number;
  activeUsers7Days: number;
  latestVersion: string;
}

export interface HourlyStats {
  hourlyDistribution: { hour: number; hourLabel: string; count: number }[];
  peakHours: { hour: number; hourLabel: string; count: number }[];
  totalTodos: number;
  avgPerHour: number;
  period: string;
}

export interface Notice {
  title: string;
  content: string;
  date?: string;
}

export interface ChangelogItem {
  version: string;
  date: string;
  content: string[];
}

export const configApi = {
  getChangelog: () =>
    request.get<ApiResponse<{ changelogList: ChangelogItem[] }>>('/config/updates'),

  getNotices: () =>
    request.get<ApiResponse<{ notices: Notice[] }>>('/config/notices'),

  getAppConfig: () =>
    request.get<ApiResponse<{ changelogList: ChangelogItem[]; notices: Notice[] }>>('/config/app'),

  getPublicStats: () =>
    request.get<ApiResponse<{ stats: PublicStats }>>('/config/public-stats'),

  getPublicTags: () =>
    request.get<ApiResponse<{ tags: unknown[] }>>('/config/public-tags'),

  getPublicUsers: (page?: number, pageSize?: number) =>
    request.get<ApiResponse<{ users: unknown[]; total: number }>>('/config/public-users', {
      params: { page: page || 1, pageSize: pageSize || 20 },
    }),

  getHourlyStats: () =>
    request.get<ApiResponse<{ data: HourlyStats }>>('/config/public-stats/hourly'),
};
