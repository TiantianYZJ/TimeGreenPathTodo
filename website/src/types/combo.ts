import type { SharedTodo } from './collab';

export interface ComboMember {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Combo {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  isShared: boolean;
  shareCode: string | null;
  memberLimit: number;
  todoCount: number;
  memberCount: number;
  userRole: 'owner' | 'admin' | 'member' | null;
  createdAt: string;
  members?: ComboMember[];
  sharedTodos?: SharedTodo[];
}

export interface CreateComboData {
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  isShared?: boolean;
  memberLimit?: number;
  todoIds?: string[];
}

export interface UpdateComboData {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
  memberLimit?: number;
}
