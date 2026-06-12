import { create } from 'zustand';
import { comboApi, collabApi } from '../services';
import type { Combo, CreateComboData, UpdateComboData, ComboMember, SharedTodo, CollabRequest } from '../types';

interface ComboState {
  combos: Combo[];
  sharedCombos: Combo[];
  currentCombo: Combo | null;
  members: ComboMember[];
  joinRequests: CollabRequest[];
  isLoading: boolean;
}

interface ComboActions {
  fetchCombos: () => Promise<void>;
  fetchSharedCombos: () => Promise<void>;
  createCombo: (data: CreateComboData) => Promise<Combo | null>;
  updateCombo: (id: number, data: UpdateComboData) => Promise<void>;
  deleteCombo: (id: number, deleteTodos?: boolean) => Promise<void>;
  setCurrentCombo: (combo: Combo | null) => void;
  setCurrentComboById: (id: number) => Promise<void>;
  // Shared todo CRUD
  createSharedTodo: (comboId: number, data: {
    text: string;
    setDate?: string;
    setTime?: string;
    remarks?: string;
    assignType?: string;
    excludeType?: string;
    assignUserIds?: number[];
    images?: string[];
    location?: { name: string; address?: string; latitude: number; longitude: number } | null;
  }) => Promise<SharedTodo | null>;
  updateSharedTodo: (comboId: number, todoId: number, data: Record<string, unknown>) => Promise<void>;
  completeSharedTodo: (comboId: number, todoId: number) => Promise<void>;
  deleteSharedTodo: (comboId: number, todoId: number) => Promise<void>;
  // Member management
  fetchMembers: (comboId: number) => Promise<void>;
  setMemberRole: (comboId: number, userId: number, role: string) => Promise<void>;
  removeMember: (comboId: number, userId: number) => Promise<void>;
  leaveCombo: (comboId: number) => Promise<void>;
  // Join requests
  fetchJoinRequests: (comboId: number) => Promise<void>;
  approveRequest: (requestId: number) => Promise<void>;
  rejectRequest: (requestId: number) => Promise<void>;
}

export const useComboStore = create<ComboState & ComboActions>()((set, get) => ({
  combos: [],
  sharedCombos: [],
  currentCombo: null,
  members: [],
  joinRequests: [],
  isLoading: false,

  fetchCombos: async () => {
    set({ isLoading: true });
    try {
      const res = await comboApi.getList();
      if (res.success) {
        set({ combos: res.combos || [] });
      }
    } catch {
      // handled
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSharedCombos: async () => {
    try {
      const res = await collabApi.getSharedCombos();
      if (res.success) {
        set({ sharedCombos: res.combos || [] });
      }
    } catch {
      // handled
    }
  },

  createCombo: async (data) => {
    try {
      const res = await comboApi.create(data);
      if (res.success && res.combo) {
        set((state) => ({ combos: [res.combo!, ...state.combos] }));
        return res.combo;
      }
    } catch {
      // handled
    }
    return null;
  },

  updateCombo: async (id, data) => {
    try {
      const res = await comboApi.update(id, data);
      if (res.success) {
        set((state) => ({
          combos: state.combos.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
          currentCombo:
            state.currentCombo?.id === id
              ? { ...state.currentCombo, ...data }
              : state.currentCombo,
        }));
      }
    } catch {
      // handled
    }
  },

  deleteCombo: async (id, deleteTodos) => {
    try {
      await comboApi.delete(id, deleteTodos ? 'delete_todos' : undefined);
      set((state) => ({
        combos: state.combos.filter((c) => c.id !== id),
        sharedCombos: state.sharedCombos.filter((c) => c.id !== id),
        currentCombo: state.currentCombo?.id === id ? null : state.currentCombo,
      }));
    } catch {
      // handled
    }
  },

  setCurrentCombo: (combo) => set({ currentCombo: combo }),

  setCurrentComboById: async (id) => {
    // Try local first
    const local = get().combos.find((c) => c.id === id) || get().sharedCombos.find((c) => c.id === id);
    if (local) {
      set({ currentCombo: local });
      // Still fetch full detail to get members + sharedTodos
    }
    try {
      const res = await comboApi.getById(id);
      if (res.success) {
        set({ currentCombo: res.combo });
      }
    } catch {
      // handled
    }
  },

  // Shared todo CRUD
  createSharedTodo: async (comboId, data) => {
    try {
      const res = await collabApi.createSharedTodo(comboId, data);
      if (res.success && res.todo) {
        set((state) => {
          const combo = state.currentCombo;
          if (combo && combo.id === comboId) {
            return {
              currentCombo: {
                ...combo,
                sharedTodos: [...(combo.sharedTodos || []), res.todo!],
              },
            };
          }
          return {};
        });
        return res.todo;
      }
    } catch {
      // handled
    }
    return null;
  },

  updateSharedTodo: async (comboId, todoId, data) => {
    try {
      const res = await collabApi.updateSharedTodo(comboId, todoId, data);
      if (res.success) {
        set((state) => {
          const combo = state.currentCombo;
          if (combo && combo.id === comboId) {
            return {
              currentCombo: {
                ...combo,
                sharedTodos: (combo.sharedTodos || []).map((t) =>
                  t.id === todoId ? { ...t, ...data } : t
                ),
              },
            };
          }
          return {};
        });
      }
    } catch {
      // handled
    }
  },

  completeSharedTodo: async (comboId, todoId) => {
    try {
      const res = await collabApi.completeSharedTodo(comboId, todoId);
      if (res.success) {
        set((state) => {
          const combo = state.currentCombo;
          if (combo && combo.id === comboId) {
            return {
              currentCombo: {
                ...combo,
                sharedTodos: (combo.sharedTodos || []).map((t) =>
                  t.id === todoId ? { ...t, myCompletedAt: Date.now() } : t
                ),
              },
            };
          }
          return {};
        });
      }
    } catch {
      // handled
    }
  },

  deleteSharedTodo: async (comboId, todoId) => {
    try {
      const res = await collabApi.deleteSharedTodo(comboId, todoId);
      if (res.success) {
        set((state) => {
          const combo = state.currentCombo;
          if (combo && combo.id === comboId) {
            return {
              currentCombo: {
                ...combo,
                sharedTodos: (combo.sharedTodos || []).filter((t) => t.id !== todoId),
              },
            };
          }
          return {};
        });
      }
    } catch {
      // handled
    }
  },

  // Member management
  fetchMembers: async (comboId) => {
    try {
      const res = await comboApi.getMembers(comboId);
      if (res.success) {
        set({ members: res.members || [] });
      }
    } catch {
      // handled
    }
  },

  setMemberRole: async (comboId, userId, role) => {
    try {
      const res = await comboApi.setMemberRole(comboId, userId, role);
      if (res.success) {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === userId ? { ...m, role: role as ComboMember['role'] } : m
          ),
        }));
      }
    } catch {
      // handled
    }
  },

  removeMember: async (comboId, userId) => {
    try {
      const res = await collabApi.removeMember(comboId, userId);
      if (res.success) {
        set((state) => ({
          members: state.members.filter((m) => m.id !== userId),
        }));
      }
    } catch {
      // handled
    }
  },

  leaveCombo: async (comboId) => {
    try {
      const res = await collabApi.leave(comboId);
      if (res.success) {
        set((state) => ({
          sharedCombos: state.sharedCombos.filter((c) => c.id !== comboId),
          currentCombo: state.currentCombo?.id === comboId ? null : state.currentCombo,
        }));
      }
    } catch {
      // handled
    }
  },

  // Join requests
  fetchJoinRequests: async (comboId) => {
    try {
      const res = await collabApi.getRequests(comboId);
      if (res.success) {
        set({ joinRequests: res.requests || [] });
      }
    } catch {
      // handled
    }
  },

  approveRequest: async (requestId) => {
    try {
      const res = await collabApi.approveRequest(requestId);
      if (res.success) {
        set((state) => ({
          joinRequests: state.joinRequests.filter((r) => r.id !== requestId),
        }));
      }
    } catch {
      // handled
    }
  },

  rejectRequest: async (requestId) => {
    try {
      const res = await collabApi.rejectRequest(requestId);
      if (res.success) {
        set((state) => ({
          joinRequests: state.joinRequests.filter((r) => r.id !== requestId),
        }));
      }
    } catch {
      // handled
    }
  },
}));
