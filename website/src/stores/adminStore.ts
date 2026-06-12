import { create } from 'zustand';
import { adminApi } from '../services';
import type { AdminStats, AdminUser, AdminNotice, AdminComment } from '../types';

interface ChangelogEntry {
  version: string;
  date: string;
  content: string[];
}

interface AdminConfig {
  adminIds: number[];
}

interface RetentionData {
  date: string;
  retained: number;
  total: number;
}

interface TagUsageData {
  tagId: number;
  tagName: string;
  usageCount: number;
}

interface UserTodoDistribution {
  userId: number;
  nickname: string;
  todoCount: number;
  completedCount: number;
}

interface AdminState {
  stats: AdminStats | null;
  retentionStats: RetentionData[];
  tagUsageStats: TagUsageData[];
  userTodoDistribution: UserTodoDistribution[];
  users: AdminUser[];
  usersTotal: number;
  notices: AdminNotice[];
  changelog: ChangelogEntry[];
  comments: AdminComment[];
  commentsTotal: number;
  tables: string[];
  config: AdminConfig | null;
  isLoading: boolean;
}

interface AdminActions {
  fetchStats: () => Promise<void>;
  fetchRetentionStats: () => Promise<void>;
  fetchTagUsageStats: () => Promise<void>;
  fetchUserTodoDistribution: () => Promise<void>;
  fetchUsers: (page?: number, pageSize?: number) => Promise<void>;
  updateUserLimits: (id: number, limits: Record<string, number>) => Promise<void>;
  fetchNotices: () => Promise<void>;
  createNotice: (data: { title: string; content: string }) => Promise<void>;
  updateNotice: (index: number, data: Record<string, unknown>) => Promise<void>;
  deleteNotice: (index: number) => Promise<void>;
  fetchChangelog: () => Promise<void>;
  createChangelog: (data: { version: string; date: string; content: string[] }) => Promise<void>;
  updateChangelog: (index: number, data: { version?: string; date?: string; content?: string[] }) => Promise<void>;
  deleteChangelog: (index: number) => Promise<void>;
  fetchComments: (page?: number, pageSize?: number) => Promise<void>;
  deleteComment: (id: number) => Promise<void>;
  fetchTables: () => Promise<void>;
  getTableData: (tableName: string, page?: number) => Promise<unknown>;
  fetchConfig: () => Promise<void>;
  updateConfig: (data: { adminIds?: number[] }) => Promise<void>;
}

export const useAdminStore = create<AdminState & AdminActions>()((set, get) => ({
  stats: null,
  retentionStats: [],
  tagUsageStats: [],
  userTodoDistribution: [],
  users: [],
  usersTotal: 0,
  notices: [],
  changelog: [],
  comments: [],
  commentsTotal: 0,
  tables: [],
  config: null,
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const res = await adminApi.getStats();
      if (res.success) set({ stats: res.stats });
    } catch {
      // handled
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRetentionStats: async () => {
    try {
      const res = await adminApi.getRetentionStats();
      if (res.success) set({ retentionStats: res.data || [] });
    } catch {
      // handled
    }
  },

  fetchTagUsageStats: async () => {
    try {
      const res = await adminApi.getTagUsageStats();
      if (res.success) set({ tagUsageStats: res.data || [] });
    } catch {
      // handled
    }
  },

  fetchUserTodoDistribution: async () => {
    try {
      const res = await adminApi.getUserTodoDistribution();
      if (res.success) set({ userTodoDistribution: res.data || [] });
    } catch {
      // handled
    }
  },

  // BUG FIX: API returns { success, data: { list, total } } not { success, users, total }
  fetchUsers: async (page, pageSize) => {
    try {
      const res = await adminApi.getUsers(page, pageSize);
      if (res.success) set({ users: res.data.list, usersTotal: res.data.total });
    } catch {
      // handled
    }
  },

  updateUserLimits: async (id, limits) => {
    await adminApi.updateUserLimits(id, limits);
  },

  fetchNotices: async () => {
    try {
      const res = await adminApi.getNotices();
      if (res.success) set({ notices: res.notices || [] });
    } catch {
      // handled
    }
  },

  createNotice: async (data) => {
    await adminApi.createNotice(data);
    // Refresh
    const res = await adminApi.getNotices();
    if (res.success) set({ notices: res.notices || [] });
  },

  // BUG FIX: API uses index-based endpoints (PUT /admin/notices/:index)
  updateNotice: async (index, data) => {
    await adminApi.updateNotice(index, data as { title?: string; content?: string; isActive?: boolean });
    const res = await adminApi.getNotices();
    if (res.success) set({ notices: res.notices || [] });
  },

  // BUG FIX: API uses index-based endpoints (DELETE /admin/notices/:index)
  deleteNotice: async (index) => {
    await adminApi.deleteNotice(index);
    set((s) => ({ notices: s.notices.filter((_, i) => i !== index) }));
  },

  // BUG FIX: Admin API returns { success, changelog } NOT { success, changelogList }
  fetchChangelog: async () => {
    try {
      const res = await adminApi.getChangelog();
      if (res.success) set({ changelog: res.changelog || [] });
    } catch {
      // handled
    }
  },

  createChangelog: async (data) => {
    await adminApi.createChangelog(data);
    const res = await adminApi.getChangelog();
    if (res.success) set({ changelog: res.changelog || [] });
  },

  // BUG FIX: API uses index-based endpoints (PUT /admin/updates/:index)
  updateChangelog: async (index, data) => {
    await adminApi.updateChangelog(index, data);
    const res = await adminApi.getChangelog();
    if (res.success) set({ changelog: res.changelog || [] });
  },

  // BUG FIX: API uses index-based endpoints (DELETE /admin/updates/:index)
  deleteChangelog: async (index) => {
    await adminApi.deleteChangelog(index);
    set((s) => ({ changelog: s.changelog.filter((_, i) => i !== index) }));
  },

  // BUG FIX: API returns { success, data: { list, total } } not { success, comments, total }
  fetchComments: async (page, pageSize) => {
    try {
      const res = await adminApi.getComments(page, pageSize);
      if (res.success) set({ comments: res.data.list, commentsTotal: res.data.total });
    } catch {
      // handled
    }
  },

  deleteComment: async (id) => {
    await adminApi.deleteComment(id);
    set((s) => ({ comments: s.comments.filter((c) => c.id !== id) }));
  },

  fetchTables: async () => {
    try {
      const res = await adminApi.getTables();
      if (res.success) set({ tables: res.tables });
    } catch {
      // handled
    }
  },

  getTableData: async (tableName, page) => {
    return adminApi.getTableData(tableName, page);
  },

  // BUG FIX: API returns { success, data: { adminIds } } not { success, config: { adminIds } }
  fetchConfig: async () => {
    try {
      const res = await adminApi.getConfig();
      if (res.success) set({ config: res.data });
    } catch {
      // handled
    }
  },

  updateConfig: async (data) => {
    await adminApi.updateConfig(data);
    const res = await adminApi.getConfig();
    if (res.success) set({ config: res.data });
  },
}));
