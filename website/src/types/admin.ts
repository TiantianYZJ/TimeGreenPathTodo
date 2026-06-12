export interface AdminStats {
  userCount: number;
  todoCount: number;
  completedTodoCount: number;
  completionRate: number;
  comboCount: number;
  sharedComboCount: number;
  todayNewUsers: number;
  todayNewTodos: number;
  activeUsers7Days: number;
  latestVersion: string;
}

export interface AdminUser {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  todoLimit: number;
  comboLimit: number;
  collabLimit: number;
  todoCount: number;
  createdAt: string;
}

export interface AdminNotice {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminChangelog {
  version: string;
  date: string;
  content: string[];
}

export interface AdminComment {
  id: number;
  content: string;
  userId: number;
  nickname: string;
  sharedTodoId: number;
  createdAt: string;
}

export interface TableInfo {
  name: string;
  columns: string[];
  rows: Record<string, unknown>[];
  total: number;
}
