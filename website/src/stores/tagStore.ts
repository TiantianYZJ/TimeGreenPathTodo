import { create } from 'zustand';
import { tagApi } from '../services';
import type { Tag, CreateTagData, UpdateTagData } from '../types';

interface TagState {
  systemTags: Tag[];
  userTags: Tag[];
  isLoading: boolean;
}

interface TagActions {
  fetchAllTags: () => Promise<void>;
  createTag: (data: CreateTagData) => Promise<void>;
  updateTag: (id: number, data: UpdateTagData) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
  getAllTags: () => Tag[];
  getTagById: (id: number) => Tag | undefined;
}

export const useTagStore = create<TagState & TagActions>()((set, get) => ({
  systemTags: [],
  userTags: [],
  isLoading: false,

  fetchAllTags: async () => {
    set({ isLoading: true });
    try {
      const res = await tagApi.getList();
      if (res.success && res.tags) {
        const system = res.tags.filter((t: Tag) => t.isSystem);
        const user = res.tags.filter((t: Tag) => !t.isSystem);
        set({ systemTags: system, userTags: user });
      }
    } catch {
      // handled
    } finally {
      set({ isLoading: false });
    }
  },

  createTag: async (data) => {
    try {
      const res = await tagApi.create(data);
      if (res.success && res.tag) {
        set((state) => ({ userTags: [...state.userTags, res.tag!] }));
      }
    } catch {
      // handled
    }
  },

  updateTag: async (id, data) => {
    try {
      await tagApi.update(id, data);
      set((state) => ({
        userTags: state.userTags.map((t) =>
          t.id === id ? { ...t, ...data } : t
        ),
      }));
    } catch {
      // handled
    }
  },

  deleteTag: async (id) => {
    try {
      await tagApi.delete(id);
      set((state) => ({
        userTags: state.userTags.filter((t) => t.id !== id),
      }));
    } catch {
      // handled
    }
  },

  getAllTags: () => [...get().systemTags, ...get().userTags],

  getTagById: (id) => {
    const { systemTags, userTags } = get();
    return systemTags.find((t) => t.id === id) || userTags.find((t) => t.id === id);
  },
}));
