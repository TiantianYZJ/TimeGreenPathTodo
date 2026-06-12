import { create } from 'zustand';
import { todoApi } from '../services';
import type { Todo, TodoFilter, CreateTodoData, UpdateTodoData } from '../types';

interface TodoState {
  todos: Todo[];
  deletedTodos: Todo[];
  filter: TodoFilter;
  selectedIds: Set<string>;
  isLoading: boolean;
  error: string | null;
}

interface TodoActions {
  fetchTodos: () => Promise<void>;
  fetchDeleted: () => Promise<void>;
  createTodo: (data: CreateTodoData) => Promise<Todo | null>;
  updateTodo: (id: string, data: UpdateTodoData) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  batchDelete: (ids: string[]) => Promise<void>;
  batchMoveToCombo: (ids: string[], comboId: number) => Promise<void>;
  restoreTodo: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  setFilter: (filter: Partial<TodoFilter>) => void;
  clearFilter: () => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  getFilteredTodos: () => Todo[];
}

const defaultFilter: TodoFilter = {
  status: 'all',
  comboId: null,
  tagIds: [],
  dateRange: undefined,
  keyword: '',
};

export const useTodoStore = create<TodoState & TodoActions>()((set, get) => ({
  todos: [],
  deletedTodos: [],
  filter: { ...defaultFilter },
  selectedIds: new Set(),
  isLoading: false,
  error: null,

  fetchTodos: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await todoApi.getList({ pageSize: 1000 });
      if (res.success) {
        set({ todos: res.todos || [] });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDeleted: async () => {
    try {
      const res = await todoApi.getDeleted();
      if (res.success) {
        set({ deletedTodos: res.todos || [] });
      }
    } catch {
      // handled
    }
  },

  createTodo: async (data) => {
    try {
      const res = await todoApi.create(data);
      if (res.success && res.todo) {
        set((state) => ({ todos: [res.todo!, ...state.todos] }));
        return res.todo;
      }
    } catch {
      // handled
    }
    return null;
  },

  updateTodo: async (id, data) => {
    const { todos } = get();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    // Optimistic update
    const updated = { ...todo, ...data, updatedAt: new Date().toISOString() };
    set({ todos: todos.map((t) => (t.id === id ? updated : t)) });

    try {
      await todoApi.update(id, { ...data, version: todo.version });
    } catch {
      // Rollback
      set({ todos: todos.map((t) => (t.id === id ? todo : t)) });
    }
  },

  deleteTodo: async (id) => {
    const { todos } = get();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    set({ todos: todos.filter((t) => t.id !== id) });

    try {
      await todoApi.delete(id);
    } catch {
      // Rollback
      set({ todos: [...todos] });
    }
  },

  toggleComplete: async (id) => {
    const { todos } = get();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const newCompleted = todo.completed > 0 ? 0 : Date.now();
    const updated = { ...todo, completed: newCompleted, updatedAt: new Date().toISOString() };
    set({ todos: todos.map((t) => (t.id === id ? updated : t)) });

    try {
      await todoApi.update(id, { completed: newCompleted, version: todo.version });
    } catch {
      set({ todos: todos.map((t) => (t.id === id ? todo : t)) });
    }
  },

  toggleStar: async (id) => {
    const { todos } = get();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const updated = { ...todo, isStar: !todo.isStar, updatedAt: new Date().toISOString() };
    set({ todos: todos.map((t) => (t.id === id ? updated : t)) });

    try {
      await todoApi.update(id, { isStar: !todo.isStar, version: todo.version });
    } catch {
      set({ todos: todos.map((t) => (t.id === id ? todo : t)) });
    }
  },

  batchDelete: async (ids) => {
    const { todos } = get();
    set({ todos: todos.filter((t) => !ids.includes(t.id)), selectedIds: new Set() });

    try {
      await Promise.all(ids.map((id) => todoApi.delete(id)));
    } catch {
      set({ todos });
    }
  },

  batchMoveToCombo: async (ids, comboId) => {
    try {
      await todoApi.batchMove(ids, comboId);
      const { todos } = get();
      set({
        todos: todos.map((t) =>
          ids.includes(t.id) ? { ...t, comboId } : t
        ),
        selectedIds: new Set(),
      });
    } catch {
      // handled
    }
  },

  restoreTodo: async (id) => {
    try {
      await todoApi.restore(id);
      set((state) => ({
        deletedTodos: state.deletedTodos.filter((t) => t.id !== id),
      }));
    } catch {
      // handled
    }
  },

  permanentDelete: async (id) => {
    try {
      await todoApi.permanentDelete(id);
      set((state) => ({
        deletedTodos: state.deletedTodos.filter((t) => t.id !== id),
      }));
    } catch {
      // handled
    }
  },

  setFilter: (filter) => {
    set((state) => ({ filter: { ...state.filter, ...filter } }));
  },

  clearFilter: () => set({ filter: { ...defaultFilter } }),

  toggleSelect: (id) => {
    set((state) => {
      const newSet = new Set(state.selectedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedIds: newSet };
    });
  },

  selectAll: () => {
    const filtered = get().getFilteredTodos();
    set({ selectedIds: new Set(filtered.map((t) => t.id)) });
  },

  clearSelection: () => set({ selectedIds: new Set() }),

  getFilteredTodos: () => {
    const { todos, filter } = get();
    let result = todos.filter((t) => !t.isDeleted);

    if (filter.status === 'completed') {
      result = result.filter((t) => t.completed > 0);
    } else if (filter.status === 'uncompleted') {
      result = result.filter((t) => t.completed === 0);
    }

    if (filter.comboId !== null && filter.comboId !== undefined) {
      result = result.filter((t) => t.comboId === filter.comboId);
    }

    if (filter.tagIds && filter.tagIds.length > 0) {
      result = result.filter((t) =>
        filter.tagIds!.some((tagId) => t.tags.includes(tagId))
      );
    }

    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase();
      result = result.filter(
        (t) =>
          t.text.toLowerCase().includes(kw) ||
          (t.remarks && t.remarks.toLowerCase().includes(kw))
      );
    }

    return result;
  },
}));
