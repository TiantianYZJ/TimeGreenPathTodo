/**
 * 标签状态管理 Store
 *
 * 管理系统预设标签和用户自定义标签的完整生命周期：
 * 获取列表、创建、更新、删除、合并查询等
 */

import { create } from 'zustand';
import { tagApi } from '@/services';
import type {
  Tag,
  CreateTagData,
  UpdateTagData,
} from '@/types/tag';
import type { TagListResponse, TagOperationResponse } from '@/services/api/types';

// ==================== 类型定义 ====================

/** TagStore 状态接口 */
interface TagState {
  /** 系统预设标签列表（只读，不可编辑/删除） */
  systemTags: Tag[];
  /** 用户自定义标签列表（可增删改） */
  userTags: Tag[];
  /** 是否正在加载数据 */
  isLoading: boolean;
}

/** TagStore Actions 接口 */
interface TagActions {
  // ==================== 数据获取 ====================

  /**
   * 获取系统预设标签
   * 从服务端获取所有系统预设标签（is_system = true）
   * @throws API 请求失败时抛出错误
   */
  fetchSystemTags: () => Promise<void>;

  /**
   * 获取用户自定义标签
   * 从服务端获取当前用户创建的所有自定义标签
   * @throws API 请求失败时抛出错误
   */
  fetchUserTags: () => Promise<void>;

  /**
   * 同时获取系统和用户标签
   * 一次调用获取全部标签数据
   * @throws API 请求失败时抛出错误
   */
  fetchAllTags: () => Promise<void>;

  // ==================== 标签 CRUD（仅对用户标签有效） ====================

  /**
   * 创建新的自定义标签
   * 创建成功后将新标签添加到 userTags 列表尾部
   * @param data 标签创建数据（名称、颜色、图标）
   * @returns 创建后的完整标签对象
   * @throws 创建失败时抛出错误
   */
  createTag: (data: CreateTagData) => Promise<Tag>;

  /**
   * 更新指定标签信息
   * 注意：仅允许更新用户自定义标签，系统预设标签不可修改
   * 更新成功后同步更新本地 userTags 列表中的对应项
   * @param id 标签 ID
   * @param data 需要更新的字段
   * @returns 更新后的标签对象
   * @throws 更新失败或尝试更新系统标签时抛出错误
   */
  updateTag: (id: number, data: UpdateTagData) => Promise<Tag>;

  /**
   * 删除指定的自定义标签
   * 注意：仅允许删除用户自定义标签，系统预设标签不可删除
   * 删除前应确保没有待办使用该标签
   * 删除成功后从 userTags 列表中移除该标签
   * @param id 标签 ID
   * @throws 删除失败或尝试删除系统标签时抛出错误
   */
  deleteTag: (id: number) => Promise<void>;

  // ==================== 查询辅助方法 ====================

  /**
   * 获取所有标签的合并列表（系统 + 用户）
   * 系统标签在前，用户标签在后
   * @returns 合并后的标签数组
   */
  getAllTags: () => Tag[];

  /**
   * 根据 ID 查找标签
   * 先在系统标签中查找，再在用户标签中查找
   * @param id 标签 ID
   * @returns 找到的标签对象，未找到返回 undefined
   */
  getTagById: (id: number) => Tag | undefined;

  /**
   * 根据 ID 查找标签名称
   * 用于在待办列表等场景展示标签名
   * @param id 标签 ID
   * @returns 标签名称，未找到返回空字符串
   */
  getTagNameById: (id: number) => string;

  /**
   * 检查是否为系统预设标签
   * @param id 标签 ID
   * @returns 是否为系统标签
   */
  isSystemTag: (id: number) => boolean;

  /**
   * 重置所有标签数据为初始状态
   * 通常用于登出时清理数据
   */
  resetTags: () => void;
}

/** TagStore 完整类型 */
type TagStore = TagState & TagActions;

// ==================== 初始状态 ====================

const initialState: TagState = {
  systemTags: [],
  userTags: [],
  isLoading: false,
};

// ==================== Store 创建 ====================

export const useTagStore = create<TagStore>()((set, get) => ({
  // ---------- 初始状态 ----------
  ...initialState,

  // ---------- 数据获取 ----------

  /**
   * 获取系统预设标签
   * 从统一 tags 数组中过滤 isSystem === true 的标签
   */
  fetchSystemTags: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const response: TagListResponse = await tagApi.getList();
      // 后端返回 { tags: [...] }，每个标签有 isSystem 字段标识类型
      const allTags = response.tags ?? [];
      set({
        systemTags: allTags.filter(tag => tag.is_system),
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * 获取用户自定义标签
   * 从统一 tags 数组中过滤 isSystem === false 的标签
   */
  fetchUserTags: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const response: TagListResponse = await tagApi.getList();
      // 后端返回 { tags: [...] }，每个标签有 isSystem 字段标识类型
      const allTags = response.tags ?? [];
      set({
        userTags: allTags.filter(tag => !tag.is_system),
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * 一次性获取全部标签
   * 推荐在应用初始化时调用此方法一次性加载所有标签
   * 从统一 tags 数组中根据 isSystem 字段分离系统和用户标签
   */
  fetchAllTags: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const response: TagListResponse = await tagApi.getList();
      // 后端返回 { tags: [...] }，每个标签有 isSystem 字段标识类型
      const allTags = response.tags ?? [];
      set({
        systemTags: allTags.filter(tag => tag.is_system),
        userTags: allTags.filter(tag => !tag.is_system),
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // ---------- 标签 CRUD ----------

  /**
   * 创建自定义标签
   */
  createTag: async (data: CreateTagData): Promise<Tag> => {
    set({ isLoading: true });
    try {
      const response: TagOperationResponse = await tagApi.create(data);
      const newTag = response.tag;

      set((state) => ({
        userTags: [...state.userTags, newTag],
        isLoading: false,
      }));

      return newTag;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * 更新标签
   * 安全检查：不允许更新系统预设标签
   */
  updateTag: async (id: number, data: UpdateTagData): Promise<Tag> => {
    // 安全检查：不允许修改系统标签
    if (get().isSystemTag(id)) {
      throw new Error('不允许修改系统预设标签');
    }

    set({ isLoading: true });
    try {
      const response: TagOperationResponse = await tagApi.update(id, data);
      const updatedTag = response.tag;

      set((state) => ({
        userTags: state.userTags.map((tag) =>
          tag.id === id ? updatedTag : tag
        ),
        isLoading: false,
      }));

      return updatedTag;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * 删除标签
   * 安全检查：不允许删除系统预设标签
   */
  deleteTag: async (id: number): Promise<void> => {
    // 安全检查：不允许删除系统标签
    if (get().isSystemTag(id)) {
      throw new Error('不允许删除系统预设标签');
    }

    set({ isLoading: true });
    try {
      await tagApi.delete(id);

      set((state) => ({
        userTags: state.userTags.filter((tag) => tag.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // ---------- 查询辅助方法 ----------

  /**
   * 获取合并后的所有标签
   * 系统标签在前，用户标签在后
   */
  getAllTags: (): Tag[] => {
    const { systemTags, userTags } = get();
    return [...systemTags, ...userTags];
  },

  /**
   * 根据 ID 查找标签
   */
  getTagById: (id: number): Tag | undefined => {
    const { systemTags, userTags } = get();
    return (
      systemTags.find((tag) => tag.id === id) ??
      userTags.find((tag) => tag.id === id)
    );
  },

  /**
   * 根据 ID 获取标签名称
   */
  getTagNameById: (id: number): string => {
    const tag = get().getTagById(id);
    return tag?.name ?? '';
  },

  /**
   * 检查是否为系统预设标签
   */
  isSystemTag: (id: number): boolean => {
    const { systemTags } = get();
    return systemTags.some((tag) => tag.id === id);
  },

  /**
   * 重置所有标签数据
   */
  resetTags: (): void => {
    set({
      systemTags: [],
      userTags: [],
      isLoading: false,
    });
  },
}));

// ==================== 选择器 Hooks ====================

/** 获取系统预设标签 */
export const useSystemTags = (): Tag[] =>
  useTagStore((state) => state.systemTags);

/** 获取用户自定义标签 */
export const useUserTags = (): Tag[] =>
  useTagStore((state) => state.userTags);

/** 获取所有标签（系统 + 用户） */
export const useAllTags = (): Tag[] =>
  useTagStore((state) => [...state.systemTags, ...state.userTags]);

/** 获取标签加载状态 */
export const useTagLoading = (): boolean =>
  useTagStore((state) => state.isLoading);

/** 获取标签总数 */
export const useTagTotalCount = (): number =>
  useTagStore(
    (state) => state.systemTags.length + state.userTags.length
  );
