/**
 * 组合状态管理 Store
 *
 * 管理私有组合和共享组合的完整生命周期：
 * 获取列表、创建、更新、删除、当前选中组合等
 */

import { create } from 'zustand';
import { comboApi } from '@/services';
import type {
  Combo,
  CreateComboData,
  UpdateComboData,
} from '@/types/combo';
import type { ComboListResponse } from '@/services/api/types';

// ==================== 类型定义 ====================

/** ComboStore 状态接口 */
interface ComboState {
  /** 私有组合列表（用户自己创建的非共享组合） */
  combos: Combo[];
  /** 共享组合列表（用户加入的其他人创建的共享组合） */
  sharedCombos: Combo[];
  /** 当前选中的组合详情（用于组合详情页展示） */
  currentCombo: Combo | null;
  /** 是否正在加载数据 */
  isLoading: boolean;
}

/** ComboStore Actions 接口 */
interface ComboActions {
  // ==================== 私有组合操作 ====================

  /**
   * 获取私有组合列表
   * 从服务端获取用户创建的所有非共享组合
   * @throws API 请求失败时抛出错误
   */
  fetchCombos: () => Promise<void>;

  /**
   * 创建新组合
   * 创建成功后将新组合添加到 combos 列表尾部
   * @param data 组合创建数据（名称、图标、颜色等）
   * @returns 创建后的完整组合对象
   * @throws 创建失败时抛出错误
   */
  createCombo: (data: CreateComboData) => Promise<Combo>;

  /**
   * 更新指定组合信息
   * 更新成功后同步更新本地列表中对应项
   * @param id 组合 ID
   * @param data 需要更新的字段
   * @returns 更新后的组合对象
   * @throws 更新失败时抛出错误
   */
  updateCombo: (id: number, data: UpdateComboData) => Promise<Combo>;

  /**
   * 删除组合
   * 删除成功后从本地列表中移除该组合
   * 同时清除 currentCombo 如果删除的是当前选中项
   * @param id 组合 ID
   * @throws 删除失败时抛出错误
   */
  deleteCombo: (id: number) => Promise<void>;

  // ==================== 共享组合操作 ====================

  /**
   * 获取共享组合列表
   * 获取用户作为成员加入的所有共享组合
   * @throws API 请求失败时抛出错误
   */
  fetchSharedCombos: () => Promise<void>;

  // ==================== 当前选中操作 ====================

  /**
   * 设置当前选中的组合
   * 用于在组合详情页展示特定组合的信息
   * @param combo 组合对象，传入 null 可清除选中状态
   */
  setCurrentCombo: (combo: Combo | null) => void;

  /**
   * 根据ID设置当前选中组合
   * 先在本地列表中查找，找不到则调用API获取详情
   * @param id 组合 ID
   * @throws 未找到或请求失败时抛出错误
   */
  setCurrentComboById: (id: number) => Promise<void>;

  /** 清除当前选中组合 */
  clearCurrentCombo: () => void;

  // ==================== 辅助方法 ====================

  /**
   * 获取所有组合（私有 + 共享）的合并列表
   * @returns 所有组合的合并数组
   */
  getAllCombos: () => Combo[];

  /**
   * 根据 ID 查找组合
   * 先在私有组合中找，再在共享组合中找
   * @param id 组合 ID
   * @returns 找到的组合对象，未找到返回 undefined
   */
  getComboById: (id: number) => Combo | undefined;
}

/** ComboStore 完整类型 */
type ComboStore = ComboState & ComboActions;

// ==================== 初始状态 ====================

const initialState: ComboState = {
  combos: [],
  sharedCombos: [],
  currentCombo: null,
  isLoading: false,
};

// ==================== Store 创建 ====================

export const useComboStore = create<ComboStore>()((set, get) => ({
  // ---------- 初始状态 ----------
  ...initialState,

  // ---------- 私有组合操作 ----------

  /**
   * 获取私有组合列表
   */
  fetchCombos: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const response: ComboListResponse = await comboApi.getList();
      // 后端返回 { combos: [...] }，过滤掉共享组合（is_shared === 1）
      const allCombos = response.combos ?? [];
      set({
        combos: allCombos.filter((c) => c.is_shared !== 1),
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * 创建组合
   */
  createCombo: async (data: CreateComboData): Promise<Combo> => {
    set({ isLoading: true });
    try {
      const newCombo = await comboApi.create(data);
      set((state) => ({
        combos: [...state.combos, newCombo],
        isLoading: false,
      }));
      return newCombo;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * 更新组合
   */
  updateCombo: async (id: number, data: UpdateComboData): Promise<Combo> => {
    set({ isLoading: true });
    try {
      const updatedCombo = await comboApi.update(id, data);

      // 更新 combos 列表中的对应项
      set((state) => ({
        combos: state.combos.map((combo) =>
          combo.id === id ? updatedCombo : combo
        ),
        // 如果更新的就是当前选中项，也同步更新 currentCombo
        currentCombo:
          state.currentCombo?.id === id
            ? updatedCombo
            : state.currentCombo,
        isLoading: false,
      }));

      return updatedCombo;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * 删除组合
   */
  deleteCombo: async (id: number): Promise<void> => {
    set({ isLoading: true });
    try {
      await comboApi.delete(id);

      set((state) => ({
        combos: state.combos.filter((combo) => combo.id !== id),
        // 如果删除的是当前选中项，清除选中状态
        currentCombo:
          state.currentCombo?.id === id ? null : state.currentCombo,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // ---------- 共享组合操作 ----------

  /**
   * 获取共享组合列表
   */
  fetchSharedCombos: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      // 使用 collabApi 获取共享组合列表
      const { collabApi } = await import('@/services');
      const response = await collabApi.getSharedCombos();
      // 后端返回 { sharedCombos: [...] }
      set({
        sharedCombos: response.sharedCombos ?? [],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // ---------- 当前选中操作 ----------

  /**
   * 设置当前选中的组合
   */
  setCurrentCombo: (combo: Combo | null): void => {
    set({ currentCombo: combo });
  },

  /**
   * 根据 ID 设置当前选中组合
   * 本地找不到时调用 API 获取详情
   */
  setCurrentComboById: async (id: number): Promise<void> => {
    // 先在本地列表中查找
    const localCombo = get().getComboById(id);
    if (localCombo) {
      set({ currentCombo: localCombo });
      return;
    }

    // 本地没有，调用 API 获取详情
    set({ isLoading: true });
    try {
      const detail = await comboApi.getById(id);
      // API 返回 { combo: Combo, members: [...], sharedTodos: [...] }
      // 提取 .combo 作为当前组合
      const comboData = 'combo' in detail ? detail.combo : detail;
      set({
        currentCombo: comboData as unknown as Combo,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * 清除当前选中组合
   */
  clearCurrentCombo: (): void => {
    set({ currentCombo: null });
  },

  // ---------- 辅助方法 ----------

  /**
   * 获取所有组合（私有 + 共享）
   */
  getAllCombos: (): Combo[] => {
    const { combos, sharedCombos } = get();
    return [...combos, ...sharedCombos];
  },

  /**
   * 根据 ID 在所有组合中查找
   */
  getComboById: (id: number): Combo | undefined => {
    const { combos, sharedCombos } = get();
    return (
      combos.find((combo) => combo.id === id) ??
      sharedCombos.find((combo) => combo.id === id)
    );
  },
}));

// ==================== 选择器 Hooks ====================

/** 获取私有组合列表 */
export const useCombos = (): Combo[] =>
  useComboStore((state) => state.combos);

/** 获取共享组合列表 */
export const useSharedCombos = (): Combo[] =>
  useComboStore((state) => state.sharedCombos);

/** 获取当前选中组合 */
export const useCurrentCombo = (): Combo | null =>
  useComboStore((state) => state.currentCombo);

/** 获取组合加载状态 */
export const useComboLoading = (): boolean =>
  useComboStore((state) => state.isLoading);

/** 获取所有组合数量 */
export const useAllComboCount = (): number =>
  useComboStore((state) => state.combos.length + state.sharedCombos.length);
