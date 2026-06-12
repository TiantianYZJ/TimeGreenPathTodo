/**
 * 组合管理 Hook
 *
 * 封装 comboStore 的常用操作，提供完整的组合 CRUD 功能
 * 支持私有组合和共享组合的管理
 */

import { useCallback } from 'react';
import { useComboStore } from '@/stores/comboStore';
import type { Combo, CreateComboData, UpdateComboData } from '@/types/combo';

/**
 * UseCombo Hook 返回值接口
 */
interface UseComboReturn {
  // ==================== 状态 ====================

  /** 私有组合列表 */
  combos: Combo[];
  /** 共享组合列表 */
  sharedCombos: Combo[];
  /** 当前选中的组合详情（用于详情页展示） */
  currentCombo: Combo | null;
  /** 是否正在加载 */
  isLoading: boolean;

  // ==================== 私有组合操作 ====================

  /**
   * 获取私有组合列表
   */
  fetchCombos: () => Promise<void>;
  /**
   * 创建新组合
   * @param data 组合创建数据
   * @returns 创建后的组合对象
   */
  createCombo: (data: CreateComboData) => Promise<Combo>;
  /**
   * 更新组合信息
   * @param id 组合 ID
   * @param data 更新数据
   * @returns 更新后的组合对象
   */
  updateCombo: (id: number, data: UpdateComboData) => Promise<Combo>;
  /**
   * 删除组合
   * @param id 组合 ID
   */
  deleteCombo: (id: number) => Promise<void>;

  // ==================== 共享组合操作 ====================

  /**
   * 获取共享组合列表
   */
  fetchSharedCombos: () => Promise<void>;

  // ==================== 当前选中操作 ====================

  /**
   * 设置当前选中的组合
   * @param combo 组合对象，传入 null 可清除选中状态
   */
  setCurrentCombo: (combo: Combo | null) => void;
  /**
   * 根据 ID 设置当前选中组合
   * 本地找不到时调用 API 获取详情
   * @param id 组合 ID
   */
  setCurrentComboById: (id: number) => Promise<void>;
  /**
   * 清除当前选中组合
   */
  clearCurrentCombo: () => void;

  // ==================== 辅助方法 ====================

  /**
   * 获取所有组合（私有 + 共享）的合并列表
   */
  getAllCombos: () => Combo[];
  /**
   * 根据 ID 查找组合（先查私有，再查共享）
   * @param id 组合 ID
   * @returns 找到的组合对象，未找到返回 undefined
   */
  getComboById: (id: number) => Combo | undefined;
}

/**
 * 组合管理 Hook
 *
 * 提供完整的组合管理能力：
 * - 获取和管理私有组合列表
 * - 获取和管理共享组合列表
 * - 创建、更新、删除组合
 * - 管理当前选中的组合（用于详情页）
 * - 辅助查询方法
 *
 * 此 Hook 是组件中处理组合相关逻辑的主要入口，
 * 封装了 Store 的复杂性和错误处理逻辑。
 *
 * @returns 组合控制对象
 *
 * @example
 * ```tsx
 * function ComboList() {
 *   const {
 *     combos,
 *     sharedCombos,
 *     isLoading,
 *     createCombo,
 *     deleteCombo,
 *     setCurrentCombo
 *   } = useCombo();
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <h2>我的组合</h2>
 *       {combos.map(combo => (
 *         <ComboCard
 *           key={combo.id}
 *           combo={combo}
 *           onClick={() => setCurrentCombo(combo)}
 *           onDelete={() => deleteCombo(combo.id)}
 *         />
 *       ))}
 *
 *       <button onClick={() => createCombo({ name: '新组合', icon: 'folder', color: '#1677FF' })}>
 *         新建组合
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCombo(): UseComboReturn {
  // 从 Store 中获取状态和方法
  const combos = useComboStore((state) => state.combos);
  const sharedCombos = useComboStore((state) => state.sharedCombos);
  const currentCombo = useComboStore((state) => state.currentCombo);
  const isLoading = useComboStore((state) => state.isLoading);

  const storeFetchCombos = useComboStore((state) => state.fetchCombos);
  const storeCreateCombo = useComboStore((state) => state.createCombo);
  const storeUpdateCombo = useComboStore((state) => state.updateCombo);
  const storeDeleteCombo = useComboStore((state) => state.deleteCombo);
  const storeFetchSharedCombos = useComboStore((state) => state.fetchSharedCombos);
  const storeSetCurrentCombo = useComboStore((state) => state.setCurrentCombo);
  const storeSetCurrentComboById = useComboStore((state) => state.setCurrentComboById);
  const storeClearCurrentCombo = useComboStore((state) => state.clearCurrentCombo);
  const storeGetAllCombos = useComboStore((state) => state.getAllCombos);
  const storeGetComboById = useComboStore((state) => state.getComboById);

  /**
   * 获取私有组合列表（带错误处理）
   */
  const fetchCombos = useCallback(async (): Promise<void> => {
    try {
      await storeFetchCombos();
    } catch (error) {
      console.error('获取组合列表失败:', error);
      throw error;
    }
  }, [storeFetchCombos]);

  /**
   * 创建组合（带错误处理）
   */
  const createCombo = useCallback(
    async (data: CreateComboData): Promise<Combo> => {
      try {
        const newCombo = await storeCreateCombo(data);
        return newCombo;
      } catch (error) {
        console.error('创建组合失败:', error);
        throw error;
      }
    },
    [storeCreateCombo]
  );

  /**
   * 更新组合（带错误处理）
   */
  const updateCombo = useCallback(
    async (id: number, data: UpdateComboData): Promise<Combo> => {
      try {
        const updatedCombo = await storeUpdateCombo(id, data);
        return updatedCombo;
      } catch (error) {
        console.error('更新组合失败:', error);
        throw error;
      }
    },
    [storeUpdateCombo]
  );

  /**
   * 删除组合（带错误处理）
   */
  const deleteCombo = useCallback(
    async (id: number): Promise<void> => {
      try {
        await storeDeleteCombo(id);
      } catch (error) {
        console.error('删除组合失败:', error);
        throw error;
      }
    },
    [storeDeleteCombo]
  );

  /**
   * 获取共享组合列表（带错误处理）
   */
  const fetchSharedCombos = useCallback(async (): Promise<void> => {
    try {
      await storeFetchSharedCombos();
    } catch (error) {
      console.error('获取共享组合列表失败:', error);
      throw error;
    }
  }, [storeFetchSharedCombos]);

  /**
   * 设置当前选中组合
   */
  const setCurrentCombo = useCallback(
    (combo: Combo | null): void => {
      storeSetCurrentCombo(combo);
    },
    [storeSetCurrentCombo]
  );

  /**
   * 根据 ID 设置当前选中组合
   */
  const setCurrentComboById = useCallback(
    async (id: number): Promise<void> => {
      try {
        await storeSetCurrentComboById(id);
      } catch (error) {
        console.error('设置当前组合失败:', error);
        throw error;
      }
    },
    [storeSetCurrentComboById]
  );

  /**
   * 清除当前选中组合
   */
  const clearCurrentCombo = useCallback((): void => {
    storeClearCurrentCombo();
  }, [storeClearCurrentCombo]);

  /**
   * 获取所有组合的合并列表
   */
  const getAllCombos = useCallback((): Combo[] => {
    return storeGetAllCombos();
  }, [storeGetAllCombos]);

  /**
   * 根据 ID 查找组合
   */
  const getComboById = useCallback(
    (id: number): Combo | undefined => {
      return storeGetComboById(id);
    },
    [storeGetComboById]
  );

  return {
    // 状态
    combos,
    sharedCombos,
    currentCombo,
    isLoading,

    // 私有组合操作
    fetchCombos,
    createCombo,
    updateCombo,
    deleteCombo,

    // 共享组合操作
    fetchSharedCombos,

    // 当前选中操作
    setCurrentCombo,
    setCurrentComboById,
    clearCurrentCombo,

    // 辅助方法
    getAllCombos,
    getComboById,
  };
}
